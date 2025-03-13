import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import logo from "../assets/2.png"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faHeart, faShoppingCart, faBars } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-left">
        <FontAwesomeIcon icon={faBars} className="menu-icon" />
        <img src={logo} alt="SneakerNest Logo" className="nav-logo" />
      </div>

      <ul className="nav-links">
        <li><a href="/sneakers">Sneakers</a></li>
        <li><a href="/casual">Casual</a></li>
        <li><a href="/boots">Boots</a></li>
        <li><a href="/slippers">Slippers & Sandals</a></li>
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
