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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = isUserLogged();
        if (!user) {
          navigate('/login');
          return;
        }

        // Add the token to the request headers
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/v1/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Profile data:', response.data);
        
        // Verify the data belongs to the logged-in user
        if (response.data.user?.username !== user.username) {
          console.error('Mismatched user data');
          logout();
          navigate('/login');
          return;
        }

        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await clearCartOnLogout();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      if (!rating) {
        alert('Please select a rating');
        return;
      }

      // Changed from /reviews/submit to /store/product/{productID}/reviews
      await axios.post(`http://localhost:5001/api/v1/store/product/${selectedProduct.productID}/reviews`, {
        productID: selectedProduct.productID,
        customerID: userData.customer.customerID,
        reviewStars: parseInt(rating),
        approvalStatus: 1 // Ratings are auto-approved
      });

      setShowRatingPopup(false);
      setSelectedProduct(null);
      setRating("");
      
      // Refresh user data to update review status
      const response = await axios.get('http://localhost:5001/api/v1/user/profile');
      setUserData(response.data);
      alert('Rating submitted and updated successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      console.log('Error details:', error.response?.data); // Add this for debugging
      alert(error.response?.data?.msg || 'Failed to submit rating');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      if (!comment.trim()) {
        alert('Please write a review');
        return;
      }

      // Changed endpoint to match the same pattern as ratings
      await axios.post(`http://localhost:5001/api/v1/store/product/${selectedProduct.productID}/reviews`, {
        productID: selectedProduct.productID,
        customerID: userData.customer.customerID,
        reviewContent: comment.trim(),
        approvalStatus: 0 // Reviews need approval
      });

      setShowReviewPopup(false);
      setSelectedProduct(null);
      setComment("");
      
      // Refresh user data to update review status
      const response = await axios.get('http://localhost:5001/api/v1/user/profile');
      setUserData(response.data);
      alert('Review submitted successfully and pending approval!');
    } catch (error) {
      console.error('Error submitting review:', error);
      console.log('Error details:', error.response?.data); // Add debug logging
      alert(error.response?.data?.msg || 'Failed to submit review');
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (error) return <div className="profile-container">Error: {error}</div>;
  if (!userData) return <div className="profile-container">No user data available</div>;

  const activeOrders = userData.orders?.filter(
    order => ['Processing', 'In Transit'].includes(order.deliveryStatus)
  ) || [];

  const pastOrders = userData.orders?.filter(
    order => order.deliveryStatus === 'Delivered'
  ) || [];

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
                    <p>Total: ${order.totalPrice}</p>
                    <div className="order-tracker">
                      <div className="tracker-line">
                        <div className="progress" style={{
                          width: order.deliveryStatus === 'Processing' ? '33%' :
                                order.deliveryStatus === 'In Transit' ? '66%' : '100%'
                        }}></div>
                      </div>
                    </div>
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
