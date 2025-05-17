import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { isUserLogged, logout, axios } from "../utils/auth";  // Update this line
import "../styles/ProfilePage.css";
import { CartContext } from "../context/CartContext";

// Debug helper for axios errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AXIOS ERROR:', {
      config: error.config,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { clearCartOnLogout } = useContext(CartContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnMessage, setReturnMessage] = useState("");
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = isUserLogged();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user profile data and orders in parallel for efficiency
        const [profileResponse, activeOrdersResponse, pastOrdersResponse] = await Promise.all([
          axios.get('/user/profile'),
          axios.get('/order/active'),
          axios.get('/order/past')
        ]);

        // Add this to fetch cancelled orders
        const cancelledOrdersResponse = await axios.get('/order/cancelled');

        // Update the user data with cancelled orders
        setUserData({
          ...profileResponse.data,
          activeOrders: activeOrdersResponse.data,
          pastOrders: pastOrdersResponse.data,
          cancelledOrders: cancelledOrdersResponse.data || []
        });

        // Add a small delay before fetching returns to ensure customer ID is set
        setTimeout(async () => {
          if (profileResponse.data?.customer?.customerID) {
            try {
              console.log('Fetching returns for customer ID:', profileResponse.data.customer.customerID);
              
              // Try direct endpoint first as it's more reliable
              const directResponse = await axios.get(`/order/returns/customer/${profileResponse.data.customer.customerID}`);
              console.log('Direct returns response:', directResponse.data);
              
              if (directResponse.data && directResponse.data.length > 0) {
                setReturns(directResponse.data);
              } else {
                // Try the authenticated endpoint as fallback
                const returnsResponse = await axios.get('/order/returns');
                console.log('Auth returns response:', returnsResponse.data);
                
                if (returnsResponse.data && returnsResponse.data.length > 0) {
                  setReturns(returnsResponse.data);
                } else {
                  setReturns([]);
                }
              }
            } catch (error) {
              console.error('Error fetching returns:', error);
              setReturns([]);
            }
          }
        }, 300);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, refreshTrigger]);

  const handleLogout = async () => {
    try {
      await clearCartOnLogout();
      const logoutSuccess = await logout();
      
      if (logoutSuccess) {
        // Force navigation to login and prevent going back
        navigate('/login', { replace: true });
      } else {
        console.error('Logout failed');
        alert('There was a problem logging out. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('There was a problem logging out. Please try again.');
    }
  };

  const handleRatingSubmit = async () => {
    try {
      if (!rating) {
        alert('Please select a rating');
        return;
      }

      await axios.post('/reviews/rating', {
        productID: selectedProduct.productID,
        customerID: userData.customer.customerID,
        rating: parseInt(rating)
      });

      setShowRatingPopup(false);
      setSelectedProduct(null);
      setRating("");
      
      // Refresh orders data
      const response = await axios.get('/order/past');
      setUserData(prev => ({
        ...prev,
        pastOrders: response.data
      }));

      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.response?.data?.msg || 'Failed to submit rating');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      if (!comment.trim()) {
        alert('Please write a review');
        return;
      }

      await axios.post('/reviews/review', {
        productID: selectedProduct.productID,
        customerID: userData.customer.customerID,
        reviewContent: comment.trim()
      });

      setShowReviewPopup(false);
      setSelectedProduct(null);
      setComment("");
      
      // Refresh orders data
      const response = await axios.get('/order/past');
      setUserData(prev => ({
        ...prev,
        pastOrders: response.data
      }));

      alert('Review submitted successfully and pending approval!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.msg || 'Failed to submit review');
    }
  };

  // Enhance the handleReturnRequest function to immediately update UI on submission
  const handleReturnRequest = async () => {
    try {
      // Validate input
      if (!returnReason.trim()) {
        setReturnSuccess(false);
        setReturnMessage('Please provide a reason for your return');
        return;
      }

      // Show progress
      setReturnMessage('Processing your return request...');

      // Submit the return request
      const response = await axios.post('/order/return', {
        orderID: selectedOrder?.orderID,
        productID: selectedProduct?.productID,
        reason: returnReason,
        quantity: returnQuantity
      });
      
      console.log('Return request successful:', response.data);
      
      // Success handling
      setReturnSuccess(true);
      setReturnMessage(`Return request submitted and pending approval`);
      
      // Create a new return object that matches the API return format
      const newReturn = {
        requestID: response.data.requestID,
        returnStatus: 'pending',
        reason: returnReason,
        orderID: selectedOrder.orderID,
        productID: selectedProduct.productID,
        quantity: returnQuantity,
        customerID: userData.customer.customerID,
        orderNumber: selectedOrder.orderNumber,
        productName: selectedProduct.name,
        approvalStatus: 'pending'
      };
      
      // Add the new return to the returns array - do this FIRST
      setReturns(prev => [newReturn, ...(Array.isArray(prev) ? prev : [])]);
      
      // Show success message then close popup
      setTimeout(() => {
        setShowReturnPopup(false);
        
        // After closing popup, refresh all data from server
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 500);
      }, 2000);
      
    } catch (error) {
      console.error('Return error:', error);
      setReturnSuccess(false);
      setReturnMessage(error.response?.data?.message || 'Error processing return request');
    }
  };

  // Update your isEligibleForReturn function to be more robust
  const isEligibleForReturn = (order, productID) => {
    try {
      // First check delivery status - must be delivered
      if (!order.deliveryStatus || order.deliveryStatus.toLowerCase() !== 'delivered') {
        console.log(`Product ${productID} not eligible: order status is ${order.deliveryStatus}`);
        return false;
      }
      
      // Check if delivered within the last month
      const deliveredDate = new Date(order.timeOrdered);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      if (deliveredDate < oneMonthAgo) {
        console.log(`Product ${productID} not eligible: delivered too long ago`);
        return false;
      }
      
      // Check if a return request already exists for this product in this order
      const hasExistingReturn = returns.some(returnItem => 
        returnItem.orderID === order.orderID && returnItem.productID === productID
      );
      
      if (hasExistingReturn) {
        console.log(`Product ${productID} not eligible: return already exists`);
        return false;
      }
      
      console.log(`Product ${productID} is eligible for return`);
      // Product is eligible if it's within return window AND no existing return request
      return true;
    } catch (error) {
      console.error('Error in isEligibleForReturn:', error);
      return false;
    }
  };

  const getProgressWidth = (status) => {
    if (!status) return '0%';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus === 'processing') return '33%';
    if (normalizedStatus === 'in-transit' || normalizedStatus === 'intransit') return '66%';
    if (normalizedStatus === 'delivered') return '100%';
    
    // Default for other statuses
    return '0%';
  };

  // Enhance the error handling in handleCancelOrder
  const handleCancelOrder = async (orderID) => {
    try {
      // Confirm with user
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        return;
      }
      
      // Call API to cancel order
      const response = await axios.put(`/order/cancel/${orderID}`);
      
      console.log('Order cancellation response:', response.data);
      
      // Update UI to reflect cancellation
      setUserData(prevData => ({
        ...prevData,
        activeOrders: prevData.activeOrders.filter(order => order.orderID !== orderID)
      }));
      
      // Show success message
      alert('Order cancelled successfully!');
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error cancelling order:', error);
      
      // Show more detailed error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to cancel order. Please try again.';
      
      alert(`Order cancellation failed: ${errorMessage}`);
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (error) return <div className="profile-container">Error: {error}</div>;
  if (!userData) return <div className="profile-container">No user data available</div>;

  const activeOrders = userData?.activeOrders || [];
  const pastOrders = userData?.pastOrders || [];

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>👤 My Profile</h1>

        <div className="profile-section">
          <h3>Name:</h3>
          <p>{userData.user?.name || 'Not provided'}</p>
        </div>

        <div className="profile-section">
          <h3>Username:</h3>
          <p>{userData.user?.username || 'Not provided'}</p>
        </div>

        <div className="profile-section">
          <h3>Email:</h3>
          <p>{userData.user?.email || 'Not provided'}</p>
        </div>

        {/* Address section - direct access to fields in customer object */}
        {userData.customer && (
          <div className="profile-section">
            <h3>Address Info:</h3>
            <p>{userData.customer.addressTitle || 'No title'}</p>
            <p>
              {[
                userData.customer.streetAddress,
                userData.customer.city,
                userData.customer.province,
                userData.customer.zipCode
              ].filter(Boolean).join(', ')}
            </p>
            <p>{userData.customer.country || 'Country not specified'}</p>
          </div>
        )}

        <div className="profile-section">
          <h3>Phone:</h3>
          <p>{userData.customer?.phone || 'Not provided'}</p>
        </div>

        {/* Added Tax ID section */}
        <div className="profile-section">
          <h3>Tax ID:</h3>
          <p>{userData.customer?.taxID || 'Not provided'}</p>
        </div>

        <div className="profile-section">
          <h3>Active Orders</h3>
          {activeOrders.length > 0 ? (
            <div className="orders-list">
              {activeOrders.map((order) => (
                <div key={order.orderID} className="order-item">
                  <h4>Order #{order.orderNumber}</h4>
                  <div className="order-details">
                    <div className="order-status-section">
                      <div className="status-and-address">
                        <p className="order-status">Status: {order.deliveryStatus}</p>
                        
                        {/* Display delivery address info right after status */}
                        <div className="status-delivery-address">
                          <p>Delivering to: {order.deliveryAddress?.addressTitle || 'Not specified'}</p>
                          <p>{order.deliveryAddress?.streetAddress}</p>
                          <p>{[order.deliveryAddress?.city, order.deliveryAddress?.province, order.deliveryAddress?.zipCode].filter(Boolean).join(', ')}</p>
                          <p>{order.deliveryAddress?.country}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p>Date: {new Date(order.timeOrdered).toLocaleDateString()}</p>
                    <p>Total: ${order.totalPrice}</p>
                    
                    {/* Cancel button for processing orders */}
                    {order.deliveryStatus.toLowerCase() === 'processing' && (
                      <button 
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order.orderID)}
                      >
                        Cancel Order
                      </button>
                    )}
                    
                    <div className="order-tracker">
                      <div className="tracker-line">
                        <div 
                          className="progress" 
                          data-status={order.deliveryStatus}
                          style={{
                            width: getProgressWidth(order.deliveryStatus)
                          }}
                        />
                      </div>
                      <div className="status-points">
                        <span>Processing</span>
                        <span>In-transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                    {order.products && (
                      <div className="order-products">
                        {order.products.map(product => (
                          <div key={product.productID} className="order-product-item">
                            <p>{product.name} - Quantity: {product.quantity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders-message">No active orders</p>
          )}
        </div>

        <div className="profile-section">
          <h3>Past Orders</h3>
          {pastOrders.length > 0 ? (
            <div className="orders-list">
              {pastOrders.map((order) => (
                <div key={order.orderID} className="order-item">
                  <h4>Order #{order.orderNumber}</h4>
                  <div className="order-details">
                    <p>Date: {new Date(order.timeOrdered).toLocaleDateString()}</p>
                    <p>Total: ${order.totalPrice}</p>
                    {order.products?.map((product) => (
                      <div key={product.productID} className="order-product">
                        <p>{product.name} - Quantity: {product.quantity}</p>
                        <div className="review-actions">
                          {!product.rated && (
                            <button 
                              className="rate-btn"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowRatingPopup(true);
                              }}
                            >
                              Rate Product
                            </button>
                          )}
                          {!product.reviewed && (
                            <button 
                              className="review-btn"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowReviewPopup(true);
                              }}
                            >
                              Write Review
                            </button>
                          )}
                          {/* Update the return button to work dynamically */}
                          {isEligibleForReturn(order, product.productID) && (
                            <button 
                              className="return-btn"
                              onClick={() => {
                                setSelectedOrder(order);
                                setSelectedProduct(product);
                                setReturnQuantity(1);
                                setReturnReason("");
                                setReturnMessage("");
                                setReturnSuccess(false);
                                setShowReturnPopup(true);
                              }}
                            >
                              Return Item
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders-message">No past orders</p>
          )}
        </div>

        {/* Add this after the Past Orders section */}
        <div className="profile-section">
          <h3>Cancelled Orders</h3>
          {userData.cancelledOrders && userData.cancelledOrders.length > 0 ? (
            <div className="orders-list">
              {userData.cancelledOrders.map((order) => (
                <div key={order.orderID} className="order-item cancelled">
                  <h4>Order #{order.orderNumber}</h4>
                  <div className="order-details">
                    <p>Date: {new Date(order.timeOrdered).toLocaleDateString()}</p>
                    <p>Cancelled on: {new Date(order.lastUpdated || order.timeOrdered).toLocaleDateString()}</p>
                    <p>Total: ${order.totalPrice}</p>
                    <div className="order-status cancelled">
                      <span>Cancelled</span>
                    </div>
                    {order.products && (
                      <div className="order-products">
                        {order.products.map(product => (
                          <div key={product.productID} className="order-product-item">
                            <p>{product.name} - Quantity: {product.quantity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-orders-message">No cancelled orders</p>
          )}
        </div>

        {/* Return Requests Section */}
        <div className="profile-section">
          <h3>Return Requests</h3>
          
          {console.log('Rendering ALL return requests:', returns)}
          
          {returns && returns.length > 0 ? (
            <div className="returns-list">
              {returns.map((returnItem) => (
                <div key={returnItem.requestID || Math.random()} className="return-item">
                  <h4>Return Request #{returnItem.requestID}</h4>
                  <div className="return-details">
                    <p><strong>Product:</strong> {returnItem.productName || 'Unknown Product'}</p>
                    <p><strong>Order #:</strong> {returnItem.orderNumber || 'N/A'}</p>
                    <p><strong>Quantity:</strong> {returnItem.quantity}</p>
                    <p><strong>Reason:</strong> {returnItem.reason}</p>
                    <div className={`return-status ${returnItem.approvalStatus || returnItem.returnStatus || 'pending'}`}>
                      <strong>Status:</strong> {
                        returnItem.approvalStatus ? 
                        (returnItem.approvalStatus.charAt(0).toUpperCase() + returnItem.approvalStatus.slice(1)) : 
                        returnItem.returnStatus ? 
                        (returnItem.returnStatus.charAt(0).toUpperCase() + returnItem.returnStatus.slice(1)) : 
                        'Pending'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-returns-message">
              <p>No return requests</p>
              
              <button 
                onClick={async () => {
                  try {
                    console.log('Debug: Customer ID =', userData.customer?.customerID);
                    
                    // First try the direct route with customer ID
                    if (userData.customer?.customerID) {
                      const directResponse = await axios.get(`/order/returns/customer/${userData.customer.customerID}`);
                      console.log('Direct returns query response:', directResponse.data);
                      
                      if (directResponse.data && directResponse.data.length > 0) {
                        setReturns(directResponse.data);
                        alert(`Found ${directResponse.data.length} returns using direct query`);
                        return;
                      } else {
                        console.log('No returns found with direct query');
                      }
                    }
                    
                    // Then try the authenticated route
                    const returnsResponse = await axios.get('/order/returns');
                    console.log('Authenticated returns response:', returnsResponse.data);
                    
                    if (returnsResponse.data && returnsResponse.data.length > 0) {
                      setReturns(returnsResponse.data);
                      alert(`Found ${returnsResponse.data.length} returns via authentication`);
                    } else {
                      alert('No return requests found');
                    }
                  } catch (error) {
                    console.error('Debug check failed:', error);
                    alert(`Error: ${error.message}`);
                  }
                }}
                style={{ fontSize: '12px', padding: '5px', marginTop: '10px' }}
              >
                Debug: Check All Returns
              </button>
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Rating Popup */}
      {showRatingPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Rate Product</h4>
            <p>{selectedProduct?.name}</p>
            
            <div className="rating-select">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setRating(star)}
                  className={`star ${rating >= star ? 'selected' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="popup-actions">
              <button onClick={handleRatingSubmit}>Submit Rating</button>
              <button onClick={() => {
                setShowRatingPopup(false);
                setSelectedProduct(null);
                setRating("");
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Popup */}
      {showReviewPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Write Review</h4>
            <p>{selectedProduct?.name}</p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              rows={4}
            />

            <div className="popup-actions">
              <button onClick={handleReviewSubmit}>Submit Review</button>
              <button onClick={() => {
                setShowReviewPopup(false);
                setSelectedProduct(null);
                setComment("");
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Popup */}
      {showReturnPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Return Product</h4>
            <p>{selectedProduct?.name}</p>
            
            {returnMessage && (
              <div className={`return-message ${returnSuccess ? 'success' : 'error'}`}>
                {returnMessage}
              </div>
            )}

            {!returnSuccess && (
              <>
                <div className="form-group">
                  <label>Quantity to Return:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedProduct?.quantity || 1}
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Return:</label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Please explain why you're returning this item..."
                    rows={4}
                    className="reason-input"
                  />
                </div>

                <div className="popup-actions">
                  <button 
                    onClick={() => {
                      console.log('Return request data:', {
                        orderID: selectedOrder?.orderID,
                        productID: selectedProduct?.productID,
                        reason: returnReason,
                        quantity: returnQuantity,
                        order: selectedOrder
                      });
                      handleReturnRequest();
                    }}
                  >
                    Submit Return
                  </button>
                  <button onClick={() => setShowReturnPopup(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
