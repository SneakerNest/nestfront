import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faHeart,
  faShoppingCart,
  faBars,
  faTimes,
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
        <img src={logo} alt="SneakerNest Logo" className="nav-logo" />
      </div>

      <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        {/* Update these links to your actual routes */}
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/mainmenu">MainMenu</Link>
        </li>
        <li>
          <Link to="/hero">Hero</Link>
        </li>
        <li>
          <Link to="/category">Category</Link>
        </li>
        <li>
          <Link to="/newest">Newest</Link>
        </li>
        <li>
          <Link to="/product">Product</Link>
        </li>
        <li>
          <Link to="/cart">Cart</Link>
        </li>
      </ul>

      <div className="nav-icons">
        <FontAwesomeIcon icon={faSearch} className="icon" />
        <Link to="/login">
          <FontAwesomeIcon icon={faUser} className="icon" />
        </Link>
        <FontAwesomeIcon icon={faHeart} className="icon" />
        <Link to="/cart">
          <FontAwesomeIcon icon={faShoppingCart} className="icon" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
