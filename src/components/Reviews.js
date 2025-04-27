import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import "../styles/Reviews.css";

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/v1/reviews/${productId}`);
        setReviews(response.data);
        
        // Calculate average rating
        const avgRating = response.data.reduce((acc, review) => acc + review.rating, 0) / response.data.length;
        setAverageRating(avgRating || 0);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <span>{averageRating.toFixed(1)}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStarSolid}
                  className={star <= averageRating ? "star-filled" : "star-empty"}
                />
              ))}
            </div>
            <p>Based on {reviews.length} reviews</p>
          </div>
        </div>
      </div>

      <div className="review-cards">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <img
                  src="/default-profile.png"
                  alt="User Avatar"
                  className="review-avatar"
                />
                <div className="reviewer-info">
                  <h3>{review.username || "Anonymous"}</h3>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStarSolid}
                        className={star <= review.rating ? "star-filled" : "star-empty"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
              {review.verifiedPurchase && (
                <span className="verified-badge">Verified Purchase</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
