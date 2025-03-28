// src/components/CartPage.js
import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "../styles/CartPage.css";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  // Calculate total
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="cart-page">
      <h2 className="cart-title">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty!</p>
      ) : (
        <div className="cart-items-container">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">${item.price}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <p className="cart-total">Total: ${total}</p>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
