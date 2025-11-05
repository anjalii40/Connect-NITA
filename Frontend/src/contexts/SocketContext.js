import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Use REACT_APP_SOCKET_URL if set, otherwise fallback to REACT_APP_API_URL, then default
      const socketURL = process.env.REACT_APP_SOCKET_URL || 
        process.env.REACT_APP_API_URL ||
        (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      
      // Warn if socket URL is not set in production
      if (process.env.NODE_ENV === 'production' && !socketURL) {
        console.error('⚠️ Socket.IO URL is not set! Real-time features will not work. Please set REACT_APP_SOCKET_URL or REACT_APP_API_URL in Vercel environment variables.');
        return;
      }
      
      const newSocket = io(socketURL, {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      newSocket.on('message', (data) => {
        // Handle new message
        toast.success(`New message from ${data.sender.firstName}`);
        setNotifications(prev => [...prev, { type: 'message', data }]);
      });

      newSocket.on('referral_request', (data) => {
        // Handle new referral request
        toast.success(`New referral request from ${data.student.firstName}`);
        setNotifications(prev => [...prev, { type: 'referral', data }]);
      });

      newSocket.on('referral_response', (data) => {
        // Handle referral response
        const status = data.status === 'accepted' ? 'accepted' : 'declined';
        toast.success(`Your referral request was ${status}`);
        setNotifications(prev => [...prev, { type: 'referral_response', data }]);
      });

      newSocket.on('connection_request', (data) => {
        // Handle connection request
        toast.success(`New connection request from ${data.from.firstName}`);
        setNotifications(prev => [...prev, { type: 'connection', data }]);
      });

      newSocket.on('post_like', (data) => {
        // Handle post like
        toast.success(`${data.user.firstName} liked your post`);
        setNotifications(prev => [...prev, { type: 'like', data }]);
      });

      newSocket.on('post_comment', (data) => {
        // Handle post comment
        toast.success(`${data.user.firstName} commented on your post`);
        setNotifications(prev => [...prev, { type: 'comment', data }]);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Send message
  const sendMessage = (conversationId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', { conversationId, message });
    }
  };

  // Join conversation
  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', { conversationId });
    }
  };

  // Leave conversation
  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', { conversationId });
    }
  };

  // Mark message as read
  const markMessageAsRead = (conversationId, messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_read', { conversationId, messageId });
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Remove specific notification
  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const value = {
    socket,
    isConnected,
    notifications,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    clearNotifications,
    removeNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 