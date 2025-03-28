import React from "react";
import "../styles/Hero.css";
import hero_image from "../assets/hero_image.png";

const Hero = () => {
  return (
    <div className="hero">
      <img src={hero_image} alt="Jordan 1" className="hero-image" />
      <div className="hero-text">
        <h2 className="hero-title">ICONIC.</h2>
        <p className="hero-description">
          Air Jordan 1 and many more models, available now at{" "}
          <span className="sneakernest">SneakerNest.com</span>
        </p>
      </div>
    </div>
  );
};

export default Hero;
