import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/CartList.css';

const CartList = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart">
        Your shopping cart is empty 🛒
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
              <button 
                className="remove-button" 
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
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

export default CartList;
