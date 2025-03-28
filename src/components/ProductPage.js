// src/components/ProductPage.js

import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "../styles/ProductPage.css";

// 1) Import the same images you used in Newest.js
import aj1highredwhite from "../assets/aj1highredwhite.jpg";
import nb9060 from "../assets/9060white.jpg";
import birkenstockarizona from "../assets/birkenstockarizonablack.jpg";
import dunk from "../assets/dunkpurple.jpg";
import yeezyslideblack from "../assets/yeezyslideblack.jpg";
import yeezy350 from "../assets/yeezywhite.jpg";
import converse from "../assets/conversered.jpg";
import crocs from "../assets/crocsblue.jpg";

// 2) Create a product array that mirrors the "Newest" list
const productList = [
  { id: 1, name: "Air Jordan 1", price: 199, image: aj1highredwhite },
  { id: 2, name: "Nike Dunk", price: 149, image: dunk },
  { id: 3, name: "Yeezy 350 Boost", price: 220, image: yeezy350 },
  { id: 4, name: "Yeezy Slide", price: 130, image: yeezyslideblack },
  { id: 5, name: "New Balance 9060", price: 140, image: nb9060 },
  { id: 6, name: "Birkenstock Arizona", price: 180, image: birkenstockarizona },
  { id: 7, name: "Crocs", price: 120, image: crocs },
  { id: 8, name: "Converse", price: 85, image: converse },
];

const ProductPage = () => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="product-page">
      <h2 className="product-page-title">Our Products</h2>
      <div className="product-container">
        {productList.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <p className="product-name">{product.name}</p>
            <p className="product-price">${product.price}</p>
            <button
              className="product-add-btn"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
