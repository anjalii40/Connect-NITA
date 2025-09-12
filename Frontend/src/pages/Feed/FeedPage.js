import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const FeedPage = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        position: 'Software Engineer at Google',
      },
      content: 'Just finished an amazing project at Google! The team collaboration was incredible and we learned so much. #tech #collaboration',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
    },
    {
      id: 2,
      author: {
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        position: 'Product Manager at Microsoft',
      },
      content: 'Excited to share that I\'ll be speaking at the upcoming tech conference about product management best practices. Looking forward to connecting with fellow alumni!',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 12,
      shares: 5,
      isLiked: true,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
      }
      return post;
    }));
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: {
        name: `${user?.firstName} ${user?.lastName}`,
        avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`,
        position: `${user?.position} at ${user?.company}`,
      },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmitPost}>
          <div className="flex space-x-4">
            <img
              className="h-12 w-12 rounded-full"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
              alt=""
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newPost.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={post.author.avatar}
                    alt=""
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {post.author.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.author.position}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {post.timestamp}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-gray-900 dark:text-white mb-4">
                {post.content}
              </p>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.isLiked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {post.isLiked ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ShareIcon className="h-5 w-5" />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage; 