import React, { Component } from 'react';

class Footer extends Component {
  render() {
    const currentYear = new Date().getFullYear();

    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">BlogHub</h3>
              <p className="footer-text">
                A platform for sharing thoughts and stories with the world.
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <nav className="footer-links">
                <a href="/home" className="footer-link">Home</a>
                <a href="/write" className="footer-link">Write</a>
                <a href="/profile" className="footer-link">Profile</a>
              </nav>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">About</h4>
              <p className="footer-text">
                Built with MERN stack - MongoDB, Express, React, and Node.js
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © {currentYear} BlogHub. All rights reserved.
            </p>
            <p className="footer-copyright">
              Kanad Meshram. BT23CSE027. VNIT Nagpur.
            </p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;