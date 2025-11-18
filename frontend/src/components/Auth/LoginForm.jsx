import React, { Component } from 'react';
import AuthService from '../../classes/AuthService';
import FormValidator from '../../classes/FormValidator';
import EventBus from '../../classes/EventBus';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
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
    // Listen for authentication errors
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

    const { email, password } = this.state;

    // Validate form
    const validation = this.validator.validateForm({
      email: {
        value: email,
        rules: { required: true, email: true }
      },
      password: {
        value: password,
        rules: { required: true, minLength: 6 }
      }
    });

    if (!validation.isValid) {
      this.setState({ errors: validation.errors });
      return;
    }

    // Clear errors and set loading
    this.setState({ 
      errors: {}, 
      isLoading: true,
      errorMessage: '' 
    });

    try {
      await AuthService.login(email, password);
      // Navigation is handled by App component listening to EventBus
    } catch (error) {
      // Error is handled by EventBus listener
    }
  }

  render() {
    const { email, password, errors, isLoading, errorMessage } = this.state;

    return (
      <div className="auth-form">
        <h2 className="form-title">Welcome Back</h2>
        
        {errorMessage && (
          <div className="error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={this.handleSubmit} noValidate>
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
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="form-error">{errors.password[0]}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <footer className="form-footer">
          <p className="form-toggle-text">
            Don't have an account?{' '}
            <button 
              type="button"
              className="link-button" 
              onClick={this.props.onToggle}
            >
              Sign Up
            </button>
          </p>
        </footer>
      </div>
    );
  }
}

export default LoginForm;