const Post = require('../models/Post');
const User = require('../models/User');

// Create post
const createPost = async (req, res) => {
  try {
    const { content, hashtags, isPublic, mediaUrls } = req.body;
    
    const post = new Post({
      author: req.user.id,
      content,
      hashtags: hashtags || [],
      isPublic: isPublic !== false, // Default to true
      mediaUrls: mediaUrls || []
    });

    await post.save();
    await post.populate('author', 'name email profileImage college');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get posts
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, hashtag } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    
    if (author) {
      query.author = author;
    }
    
    if (hashtag) {
      query.hashtags = { $in: [hashtag] };
    }

    const posts = await Post.find(query)
      .populate('author', 'name email profileImage college')
      .populate('comments.author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profileImage college')
      .populate('comments.author', 'name email profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { content, hashtags, isPublic, mediaUrls } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.content = content || post.content;
    post.hashtags = hashtags || post.hashtags;
    post.isPublic = isPublic !== undefined ? isPublic : post.isPublic;
    post.mediaUrls = mediaUrls || post.mediaUrls;

    await post.save();
    await post.populate('author', 'name email profileImage college');

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlike post
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post not liked' });
    }

    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    await post.save();

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Comment on post
const commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user.id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'name email profileImage');

    res.json(post);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Share post
const sharePost = async (req, res) => {
  try {
    const { message } = req.body;
    
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const sharedPost = new Post({
      author: req.user.id,
      content: message || '',
      sharedPost: originalPost._id,
      isPublic: true
    });

    await sharedPost.save();
    await sharedPost.populate('author', 'name email profileImage college');
    await sharedPost.populate('sharedPost');

    res.status(201).json(sharedPost);
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pin post
const pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.isPinned = true;
    await post.save();

    res.json({ message: 'Post pinned successfully' });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unpin post
const unpinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.isPinned = false;
    await post.save();

    res.json({ message: 'Post unpinned successfully' });
  } catch (error) {
    console.error('Error unpinning post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Report post
const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Please provide a reason for reporting' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot report your own post' });
    }

    // Here you would typically save the report to a separate collection
    // For now, we'll just log it
    console.log('Post report:', {
      postId: req.params.id,
      reportedBy: req.user.id,
      reason,
      description,
      timestamp: new Date()
    });

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get posts by hashtag
const getPostsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      hashtags: { $in: [hashtag] },
      isPublic: true
    })
      .populate('author', 'name email profileImage college')
      .populate('comments.author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({
      hashtags: { $in: [hashtag] },
      isPublic: true
    });

    res.json({
      posts,
      hashtag,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts by hashtag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  commentOnPost,
  deleteComment,
  sharePost,
  pinPost,
  unpinPost,
  reportPost,
  getPostsByHashtag
}; 