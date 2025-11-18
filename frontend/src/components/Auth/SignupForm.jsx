import React, { Component } from 'react';
import AuthService from '../../classes/AuthService';
import FormValidator from '../../classes/FormValidator';
import EventBus from '../../classes/EventBus';

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      errors: {},
      isLoading: false,
      errorMessage: ''
    };

    this.validator = new FormValidator();

    // Bind methods
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAuthError = this.handleAuthError.bind(this);
  }

  componentDidMount() {
    EventBus.on('auth:error', this.handleAuthError);
  }

  componentWillUnmount() {
    EventBus.off('auth:error', this.handleAuthError);
  }

  handleAuthError(errorMessage) {
    this.setState({
      errorMessage,
      isLoading: false
    });
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      errorMessage: ''
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { username, email, password, confirmPassword } = this.state;

    // Validate form
    const validation = this.validator.validateForm({
      username: {
        value: username,
        rules: { required: true, minLength: 3 }
      },
      email: {
        value: email,
        rules: { required: true, email: true }
      },
      password: {
        value: password,
        rules: { required: true, minLength: 6 }
      },
      confirmPassword: {
        value: confirmPassword,
        rules: { required: true, match: password }
      }
    });

    if (!validation.isValid) {
      this.setState({ errors: validation.errors });
      return;
    }

    this.setState({ 
      errors: {}, 
      isLoading: true,
      errorMessage: '' 
    });

    try {
      await AuthService.signup(username, email, password);
    } catch (error) {
      // Error handled by EventBus listener
    }
  }

  render() {
    const { username, email, password, confirmPassword, errors, isLoading, errorMessage } = this.state;

    return (
      <div className="auth-form">
        <h2 className="form-title">Create Account</h2>
        
        {errorMessage && (
          <div className="error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={this.handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={username}
              onChange={this.handleInputChange}
              disabled={isLoading}
              placeholder="Choose a username"
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
              disabled={isLoading}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="form-error">{errors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={password}
              onChange={this.handleInputChange}
              disabled={isLoading}
              placeholder="Create a password"
            />
            {errors.password && (
              <span className="form-error">{errors.password[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={this.handleInputChange}
              disabled={isLoading}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword[0]}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <footer className="form-footer">
          <p className="form-toggle-text">
            Already have an account?{' '}
            <button 
              type="button"
              className="link-button" 
              onClick={this.props.onToggle}
            >
              Log In
            </button>
          </p>
        </footer>
      </div>
    );
  }
}

export default SignupForm;