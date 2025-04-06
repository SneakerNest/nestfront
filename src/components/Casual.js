// Example for Sneakers.js - same style applies to others (change category value)
import React, { useState } from "react";
import "../styles/ProductPage.css";
import products from "../data/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faHeart } from "@fortawesome/free-solid-svg-icons";

function Casual() {
  const [sortOrder, setSortOrder] = useState("default");

  const filteredProducts = products.filter(p => p.category === "Casual");

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "low-to-high") return a.price - b.price;
    if (sortOrder === "high-to-low") return b.price - a.price;
    return 0;
  });

  return (
    <div className="product-container">
      <div className="filter-bar">
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="default">Sort By</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-img" />
            <h3 className="product-title">{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <div className="product-actions">
              <button className="cart-btn">
                <FontAwesomeIcon icon={faShoppingCart} />
              </button>
              <FontAwesomeIcon icon={faHeart} className="wishlist-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Casual;