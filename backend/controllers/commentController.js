const Comment = require('../models/Comment');

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new comment
// @route   POST /api/comments
const createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user._id
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (comment) {
      // Check if user is the author
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await comment.deleteOne();
      res.json({ message: 'Comment removed' });
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCommentsByPost, createComment, deleteComment };