import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthService from './classes/AuthService';
import EventBus from './classes/EventBus';

// Pages
import AuthPage from './components/Auth/AuthPage';
import HomePage from './components/Home/HomePage';
import ProfilePage from './components/Profile/ProfilePage';
import WritePage from './components/Write/WritePage';

// Common Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';

import './styles/main.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: AuthService.isAuthenticated(),
      currentUser: AuthService.getCurrentUser()
    };

    // Bind methods
    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  componentDidMount() {
    // Listen for authentication events using EventBus
    EventBus.on('auth:login', this.handleAuthChange);
    EventBus.on('auth:signup', this.handleAuthChange);
    EventBus.on('auth:logout', this.handleAuthChange);
  }

  componentWillUnmount() {
    // Clean up event listeners
    EventBus.off('auth:login', this.handleAuthChange);
    EventBus.off('auth:signup', this.handleAuthChange);
    EventBus.off('auth:logout', this.handleAuthChange);
  }

  handleAuthChange() {
    this.setState({
      isAuthenticated: AuthService.isAuthenticated(),
      currentUser: AuthService.getCurrentUser()
    });
  }

  render() {
    const { isAuthenticated } = this.state;

    return (
      <Router>
        <div className="app">
          {isAuthenticated && <Header />}
          
          <main className="main-content">
            <Routes>
              <Route 
                path="/auth" 
                element={
                  isAuthenticated ? <Navigate to="/home" /> : <AuthPage />
                } 
              />
              <Route 
                path="/home" 
                element={
                  isAuthenticated ? <HomePage /> : <Navigate to="/auth" />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  isAuthenticated ? <ProfilePage /> : <Navigate to="/auth" />
                } 
              />
              <Route 
                path="/write" 
                element={
                  isAuthenticated ? <WritePage /> : <Navigate to="/auth" />
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />} 
              />
            </Routes>
          </main>

          {isAuthenticated && <Footer />}
        </div>
      </Router>
    );
  }
}

export default App;