import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../styles/OrderSummary.css";

const OrderSummary = ({ onNext }) => {
  const { cartItems } = useContext(CartContext);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="order-summary">
      <div className="order-header">
        <h3>ORDER SUMMARY</h3>
      </div>
      <ul>
        {cartItems.map((item, index) => (
          <li key={`${item.id}-${item.size}-${index}`}>
            {item.name} - Size {item.size} x {item.quantity}
          </li>
        ))}
      </ul>
      <p>
        <strong>SHIPPING:</strong> <span>Free</span>
      </p>
      <p>
        <strong>SUBTOTAL:</strong> <span>${subtotal.toFixed(2)}</span>
      </p>
      <button onClick={onNext}>Proceed to Payment</button>
    </div>
  );
};

export default OrderSummary;
