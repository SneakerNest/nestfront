import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isUserLogged, logout } from "../utils/auth";
import products from "../data/products";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const loggedIn = isUserLogged(); // <- moved outside condition
  const [reviews, setReviews] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  
  
  if (!loggedIn) {
    navigate("/login");
    return null;
  }



  const userInfo = {
    name: "Tan Berk Doker",
    username: "tdoker",
    email: "tdoker@gmail.com",
    phone: "1234567890",
    address: {
      adressTitle: "Home",
      country: "Turkey",
      city: "Tuzla",
      province: "Istanbul",
      zipCode: "34000",
      streetAddress: "Orta Mahalle, Üniversite Caddesi",
    },
    orders: [
      {
        id: "ORD1003",
        date: "2024-04-18",
        total: 139.99,
        items: [
          { productId: 1, quantity: 1, price: 139.99 },
        ],
        status: "processing",
      },
      {
        id: "ORD1002",
        date: "2024-04-15",
        total: 219.99,
        items: [
          { productId: 2, quantity: 2, price: 109.99 },
        ],
        status: "in_transit",
      },
      {
        id: "ORD1001",
        date: "2024-04-10",
        total: 129.99,
        items: [
          { productId: 3, quantity: 1, price: 129.99 },
        ],
        status: "delivered",
      },
      {
        id: "ORD1000",
        date: "2024-04-10",
        total: 129.99,
        items: [
          { productId: 9, quantity: 1, price: 129.99 },
          { productId: 10, quantity: 1, price: 129.99 },
          { productId: 2, quantity: 1, price: 129.99 },
        ],
        status: "delivered",
      },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleReviewSubmit = () => {
    if (selectedOrder && selectedProductId && (comment.trim() || rating)) {
      const newReviews = [];
  
      if (rating) {
        newReviews.push({
          orderId: selectedOrder.id,
          productId: selectedProductId,
          rating,
          status: "approved" // rating is instantly saved
        });
      }
  
      if (comment.trim()) {
        newReviews.push({
          orderId: selectedOrder.id,
          productId: selectedProductId,
          comment,
          status: "pending" // comment needs approval
        });
      }
  
      setReviews((prev) => [...prev, ...newReviews]);
      setComment("");
      setSelectedOrder(null);
      setSelectedProductId(null);
    }
  };
  

  const activeOrders = userInfo.orders.filter(
    (order) => order.status === "processing" || order.status === "in_transit"
  );

  const pastOrders = userInfo.orders.filter(
    (order) => order.status === "delivered"
  );

  const renderOrder = (order) => {
    const progressWidth =
      order.status === "processing"
        ? "15%"
        : order.status === "in_transit"
        ? "50%"
        : "100%";

    return (
      <li key={order.id} className="order-item">
        <p>
          <strong>Order #{order.id}</strong> - {order.date} - ${order.total}
        </p>
        {order.items.map((item, i) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <p key={i}>
              {product?.name || "Unknown"} — Qty: {item.quantity} — Price: $
              {item.price}
            </p>
          );
        })}
        <div className="order-tracker">
          <div className="tracker-line">
            <div className="tracker-line-fill" style={{ width: progressWidth }}></div>
            {["processing", "in_transit", "delivered"].map((stage, index) => {
              const isActive =
                stage === order.status ||
                (stage === "in_transit" && order.status === "delivered") ||
                (stage === "processing" &&
                  ["in_transit", "delivered"].includes(order.status));
              return (
                <div
                  key={index}
                  className={`tracker-step ${isActive ? "active" : ""}`}
                >
                  <div className="circle"></div>
                  <span>{stage.replace("_", " ")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {order.status === "delivered" && (
          <div className="review-section">
            <button
              className="review-btn"
              onClick={() => {
                setSelectedOrder(order);
                setSelectedProductId(order.items[0].productId);
              }}
            >
              + Add Review
            </button>
          {selectedOrder?.id === order.id && (
            <div className="review-popup">
              <h4>Leave a review for Order #{selectedOrder.id}</h4>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
              >
                {selectedOrder.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <option key={item.productId} value={item.productId}>
                      {product?.name}
                    </option>
                  );
                })}
              </select>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
              />
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      cursor: "pointer",
                      color: rating >= star ? "#ffc107" : "#ddd",
                      fontSize: "20px",
                    }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button onClick={handleReviewSubmit}>Submit Review</button>
            </div>
          )}
            {reviews
              .filter((review) => review.orderId === order.id)
              .map((review, idx) => {
                const product = products.find(p => p.id === review.productId);
                return (
                  <div key={idx} className="order-review">
                    <p>
                      <strong>{product?.name || "Unknown Product"}</strong>
                    </p>
                    {review.rating && (
                      <p className="review-rating">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                    )}
                    {review.comment && (
                      <p className="review-comment">"{review.comment}"</p>
                    )}
                    <span className={`review-status ${review.status}`}>
                      {review.status === "pending" && "Pending Approval"}
                      {review.status === "approved" && "Approved"}
                      {review.status === "rejected" && "Rejected"}
                    </span>
                </div>
              );
            })}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>👤 My Profile</h1>
  
        <div className="profile-section">
          <h3>Name:</h3>
          <p>{userInfo.name}</p>
        </div>
        <div className="profile-section">
          <h3>Username:</h3>
          <p>{userInfo.username}</p>
        </div>
        <div className="profile-section">
          <h3>Email:</h3>
          <p>{userInfo.email}</p>
        </div>
        <div className="profile-section">
          <h3>Phone:</h3>
          <p>{userInfo.phone}</p>
        </div>
  
        <div className="profile-section">
          <h3>Address Info:</h3>
          <p>{userInfo.address.adressTitle}</p>
          <p>
            {userInfo.address.streetAddress}, {userInfo.address.city},{" "}
            {userInfo.address.province}, {userInfo.address.zipCode}
          </p>
          <p>{userInfo.address.country}</p>
        </div>
  
        <div className="profile-section">
          <h3>Active Orders</h3>
          <ul className="order-list">
            {activeOrders.length > 0 ? (
              activeOrders.map(renderOrder)
            ) : (
              <p>No active orders.</p>
            )}
          </ul>
        </div>
  
        <div className="profile-section">
          <h3>Past Orders</h3>
          <ul className="order-list">
            {pastOrders.length > 0 ? (
              pastOrders.map(renderOrder)
            ) : (
              <p>No past orders.</p>
            )}
          </ul>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};
export default ProfilePage;
