import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import "../styles/CartPage.css";
import "../styles/CartList.css";

export default function CartPage() {
  const { cartItems, loading, error, refreshCart, removeFromCart, deleteFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    console.log("CartPage: Fetching cart data");
    refreshCart();
  }, [refreshCart]);
  
  useEffect(() => {
    if (error && error.includes("Cannot connect") && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying (${retryCount + 1}/3)...`);
        refreshCart();
        setRetryCount(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refreshCart]);
  
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return "0.00";
    return cartItems
      .reduce((sum, item) => sum + ((item.discountedPrice || item.price) * item.quantity), 0)
      .toFixed(2);
  };

  if (loading) return (
    <div className="cart-page-container">
      <div className="loading">Loading your cart...</div>
    </div>
  );
  
  if (error) return (
    <div className="cart-page-container">
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={() => {
          setRetryCount(0);
          refreshCart();
        }}>
          Try Again
        </button>
        <p className="error-help-text">
          Make sure your backend server is running at http://localhost:5001
        </p>
      </div>
    </div>
  );

  const renderCartList = () => {
    if (!cartItems || cartItems.length === 0) {
      return (
        <div className="empty-cart-container">
          <p className="empty-cart-message">Your shopping cart is empty 🛒</p>
        </div>
      );
    }

    return (
      <div className="cart-list">
        <div className="cart-header-row">
          <span className="product-col">PRODUCT</span>
          <span className="price-col">PRICE</span>
          <span className="total-col">TOTAL</span>
        </div>
        
        {cartItems.map(item => (
          <div key={`${item.id}-${item.size}`} className="cart-row">
            <div className="cart-info">
              <img 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                {item.size && <p className="item-size">Size: {item.size}</p>}
                <p className="item-quantity">Qty: {item.quantity}</p>
                <div className="cart-item-actions">
                  <button 
                    className="remove-button" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => deleteFromCart(item.id)}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
            <div className="single-price">
              ${Number(item.discountedPrice || item.price).toFixed(2)}
            </div>
            <div className="total-price">
              ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cart-page-container">
      <h1 className="cart-main-title">YOUR SHOPPING CART</h1>
      <div className="cart-page">
        <div className="cart-left">
          {renderCartList()}
        </div>

        <div className="cart-right">
          <div className="order-summary">
            <h2>ORDER SUMMARY</h2>
            <div className="summary-row">
              <span>SHIPPING:</span>
              <span>Free</span>
            </div>
            <div className="summary-row subtotal-row">
              <span>SUBTOTAL:</span>
              <span>${calculateTotal()}</span>
            </div>
            <button 
              className="proceed-payment"
              onClick={() => {
                if (!isUserLogged()) {
                  setShowLoginModal(true);
                } else {
                  navigate('/checkout');
                }
              }}
              disabled={cartItems.length === 0}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>

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
}
