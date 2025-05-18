import React, { useState } from 'react';
import '../styles/PaymentSection.css';

const PaymentSection = ({ onSubmit }) => {
  const [payment, setPayment] = useState({ nameOnCard: '', cardNumber: '', expiry: '', cvv: '' });

  const handleChange = (e) => {
    setPayment(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!payment.nameOnCard || !payment.cardNumber || !payment.expiry || !payment.cvv) {
      alert('Please fill in all payment details.');
      return;
    }
    onSubmit();
  };

  const [saveCard, setSaveCard] = useState(false);

  return (
    <div className="payment-section">
      <h3>Payment Details</h3>
      <input name="nameOnCard" placeholder="Name on Card" value={payment.nameOnCard} onChange={handleChange} />
      <input name="cardNumber" placeholder="Card Number" value={payment.cardNumber} onChange={handleChange} />
      <input name="expiry" placeholder="Expiry Date" value={payment.expiry} onChange={handleChange} />
      <input name="cvv" placeholder="CVV" value={payment.cvv} onChange={handleChange} />
      <input
        type="checkbox"
        id="saveCard"
        checked={saveCard}
        onChange={() => setSaveCard(!saveCard)}
      />
      <label htmlFor="saveCard">Save card for future purchases</label>

      <button onClick={handleSubmit}>Submit Payment</button>
    </div>
  );
};

export default PaymentSection;
