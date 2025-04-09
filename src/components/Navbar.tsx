import { useState } from "react";
import "./Navbar.css"; // Import custom CSS for Navbar

const Navbar = () => {
  const [isSignedIn, setIsSignedIn] = useState(false); // Manage sign-in state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu toggle

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignIn = () => {
    setIsSignedIn(true); // Change state to simulate user sign-in
  };

  const handleSignOut = () => {
    setIsSignedIn(false); // Change state to simulate user sign-out
    setIsDropdownOpen(false); // Close dropdown after signing out
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle mobile menu visibility
  };

  return (
    <nav className="navbar">
      {/* Logo or title */}
      <div className="navbar-logo">Zobo</div>

      {/* Mobile Menu Icon */}
      <div className="mobile-menu-icon" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Menu items for larger screens */}
      <div className={`navbar-right ${isMenuOpen ? "active" : ""}`}>
        {!isSignedIn ? (
          <button className="sign-in-button" onClick={handleSignIn}>
            Sign In
          </button>
        ) : (
          <div className="user-dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              User
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <a href="#profile">Profile</a>
                <a href="#transactions">Transactions</a>
                <a href="#signout" onClick={handleSignOut}>
                  Sign Out
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu items */}
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        {!isSignedIn ? (
          <button className="sign-in-button" onClick={handleSignIn}>
            Sign In
          </button>
        ) : (
          <div className="user-dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              User
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <a href="#profile">Profile</a>
                <a href="#transactions">Transactions</a>
                <a href="#signout" onClick={handleSignOut}>
                  Sign Out
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
