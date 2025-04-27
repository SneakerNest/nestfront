import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would integrate with your payment processing system
      alert('Order placed successfully!');
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => 
    sum + ((item.discountedPrice || item.price) * item.quantity), 0
  );

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">
        <div className="checkout-form">
          <section className="shipping-section">
            <h2>Shipping Information</h2>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={shippingInfo.firstName}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={shippingInfo.lastName}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={shippingInfo.address}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={shippingInfo.city}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              name="zipCode"
              placeholder="ZIP Code"
              value={shippingInfo.zipCode}
              onChange={handleShippingChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shippingInfo.phone}
              onChange={handleShippingChange}
            />
          </section>

          <section className="payment-section">
            <h2>Payment Information</h2>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentChange}
            />
            <div className="card-details">
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentInfo.expiryDate}
                onChange={handlePaymentChange}
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={paymentInfo.cvv}
                onChange={handlePaymentChange}
              />
            </div>
          </section>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button className="place-order-btn" onClick={handleSubmit}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;