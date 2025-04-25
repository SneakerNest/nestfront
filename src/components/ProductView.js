// src/components/ProductView.js
import React, { useContext, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import products from "../data/products";
import "../styles/ProductView.css";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Reviews from "./Reviews";

const ProductView = () => {
  // 1) Hooks first
  const { id } = useParams();
  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState("default");

  // 2) Then find your product
  const product = products.find((p) => p.id === parseInt(id, 10));

  // 3) Early return if product not found
  if (!product) {
    return <Navigate to="/product-page" replace />;
  }

  // 4) Now it’s safe to use `product`
  const sizes = [38, 39, 40, 41, 42, 43, 44];
  const colors = ["default", "red", "gray", "white"];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    addToCart({ ...product, size: selectedSize });
  };

  return (
    <div className="product-view-page">
      <div className="product-view-container">
        <div className="image-section">
          <img
            src={product.image}
            alt={product.name}
            className="product-main-img"
          />
        </div>
        <div className="info-section">
          <span className="product-new-tag">New!</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-subtitle">Unisex Shoes</p>
          <p className="product-description">
            This is a temporary description. The {product.name} blends comfort
            and style into the ultimate streetwear experience.
          </p>

          <p className="product-price">${product.price.toFixed(2)}</p>
          <p
            className={
              product.stock < 10 ? "product-stock low" : "product-stock"
            }
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : `Out of stock`}
          </p>

          <div className="color-options">
            {colors.map((c) => (
              <div
                key={c}
                className={`color-dot ${c} ${
                  selectedColor === c ? "active" : ""
                }`}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>

          <div className="size-section">
            <p className="size-label">Size (EU)</p>
            <div className="sizes">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${
                    selectedSize === s ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="cart-button" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button
              className="wishlist-button"
              onClick={() => toggleWishlistItem(product)}
            >
              Favorite{" "}
              <FontAwesomeIcon
                icon={faHeart}
                color={isInWishlist(product.id) ? "red" : "black"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews carousel */}
      <Reviews />
    </div>
  );
};

export default ProductView;
