import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { isUserLogged, logout, axios } from "../utils/auth";  // Update this line
import "../styles/ProfilePage.css";
import { CartContext } from "../context/CartContext";

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = isUserLogged();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get user profile data
        const profileResponse = await axios.get('/user/profile');
        
        // Get both active and past orders
        const activeOrdersResponse = await axios.get('/order/active');
        const pastOrdersResponse = await axios.get('/order/past');
        
        console.log('Active orders:', activeOrdersResponse.data);
        console.log('Past orders:', pastOrdersResponse.data);

        setUserData({
          ...profileResponse.data,
          activeOrders: activeOrdersResponse.data,
          pastOrders: pastOrdersResponse.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
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

        <div className="profile-section">
          <h3>Phone:</h3>
          <p>{userData.customer?.phone || 'Not provided'}</p>
        </div>

        {userData.address && (
          <div className="profile-section">
            <h3>Address Info:</h3>
            <p>{userData.address.addressTitle || 'No title'}</p>
            <p>
              {[
                userData.address.streetAddress,
                userData.address.city,
                userData.address.province,
                userData.address.zipCode
              ].filter(Boolean).join(', ')}
            </p>
            <p>{userData.address.country}</p>
          </div>
        )}

        <div className="profile-section">
          <h3>Active Orders</h3>
          {activeOrders.length > 0 ? (
            <div className="orders-list">
              {activeOrders.map((order) => (
                <div key={order.orderID} className="order-item">
                  <h4>Order #{order.orderNumber}</h4>
                  <div className="order-details">
                    <p>Status: {order.deliveryStatus}</p>
                    <p>Date: {new Date(order.timeOrdered).toLocaleDateString()}</p>
                    <p>Total: ${order.totalPrice}</p>
                    <div className="order-tracker">
                      <div className="tracker-line">
                        <div 
                          className="progress" 
                          data-status={order.deliveryStatus}
                          style={{
                            width: order.deliveryStatus === 'Processing' ? '33%' :
                                   order.deliveryStatus === 'In-transit' ? '66%' : '100%'
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
    </div>
  );
};

export default ProfilePage;
