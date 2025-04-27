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

  const handleProceedToCheckout = () => {
    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }
    navigate('/checkout');
  };

  const handleLoginClick = () => {
    // Store cart state in localStorage before redirecting
    localStorage.setItem('tempCart', JSON.stringify(cartItems));
    navigate('/login');
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
          <div key={`${item.productID}`} className="cart-row">
            <div className="cart-info">
              <img
                src={`http://localhost:5001/api/v1/images/${item.picturePath}`}
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p className="item-quantity">Qty: {item.quantity}</p>
                <div className="cart-item-actions">
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.productID)}
                  >
                    Remove
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteFromCart(item.productID)}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
            <div className="single-price">
              ${Number(item.unitPrice * (1 - (item.discountPercentage || 0) / 100)).toFixed(2)}
            </div>
            <div className="total-price">
              ${(item.unitPrice * (1 - (item.discountPercentage || 0) / 100) * item.quantity).toFixed(2)}
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
            <div className="summary-details">
              <div className="summary-row">
                <span>SHIPPING:</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>SUBTOTAL:</span>
                <span>
                  ${cartItems.reduce((sum, item) => 
                    sum + (item.unitPrice * (1 - (item.discountPercentage || 0) / 100) * item.quantity), 
                    0
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <button 
              className="proceed-payment"
              onClick={handleProceedToCheckout}
              disabled={!cartItems.length}
            >
              {cartItems.length === 0 ? "Cart is Empty" : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>Login Required</h2>
            <p>Please login to proceed with checkout. Your cart items will be saved.</p>
            <div className="login-modal-buttons">
              <button 
                className="login-modal-btn" 
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button 
                className="login-modal-cancel" 
                onClick={() => setShowLoginModal(false)}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
