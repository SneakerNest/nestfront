import React from "react";
import "../styles/OrderConfirmation.css";

const OrderConfirmation = ({ items }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="order-confirmation">
      <h3>Order Confirmed!</h3>
      <p>Thank you for your purchase. Here's what you ordered:</p>

      <ul>
        {items.map((item, index) => (
          <li key={`${item.id}-${item.size}-${index}`}>
            {item.name} - Size {item.size} x {item.quantity}
          </li>
        ))}
      </ul>

      <p><strong>Total:</strong> ${subtotal.toFixed(2)}</p>
      <p>A PDF copy of your invoice will be mailed to you.</p>
    </div>
  );
};

export default OrderConfirmation;
