import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/CartList.css';

const CartList = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  return (
    <div className="cart-list">
      <div className="cart-header">
        <h2>YOUR SHOPPING CART</h2>
      </div>
      {cartItems.length > 0 && ( 
        <div className = "cart-header-row">
          <span>PRODUCT</span>
          <span>PRICE</span>
          <span>TOTAL</span>
        </div>
      )}
      {cartItems.length === 0 ? (
        <p className="empty-message">Your shopping cart is empty 🛒</p>
      ) : (
        cartItems.map(item => (
          <div key={`${item.id}-${item.size}`} className="cart-row">
            <div className="cart-info">  
              <img src={item.image} alt={item.name} />
              <div>
                <h4>{item.name}</h4>
                <p>Size: {item.size}</p>
                <p>Qty: {item.quantity}</p>
                <button onClick={() => removeFromCart(item.id, item.size)}>Remove</button>
              </div>
            </div>
            <div className="single-price">${item.price}</div>
            <div className="total-price">${item.price * item.quantity.toFixed(2)}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default CartList;
