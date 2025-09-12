const jwt = require('jsonwebtoken');
const User = require('../models/User');

const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Join user's personal room
    socket.join(socket.userId.toString());

    // Join college room for broadcast messages
    if (socket.user.college) {
      socket.join(socket.user.college);
    }

    // Handle private messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text' } = data;
        
        // Here you would typically save the message to the database
        // and emit to the conversation participants
        
        const messageData = {
          conversationId,
          sender: socket.userId,
          content,
          messageType,
          timestamp: new Date()
        };

        // Emit to conversation participants
        io.to(conversationId).emit('new_message', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle online status
    socket.on('set_online_status', async (data) => {
      try {
        const { status } = data;
        await User.findByIdAndUpdate(socket.userId, { 
          onlineStatus: status,
          lastSeen: new Date()
        });
        
        // Broadcast to user's connections
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    });

    // Handle notifications
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        // Here you would typically mark the notification as read in the database
        console.log(`Notification ${notificationId} marked as read by ${socket.userId}`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
        
        // Update user's online status
        await User.findByIdAndUpdate(socket.userId, {
          onlineStatus: 'offline',
          lastSeen: new Date()
        });

        // Broadcast offline status
        socket.broadcast.emit('user_status_change', {
          userId: socket.userId,
          status: 'offline'
        });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  // Helper function to send notification to specific user
  const sendNotification = (userId, notification) => {
    io.to(userId.toString()).emit('new_notification', notification);
  };

  // Helper function to broadcast to college
  const broadcastToCollege = (college, event, data) => {
    io.to(college).emit(event, data);
  };

  // Make these functions available globally
  global.sendNotification = sendNotification;
  global.broadcastToCollege = broadcastToCollege;
};

module.exports = {
  handleSocketConnection
}; 