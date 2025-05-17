import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserLogged, axios } from '../utils/auth';
import { CartContext } from '../context/CartContext';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    const user = isUserLogged();
    if (!user) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 16);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = formatCVV(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.discountedPrice || item.unitPrice;
      return sum + (price * item.quantity);
    }, 0);
  };

  const validateForm = () => {
    if (formData.cardNumber.length !== 16) {
      setError('Card number must be 16 digits');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      setError('Invalid expiry date format (MM/YY)');
      return false;
    }

    const [month, year] = formData.expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (parseInt(year) < currentYear || 
       (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setError('Card has expired');
      return false;
    }

    if (formData.cvv.length !== 3) {
      setError('CVV must be 3 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = isUserLogged();

      // First get user email
      const userResponse = await axios.get('/user/profile');
      const userEmail = userResponse.data.user.email;

      // Process payment
      await axios.post('/payment/process', {
        creditCard: {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        }
      });

      // Place order and get order details
      const orderResponse = await axios.post('/order/place', {
        customerID: user.customerID,
        email: userEmail // Pass email to order
      });

      const orderID = orderResponse.data.orderID;
      
      // Get complete order details
      const orderDetailsResponse = await axios.get(`/order/${orderID}`);
      const completeOrderDetails = {
        ...orderDetailsResponse.data,
        userEmail: userEmail
      };

      console.log('Order details with delivery address:', {
        orderID: orderID,
        hasDeliveryAddress: !!orderDetailsResponse.data.deliveryAddress,
        addressInfo: orderDetailsResponse.data.deliveryAddress
      });

      setOrderDetails(completeOrderDetails);

      // Send invoice via email
      await axios.get(`/invoice/mail/${orderID}/${userEmail}`);
      
      // Clear cart and refresh profile
      await clearCart();
      setOrderPlaced(true);

    } catch (error) {
      console.error('Payment/Order error:', error);
      setError(error.response?.data?.msg || 'Payment/Order processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced && orderDetails) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="order-success">
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark draw"></div>
              </div>
            </div>
            <h2>Payment Successful!</h2>
            <div className="email-notification">
              <i className="fas fa-envelope-open-text"></i>
              <p>Invoice has been sent to email</p>
            </div>

            <div className="invoice-container">
              <div className="order-header">
                <div className="order-number">
                  <span className="label">Order #</span>
                  <span className="value">{orderDetails.orderNumber}</span>
                </div>
                <div className="order-date">
                  {new Date(orderDetails.timeOrdered).toLocaleDateString()}
                </div>
                <div className="status-badge">
                  {orderDetails.deliveryStatus}
                </div>
              </div>

              <div className="brand-section">
                <h1>SneakerNest</h1>
              </div>

              {/* Add Delivery Address Section */}
              <div className="delivery-address-section">
                <h3>Delivery Address</h3>
                <div className="address-details">
                  {orderDetails.deliveryAddress ? (
                    <>
                      <p>{orderDetails.deliveryAddress.addressTitle || 'Shipping Address'}</p>
                      <p>{orderDetails.deliveryAddress.streetAddress}</p>
                      <p>
                        {[
                          orderDetails.deliveryAddress.city,
                          orderDetails.deliveryAddress.province,
                          orderDetails.deliveryAddress.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p>{orderDetails.deliveryAddress.country}</p>
                    </>
                  ) : (
                    // Try to get profile address as fallback
                    <div className="address-fallback">
                      <p>Using your default address:</p>
                      {async () => {
                        try {
                          const profileData = await axios.get('/user/profile');
                          if (profileData.data.customer) {
                            return (
                              <>
                                <p>{profileData.data.customer.addressTitle || 'Default Address'}</p>
                                <p>{profileData.data.customer.streetAddress}</p>
                                <p>
                                  {[
                                    profileData.data.customer.city,
                                    profileData.data.customer.province,
                                    profileData.data.customer.zipCode
                                  ].filter(Boolean).join(', ')}
                                </p>
                                <p>{profileData.data.customer.country}</p>
                              </>
                            );
                          }
                          return <p>No address information available</p>;
                        } catch (err) {
                          return <p>No address information available</p>;
                        }
                      }}
                    </div>
                  )}
                </div>
              </div>

              <div className="invoice-items">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.orderItems?.map(item => (
                      <tr key={item.productID}>
                        <td className="product-name">{item.productName}</td>
                        <td className="size">EU {item.size}</td>
                        <td className="quantity">{item.quantity}</td>
                        <td className="price">${Number(item.purchasePrice).toFixed(2)}</td>
                        <td className="total">${(item.quantity * item.purchasePrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-summary">
                <div className="summary-row subtotal">
                  <span>Subtotal</span>
                  <span>${Number(orderDetails.totalPrice).toFixed(2)}</span>
                </div>
                <div className="summary-row shipping">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${Number(orderDetails.totalPrice).toFixed(2)}</span>
                </div>
              </div>

              <div className="invoice-footer">
                <div className="tracking-info">
                  <h3>Track Your Order</h3>
                  <p className="tracking-id">Tracking ID: {orderDetails.deliveryID}</p>
                </div>
                <div className="download-section">
                  <button 
                    className="download-invoice-btn"
                    onClick={async () => {
                      try {
                        const response = await axios.get(
                          `/invoice/download/${orderDetails.orderID}`, 
                          { responseType: 'blob' }
                        );
                        
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `invoice-${orderDetails.orderNumber}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading invoice:', error);
                        alert('Failed to download invoice');
                      }
                    }}
                  >
                    <i className="fas fa-file-download"></i>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <button className="continue-shopping" onClick={() => navigate('/shop')}>
                <i className="fas fa-shopping-bag"></i>
                Continue Shopping
              </button>
              <button className="view-order" onClick={() => navigate('/profile')}>
                <i className="fas fa-clipboard-list"></i>
                View Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-form">
            <h1>Payment Information</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Card Details</h2>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.productID} className="summary-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Size: EU {item.size}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${((item.discountedPrice || item.unitPrice) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <div className="summary-row">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;