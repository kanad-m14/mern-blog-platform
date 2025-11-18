import React, { Component } from 'react';
import ApiService from '../../classes/ApiService';
import AuthService from '../../classes/AuthService';
import FormValidator from '../../classes/FormValidator';

class CommentSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      newComment: '',
      isLoading: true,
      isSubmitting: false,
      errors: {}
    };

    this.validator = new FormValidator();

    // Bind methods
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.loadComments = this.loadComments.bind(this);
  }

  async componentDidMount() {
    await this.loadComments();
  }

  async loadComments() {
    try {
      const comments = await ApiService.get(`/comments/${this.props.postId}`);
      this.setState({ comments, isLoading: false });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  handleInputChange(event) {
    this.setState({ 
      newComment: event.target.value,
      errors: {}
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { newComment } = this.state;
    const { postId } = this.props;

    // Validate comment
    const validation = this.validator.validateForm({
      comment: {
        value: newComment,
        rules: { required: true, minLength: 1 }
      }
    });

    if (!validation.isValid) {
      this.setState({ errors: validation.errors });
      return;
    }

    try {
      this.setState({ isSubmitting: true, errors: {} });
      
      const comment = await ApiService.post('/comments', {
        content: newComment,
        postId: postId
      });

      this.setState(prevState => ({
        comments: [comment, ...prevState.comments],
        newComment: '',
        isSubmitting: false
      }));
    } catch (error) {
      alert('Failed to post comment. Please try again.');
      this.setState({ isSubmitting: false });
    }
  }

  async handleDelete(commentId) {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await ApiService.delete(`/comments/${commentId}`);
      this.setState(prevState => ({
        comments: prevState.comments.filter(c => c._id !== commentId)
      }));
    } catch (error) {
      alert('Failed to delete comment. Please try again.');
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  render() {
    const { comments, newComment, isLoading, isSubmitting, errors } = this.state;
    const currentUser = AuthService.getCurrentUser();

    if (isLoading) {
      return <div className="comments-loading">Loading comments...</div>;
    }

    return (
      <section className="comment-section">
        <h4 className="comments-title">Comments ({comments.length})</h4>

        <form className="comment-form" onSubmit={this.handleSubmit}>
          <textarea
            className="comment-input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
            rows="3"
          />
          {errors.comment && (
            <span className="form-error">{errors.comment[0]}</span>
          )}
          <button 
            type="submit" 
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <article key={comment._id} className="comment">
                <div className="comment-header">
                  <div className="comment-author-info">
                    <div className="comment-avatar">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-meta">
                      <span className="comment-author">{comment.author.username}</span>
                      <time className="comment-time">{this.formatDate(comment.createdAt)}</time>
                    </div>
                  </div>
                  
                  {currentUser && currentUser._id === comment.author._id && (
                    <button 
                      type="button"
                      className="btn-delete-comment" 
                      onClick={() => this.handleDelete(comment._id)}
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment-content">{comment.content}</p>
              </article>
            ))
          )}
        </div>
      </section>
    );
  }
}

export default CommentSection;