import React, { Component } from 'react';
import AuthService from '../../classes/AuthService';
import ApiService from '../../classes/ApiService';
import CommentSection from './CommentSection';

class PostCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showComments: false,
      isDeleting: false
    };

    // Character limit for truncating posts
    this.CHARACTER_LIMIT = 300;

    // Bind methods
    this.handleToggleComments = this.handleToggleComments.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleToggleExpansion = this.handleToggleExpansion.bind(this);
  }

  handleToggleComments() {
    this.setState(prevState => ({
      showComments: !prevState.showComments
    }));
  }

  handleToggleExpansion(e) {
    e.stopPropagation();
    const { post, onToggleExpansion } = this.props;
    onToggleExpansion(post._id);
  }

  async handleDelete() {
    const { post, onDelete } = this.props;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      this.setState({ isDeleting: true });
      await ApiService.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (error) {
      alert('Failed to delete post. Please try again.');
      this.setState({ isDeleting: false });
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  render() {
    const { post, isExpanded } = this.props;
    const { showComments, isDeleting } = this.state;
    const currentUser = AuthService.getCurrentUser();
    const isAuthor = currentUser && currentUser._id === post.author._id;

    // Check if post is long enough to be truncated
    const isLongPost = post.content && post.content.length > this.CHARACTER_LIMIT;
    const displayContent = isExpanded || !isLongPost 
      ? post.content 
      : post.content.substring(0, this.CHARACTER_LIMIT) + '...';

    return (
      <article className="post-card">
        <header className="post-header">
          <div className="post-author-info">
            <div className="author-avatar">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <div className="author-details">
              <h3 className="author-name">{post.author.username}</h3>
              <time className="post-date">{this.formatDate(post.createdAt)}</time>
            </div>
          </div>

          {isAuthor && (
            <button 
              type="button"
              className="btn-delete" 
              onClick={this.handleDelete}
              disabled={isDeleting}
              aria-label="Delete post"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </header>

        <div className="post-content">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-text">{displayContent}</p>
          
          {isLongPost && (
            <button 
              type="button"
              className="post-expand-btn" 
              onClick={this.handleToggleExpansion}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <footer className="post-footer">
          <button 
            type="button"
            className="btn-comments" 
            onClick={this.handleToggleComments}
          >
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </footer>

        {showComments && (
          <CommentSection postId={post._id} />
        )}
      </article>
    );
  }
}

export default PostCard;