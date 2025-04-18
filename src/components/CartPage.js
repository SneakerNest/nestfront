import React, { useState, useContext } from 'react';
import '../styles/CartPage.css';
import CartList from './CartList';
import DeliverySection from './DeliverySection';
import PaymentSection from './PaymentSection';
import OrderSummary from './OrderSummary';
import OrderConfirmation from './OrderConfirmation';
import { CartContext } from '../context/CartContext';

const CartPage = () => {
    const [cartStep, setCartStep] = useState('summary');
    const { cartItems, clearCart } = useContext(CartContext);
    const [confirmationData, setConfirmationData] = useState([]);

const handlePaymentSubmit = () => {
    setConfirmationData(cartItems);  
    setCartStep('confirmation');  
    clearCart();
};

  return (
    <div className="cart-page">
      <div className="cart-left">
        <CartList />
      </div>
      <div className="cart-right">
        {cartStep === 'summary' && (
            <OrderSummary onNext={() => setCartStep('payment')} />
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
