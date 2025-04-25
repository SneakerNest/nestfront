import React, { useState, useContext } from "react";
import "../styles/CartPage.css";
import CartList from "./CartList";
import PaymentSection from "./PaymentSection";
import OrderSummary from "./OrderSummary";
import OrderConfirmation from "./OrderConfirmation";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function CartPage() {
  const [cartStep, setCartStep] = useState("summary");
  const { cartItems } = useContext(CartContext);
  const [confirmationData, setConfirmationData] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handlePaymentSubmit = () => {
    setConfirmationData(cartItems);
    setCartStep("confirmation");
  };

  const handleReviewSubmit = (productId, rating, comment) => {
    setPendingReviews((prev) => [
      ...prev,
      { productId, rating, comment, submittedAt: new Date() },
    ]);
    setShowForm(false);
  };

  return (
    <div className="cart-page">
      <div className="cart-left">
        <CartList />
      </div>

      <div className="cart-right">
        {cartStep === "summary" && (
          <OrderSummary
            onNext={() => {
              if (isUserLogged()) {
                setCartStep("payment");
              } else {
                alert("Please log in to proceed with payment.");
                navigate("/login");
              }
            }}
          />
        )}

        {cartStep === "payment" && (
          <PaymentSection onSubmit={handlePaymentSubmit} />
        )}

        {cartStep === "confirmation" && (
          <>
            <OrderConfirmation items={confirmationData} />

            <div className="review-section-cart">
              <h3>Leave a Review</h3>

              {pendingReviews.map((r, i) => {
                const prod = confirmationData.find((p) => p.id === r.productId);
                return (
                  <div className="review-submitted" key={i}>
                    <strong>{prod?.name}</strong> — {r.comment} (
                    <em>{r.rating} / 5</em>) <br />
                    <small>Pending approval</small>
                  </div>
                );
              })}

              {showForm ? (
                <ReviewForm
                  products={confirmationData}
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <button
                  className="add-review-btn"
                  onClick={() => setShowForm(true)}
                >
                  + Add Review
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ products, onSubmit, onCancel }) {
  const [productId, setProductId] = useState(products[0]?.id || null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSend = () => {
    if (!comment.trim()) return;
    onSubmit(productId, rating, comment.trim());
    setComment("");
  };

  return (
    <div className="review-form">
      <div className="form-row">
        <label>Product:</label>
        <select
          value={productId}
          onChange={(e) => setProductId(parseInt(e.target.value, 10))}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row stars-input">
        {[1, 2, 3, 4, 5].map((s) => (
          <FontAwesomeIcon
            key={s}
            icon={faStar}
            className="star"
            color={s <= rating ? "#ffc107" : "#ddd"}
            onClick={() => setRating(s)}
          />
        ))}
      </div>

      <div className="form-row">
        <textarea
          placeholder="Your comments…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="form-row form-actions">
        <button
          className="submit-review-btn"
          onClick={handleSend}
          disabled={!comment.trim()}
        >
          Submit
        </button>
        <button className="cancel-review-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
