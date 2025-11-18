import React, { Component } from 'react';
import ApiService from '../../classes/ApiService';
import FormValidator from '../../classes/FormValidator';

class ProfileEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.user.username || '',
      email: props.user.email || '',
      bio: props.user.bio || '',
      password: '',
      confirmPassword: '',
      errors: {},
      isSubmitting: false
    };

    this.validator = new FormValidator();

    // Bind methods
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({ 
      [name]: value,
      errors: {}
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { username, email, bio, password, confirmPassword } = this.state;
    const { user } = this.props;

    // Build validation rules
    const validationRules = {
      username: {
        value: username,
        rules: { required: true, minLength: 3 }
      },
      email: {
        value: email,
        rules: { required: true, email: true }
      }
    };

    // Add password validation only if user is trying to change it
    if (password || confirmPassword) {
      validationRules.password = {
        value: password,
        rules: { required: true, minLength: 6 }
      };
      validationRules.confirmPassword = {
        value: confirmPassword,
        rules: { required: true, match: password }
      };
    }

    // Validate form
    const validation = this.validator.validateForm(validationRules);

    if (!validation.isValid) {
      this.setState({ errors: validation.errors });
      return;
    }

    try {
      this.setState({ isSubmitting: true, errors: {} });

      const updateData = {
        username,
        email,
        bio : bio || ''
      };

      // Only include password if user is changing it
      if (password) {
        updateData.password = password;
      }

      // In ProfileEditForm.jsx handleSubmit
      const updatedUser = await ApiService.put(`/users/${user._id}`, updateData);
      
      const completeUserData = {
        ...user,
        ...updatedUser,
        bio: bio
      };

      this.props.onUpdate(completeUserData);
      
      this.setState({ 
        isSubmitting: false,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Failed to update profile. Please try again.');
      this.setState({ isSubmitting: false });
    }
  }

  render() {
    const { username, email, bio, password, confirmPassword, errors, isSubmitting } = this.state;

    return (
      <form className="profile-edit-form" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            value={username}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
          />
          {errors.username && (
            <span className="form-error">{errors.username[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={email}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
          />
          {errors.email && (
            <span className="form-error">{errors.email[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio" className="form-label">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="form-textarea"
            value={bio}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
            placeholder="Tell us about yourself..."
            rows="4"
          />
        </div>

        <div className="form-divider">
          <span className="divider-text">Change Password (optional)</span>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={password}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
            placeholder="Leave blank to keep current password"
          />
          {errors.password && (
            <span className="form-error">{errors.password[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={this.handleInputChange}
            disabled={isSubmitting}
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword[0]}</span>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={this.props.onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  }
}

export default ProfileEditForm;