import React, { Component } from 'react';
import ProfileEditForm from './ProfileEditForm';
import AuthService from '../../classes/AuthService';
import ApiService from '../../classes/ApiService';
import EventBus from '../../classes/EventBus';
import '../../styles/profile.css';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      userPosts: [],
      isLoading: true,
      currentUser: AuthService.getCurrentUser() // Add user to state
    };

    // Bind methods
    this.handleToggleEdit = this.handleToggleEdit.bind(this);
    this.handleProfileUpdate = this.handleProfileUpdate.bind(this);
    this.loadUserPosts = this.loadUserPosts.bind(this);
  }

  async componentDidMount() {
    await this.loadUserPosts();
  }

  async loadUserPosts() {
    try {
      const currentUser = this.state.currentUser;
      const allPosts = await ApiService.get('/posts');
      
      // Filter posts by current user
      const userPosts = allPosts.filter(post => post.author._id === currentUser._id);
      
      this.setState({ 
        userPosts,
        isLoading: false 
      });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  handleToggleEdit() {
    this.setState(prevState => ({
      isEditing: !prevState.isEditing
    }));
  }

  handleProfileUpdate(updatedUser) {
    // Update local user data
    const currentUser = this.state.currentUser;
    const newUserData = { ...currentUser, ...updatedUser };
    
    localStorage.setItem('user', JSON.stringify(newUserData));
    
    // Update state with new user data
    this.setState({ 
      currentUser: newUserData,
      isEditing: false 
    });
    
    // Emit event to update header
    EventBus.emit('profile:updated', newUserData);
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
    const { isEditing, userPosts, isLoading, currentUser } = this.state;

    return (
      <div className="profile-page">
        <div className="profile-container">
          <header className="profile-header">
            <div className="profile-avatar-large">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1 className="profile-username">{currentUser.username}</h1>
              <p className="profile-email">{currentUser.email}</p>
              {currentUser.bio && (
                <p className="profile-bio">{currentUser.bio}</p>
              )}
            </div>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={this.handleToggleEdit}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </header>

          {isEditing && (
            <section className="profile-edit-section">
              <ProfileEditForm 
                user={currentUser}
                onUpdate={this.handleProfileUpdate}
                onCancel={this.handleToggleEdit}
              />
            </section>
          )}

          <section className="profile-posts-section">
            <h2 className="section-title">My Posts ({userPosts.length})</h2>
            
            {isLoading ? (
              <p className="loading-text">Loading posts...</p>
            ) : userPosts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">You haven't written any posts yet.</p>
              </div>
            ) : (
              <div className="profile-posts-list">
                {userPosts.map(post => (
                  <article key={post._id} className="profile-post-card">
                    <h3 className="profile-post-title">{post.title}</h3>
                    <p className="profile-post-excerpt">
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 ? '...' : ''}
                    </p>
                    <time className="profile-post-date">
                      {this.formatDate(post.createdAt)}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }
}

export default ProfilePage;