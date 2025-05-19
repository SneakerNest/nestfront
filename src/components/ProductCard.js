// src/components/ProductCard.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import '../styles/ProductPage.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizePopup, setShowSizePopup] = useState(false);
  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const stockLabel = product.stock <= 0 
    ? "Out of Stock" 
    : product.stock < 5 
      ? `Limited Stock: ${product.stock}` 
      : null;
  
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount 
    ? (product.unitPrice * (1 - product.discountPercentage / 100)).toFixed(2) 
    : product.unitPrice.toFixed(2);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }
    toggleWishlistItem(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    
    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }
    
    addToCart({
      ...product,
      size: selectedSize,
      quantity: 1
    });
    setShowSizePopup(false);
    alert("Product added to cart!");
  };

  return (
    <div className="product-card">
      {/* Discount Badge - Show only when there's a discount */}
      {hasDiscount && (
        <div className="discount-badge-container">
        </div>
      )}

      {/* Stock Badge */}
      {stockLabel && (
        <div className="stock-badge">{stockLabel}</div>
      )}
      
      {/* Wishlist Button */}
      <button
        className={`wishlist-btn ${isInWishlist(product.productID) ? "active" : ""}`}
        onClick={handleToggleWishlist}
      >
        <FontAwesomeIcon
          icon={isInWishlist(product.productID) ? faHeartSolid : faHeartOutline}
        />
      </button>
      
      <Link to={`/product/${product.productID}`} className="product-link">
        <img 
          src={product.imageUrl}
          alt={product.name}
          className="product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.jpg';
          }}
        />
        
        <h3 className="product-title">{product.name}</h3>
        
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="original-price">${Number(product.unitPrice).toFixed(2)}</span>
              <span className="discount-price">${discountedPrice}</span>
            </>
          ) : (
            <>${discountedPrice}</>
          )}
        </div>
      </Link>

      {/* Size & Add to Cart Actions */}
      <div className="product-actions">
        <select
          className="size-dropdown"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option value="">Select Size</option>
          {[38, 39, 40, 41, 42, 43, 44, 45].map((size) => (
            <option key={size} value={size}>EU {size}</option>
          ))}
        </select>

        <button
          className="add-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || !selectedSize}
        >
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>Please login to continue</h2>
            <button className="login-modal-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="login-modal-cancel" onClick={() => setShowLoginModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
