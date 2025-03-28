import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <-- Important if using React Router
import "../styles/Navbar.css";
import logo from "../assets/2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faHeart,
  faShoppingCart,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-left">
        <FontAwesomeIcon
          icon={isMenuOpen ? faTimes : faBars}
          className="menu-icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        
        {/* Wrap the logo in a Link so it navigates to the homepage on click */}
        <Link to="/">
          <img src={logo} alt="SneakerNest Logo" className="nav-logo" />
        </Link>
      </div>

      <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        <li><Link to="/sneakers">Sneakers</Link></li>
        <li><Link to="/casual">Casual</Link></li>
        <li><Link to="/boots">Boots</Link></li>
        <li><Link to="/slippers">Slippers & Sandals</Link></li>
      </ul>

      <div className="nav-icons">
        <FontAwesomeIcon icon={faSearch} className="icon" />
        <FontAwesomeIcon icon={faUser} className="icon" />
        <FontAwesomeIcon icon={faHeart} className="icon" />
        <FontAwesomeIcon icon={faShoppingCart} className="icon" />
      </div>
    </nav>
  );
};

export default Navbar;
