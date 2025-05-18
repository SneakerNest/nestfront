// src/components/MainMenu.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/MainMenu.css";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { verifyToken } from "../services/authService";

import hero1 from "../assets/hero2.jpg";
import hero2 from "../assets/hero1.jpg";
import hero3 from "../assets/hero3.jpg";

import dunkpurple from "../assets/dunkpurple.jpg";
import conversered from "../assets/conversered.jpg";
import timberlandBoots from "../assets/Timberland-6-Inch-Premium-Waterproof-Wheat-Product.avif";
import crocsblue from "../assets/crocsblue.jpg";
import football from "../assets/football.jpg"

const sliderImages = [
  { src: hero1, alt: "Moroccan Streetwear" },
  { src: hero2, alt: "Urban Sneakers" },
  { src: hero3, alt: "Streetstyle Vibe" }
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 600,
  autoplay: true,
  autoplaySpeed: 4000,
  slidesToShow: 3,
  slidesToScroll: 1,
  arrows: false,
  fade: false,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 600, settings: { slidesToShow: 1 } }
  ]
};

const MainMenu = () => {
  // Add state for categories
  const [categories, setCategories] = useState([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/store/categories');
        const parentCategories = response.data.filter(cat => !cat.parentCategoryID);
        setCategories(parentCategories);
        console.log('Fetched categories for main menu:', parentCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const result = await verifyToken();
    if (result) {
      console.log("Successfully authenticated");
      console.log("User data:", localStorage.getItem("user"));
    } else {
      console.log("Authentication failed");
    }
  };

  return (
    <div>
      {/* HERO SLIDER */}
      <section className="hero-slider">
        <Slider {...sliderSettings}>
          {sliderImages.map((image, idx) => (
            <div key={idx} className="hero-slide">
              <img src={image.src} alt={image.alt} className="hero-img" />
            </div>
          ))}
        </Slider>
        <div className="hero-overlay">
          <h1>SNEAKERS</h1>
          <p>Step into style.</p>
          <Link to="/product-page">
            <button>SHOP NOW</button>
          </Link>
        </div>
      </section>

      {/* UPDATED CATEGORY SECTION */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {categories.map(category => {
            // Determine image source based on category name
            let imageSrc;
            switch(category.name) {
              case 'Sneakers':
                imageSrc = dunkpurple;
                break;
              case 'Casual':
                imageSrc = conversered;
                break;
              case 'Boots':
                imageSrc = timberlandBoots;
                break;
              case 'SlippersSandals':
                imageSrc = crocsblue;
                break;
              case 'football':
                // Hard-coded direct path to football.jpg
                imageSrc = football;
                break;
              default:
                // For any other new categories
                imageSrc = `http://localhost:5001/api/v1/store/images/${category.name}.jpg`;
            }
            
            return (
              <Link 
                key={category.categoryID} 
                to={`/category/${category.categoryID}`} 
                className="category"
              >
                <div className="category-image-container">
                  <img 
                    src={imageSrc}
                    alt={category.name}
                    className="category-image"
                    onError={(e) => {
                      console.log(`Error loading image for category: ${category.name}`);
                      e.target.style.display = "none";
                      e.target.parentNode.style.backgroundColor = "#f0f0f0";
                    }}
                  />
                </div>
                <h3>{category.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="featured">
        <h2>Why Choose SneakerNest?</h2>
        <div className="featured-boxes">
          <div className="feature-box">
            <h3>⚡ Fast Delivery</h3>
            <p>Get your sneakers delivered within 48 hours in most regions.</p>
          </div>
          <div className="feature-box">
            <h3>✅ 100% Authentic</h3>
            <p>We guarantee verified authentic products or your money back.</p>
          </div>
          <div className="feature-box">
            <h3>🎁 Limited Drops</h3>
            <p>Be the first to access exclusive models and limited editions.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="new-footer">
        <div className="footer-container">
          <div className="footer-column">
            <div className="footer-logo">SneakerNest</div>
            <p>
              Based in Sabanci University, SneakerNest is your go‑to platform for
              high‑end, exclusive streetwear and sneakers across the globe.
            </p>
            <p className="copyright">© 2024 SneakerNest. All rights reserved.</p>
          </div>

          <div className="footer-column">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/sneakers">Sneakers</Link></li>
              <li><Link to="/casual">Casual</Link></li>
              <li><Link to="/boots">Boots</Link></li>
              <li><Link to="/slippers-sandals">Slippers & Sandals</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#"><FaInstagram /> Instagram</a></li>
              <li><a href="#"><FaFacebookF /> Facebook</a></li>
              <li><a href="#"><FaTiktok /> TikTok</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <button onClick={checkAuth}>Verify Authentication</button>
    </div>
  );
};

export default MainMenu;
