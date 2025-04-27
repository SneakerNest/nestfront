import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import "../styles/CartPage.css";
import CartList from "./CartList";

export default function CartPage() {
  const { cartItems, loading, error } = useContext(CartContext);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  if (loading) return <div className="loading">Loading cart...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="cart-page">
      <div className="cart-left">
        <h1 className="cart-title">YOUR SHOPPING CART</h1>
        {cartItems.length === 0 ? (
          <div className="empty-cart-container">
            <p className="empty-cart-message">Your shopping cart is empty 🛒</p>
          </div>
        ) : (
          <CartList />
        )}
      </div>

      <div className="cart-right">
        <div className="order-summary">
          <h2>ORDER SUMMARY</h2>
          <div className="summary-row">
            <span>SHIPPING:</span>
            <span>Free</span>
          </div>
          <div className="summary-row">
            <span>SUBTOTAL:</span>
            <span>${cartItems.reduce((sum, item) => sum + ((item.discountedPrice || item.price) * item.quantity), 0).toFixed(2)}</span>
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
