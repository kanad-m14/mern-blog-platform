import React, { Component } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import '../../styles/auth.css';

class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,
      showSignup: false,
      showLanding: true
    };

    this.handleShowLogin = this.handleShowLogin.bind(this);
    this.handleShowSignup = this.handleShowSignup.bind(this);
    this.handleBackToLanding = this.handleBackToLanding.bind(this);
  }

  handleShowLogin() {
    this.setState({
      showLogin: true,
      showSignup: false,
      showLanding: false
    });
  }

  handleShowSignup() {
    this.setState({
      showLogin: false,
      showSignup: true,
      showLanding: false
    });
  }

  handleBackToLanding() {
    this.setState({
      showLogin: false,
      showSignup: false,
      showLanding: true
    });
  }

  render() {
    const { showLogin, showSignup, showLanding } = this.state;

    return (
      <div className="auth-page">
        {/* Header */}
        <header className="landing-header">
          <div className="landing-header-container">
            <h1 className="landing-logo">BlogHub</h1>
            <nav className="landing-nav">
              <button 
                type="button"
                className="nav-button nav-signin" 
                onClick={this.handleShowLogin}
              >
                Sign in
              </button>
              <button 
                type="button"
                className="nav-button nav-getstarted" 
                onClick={this.handleShowSignup}
              >
                Get started
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        {showLanding && (
          <section className="landing-hero">
            <div className="landing-hero-content">
              <div className="hero-text">
                <h2 className="hero-title">Human stories & ideas</h2>
                <p className="hero-subtitle">
                  A place to read, write, and deepen your understanding
                </p>
                <button 
                  type="button"
                  className="btn-start-reading" 
                  onClick={this.handleShowSignup}
                >
                  Start reading
                </button>
              </div>
              <div className="hero-illustration">
                <div className="illustration-shape shape-1"></div>
                <div className="illustration-shape shape-2"></div>
                <div className="illustration-shape shape-3"></div>
              </div>
            </div>
          </section>
        )}

        {/* Login Form */}
        {showLogin && (
          <div className="auth-form-container">
            <div className="auth-form-wrapper">
              <button 
                type="button"
                className="btn-back" 
                onClick={this.handleBackToLanding}
              >
                ← Back
              </button>
              <LoginForm onToggle={this.handleShowSignup} />
            </div>
          </div>
        )}

        {/* Signup Form */}
        {showSignup && (
          <div className="auth-form-container">
            <div className="auth-form-wrapper">
              <button 
                type="button"
                className="btn-back" 
                onClick={this.handleBackToLanding}
              >
                ← Back
              </button>
              <SignupForm onToggle={this.handleShowLogin} />
            </div>
          </div>
        )}
        
      </div>
    );
  }
}

export default AuthPage;