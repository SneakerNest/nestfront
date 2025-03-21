import React from "react";
import "../styles/ProductPage.css";
import background from "../assets/background.jpg";

function ProductPage() {
  return (
    <div className="product-container">
      <img src={background} alt="background" className="background-image" />
      <div className="product-box">
        <img
          src="https://via.placeholder.com/200"
          alt="Product"
          className="product-img"
        />
        <h2>Awesome Sneaker</h2>
        <p className="product-description">
          This sneaker blends comfort and style, perfect for daily wear.
        </p>
        <p className="product-price">$99.99</p>
        <button className="buy-btn">Buy Now</button>
      </div>
    </div>
  );
}

export default ProductPage;

