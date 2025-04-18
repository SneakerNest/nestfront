import React, { useState } from 'react';
import '../styles/DeliverySection.css';

const DeliverySection = ({ onNext }) => {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="delivery-section">
      <h3>Delivery Info</h3>
      <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
      <button onClick={onNext}>Proceed to Payment</button>
    </div>
  );
};

export default DeliverySection;
