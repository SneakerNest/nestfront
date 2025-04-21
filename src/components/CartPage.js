import React, { useState, useContext } from 'react';
import '../styles/CartPage.css';
import CartList from './CartList';
import DeliverySection from './DeliverySection';
import PaymentSection from './PaymentSection';
import OrderSummary from './OrderSummary';
import OrderConfirmation from './OrderConfirmation';
import { CartContext } from '../context/CartContext';
import { isUserLogged } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const [cartStep, setCartStep] = useState('summary');
    const { cartItems } = useContext(CartContext);
    const [confirmationData, setConfirmationData] = useState([]);

const handlePaymentSubmit = () => {
    setConfirmationData(cartItems);  
    setCartStep('confirmation');  
    
};

const navigate = useNavigate();

  return (
    <div className="cart-page">
      <div className="cart-left">
        <CartList />
      </div>
      <div className="cart-right">
      {cartStep === 'summary' && (
        <OrderSummary onNext={() => {
          if (isUserLogged()) {
            setCartStep('payment');
          } else {
            alert("Please log in to proceed with payment.");
            navigate("/login");
          }
        }} />
      )}
      {cartStep === 'payment' && (
          <PaymentSection onSubmit={handlePaymentSubmit}/>
      )}
      {cartStep === 'confirmation' && (<OrderConfirmation items={confirmationData}/>)}
    </div>
  </div>
  );
};

export default CartPage;
