// MainMenu.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/MainMenu.css";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa"; // ✅ New Icons

import hero1 from "../assets/hero2.jpg";
import hero2 from "../assets/hero1.jpg";
import hero3 from "../assets/hero3.jpg";

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
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1
      }
    }
  ]
};

const MainMenu = () => {
  return (
    <div>
      {/* HERO SLIDER */}
      <section className="hero-slider">
        <Slider {...sliderSettings}>
          {sliderImages.map((image, index) => (
            <div key={index} className="hero-slide">
              <img src={image.src} alt={image.alt} className="hero-img" />
            </div>
          ))}
        </Slider>

        {/* ONE overlay centered over all images */}
        <div className="hero-overlay">
          <h1>SNEAKERS</h1>
          <p>Step into style.</p>
          <Link to="/product-page">
            <button>SHOP NOW</button>
          </Link>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          <Link to="/sneakers" className="category">
            <img src={require("../assets/dunkpurple.jpg")} alt="Sneakers" />
            <h3>Sneakers</h3>
          </Link>
          <Link to="/casual" className="category">
            <img src={require("../assets/conversered.jpg")} alt="Casual" />
            <h3>Casual</h3>
          </Link>
          <Link to="/boots" className="category">
            <img src={require("../assets/Timberland-6-Inch-Premium-Waterproof-Wheat-Product.avif")} alt="Boots" />
            <h3>Boots</h3>
          </Link>
          <Link to="/slippers-sandals" className="category">
            <img src={require("../assets/crocsblue.jpg")} alt="Slippers & Sandals" />
            <h3>SlippersSandals</h3>
          </Link>
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
              Based in Sabanci University, SneakerNest is your go-to platform for high-end,
              exclusive streetwear and sneakers across the globe.
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
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#"><FaInstagram /> Instagram</a></li>
              <li><a href="#"><FaFacebookF /> Facebook</a></li>
              <li><a href="#"><FaTiktok /> TikTok</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Subscribe to our newsletter</h4>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainMenu;
