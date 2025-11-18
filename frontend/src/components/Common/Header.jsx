import React, { Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../classes/AuthService';

// Wrapper component to use hooks with class component
function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let navigate = useNavigate();
    let location = useLocation();
    return <Component {...props} navigate={navigate} location={location} />;
  }
  return ComponentWithRouterProp;
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    AuthService.logout();
    this.props.navigate('/auth');
  }

  render() {
    const currentUser = AuthService.getCurrentUser();
    const { location } = this.props;

    return (
      <header className="header">
        <div className="header-container">
          <Link to="/home" className="header-logo">
            BlogHub
          </Link>

          <nav className="header-nav">
            <Link 
              to="/home" 
              className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/write" 
              className={`nav-link ${location.pathname === '/write' ? 'active' : ''}`}
            >
              Write
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </Link>
          </nav>

          <div className="header-user">
            <span className="user-name">{currentUser?.username}</span>
            <button 
              type="button"
              className="btn btn-secondary btn-sm" 
              onClick={this.handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  }
}

export default withRouter(Header);