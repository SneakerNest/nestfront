// src/components/ProductView.js
import React, { useContext, useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProductView.css";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import Reviews from "./Reviews";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mainImage, setMainImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewers, setReviewers] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/v1/store/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/v1/store/product/${id}/reviews/approved`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    const fetchReviewerData = async () => {
      if (reviews.length > 0) {
        try {
          const uniqueCustomerIds = [...new Set(reviews.map(review => review.customerID))];
          const reviewerData = {};
          
          for (const customerId of uniqueCustomerIds) {
            // Get customer data with username
            const response = await axios.get(`http://localhost:5001/api/v1/store/customers/${customerId}`);
            const customer = response.data;
            // Get user data for the customer
            const userResponse = await axios.get(`http://localhost:5001/api/v1/store/users/${customer.username}`);
            reviewerData[customerId] = userResponse.data.name; // Use the user's name from USERS table
          }
          
          setReviewers(reviewerData);
        } catch (error) {
          console.error('Error fetching reviewer data:', error);
        }
      }
    };

    fetchReviewerData();
  }, [reviews]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <Navigate to="/product-page" replace />;

  const getImageUrl = (picturePath) => {
    if (!picturePath) return '/placeholder.jpg';
    return `http://localhost:5001/api/v1/images/${picturePath}`;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }
    addToCart({ ...product, size: selectedSize });
  };

  return (
    <div className="product-view-page">
  <div className="product-view-container">
    
    {/* Image Gallery */}
    <div className="product-gallery">
      <div className="main-image">
        <img 
          src={getImageUrl(product.pictures?.[mainImage])} 
          alt={product.name}
          onError={(e) => {e.target.src = '/placeholder.jpg'}}
        />
      </div>
      <div className="thumbnail-strip">
        {product.pictures?.map((pic, index) => (
          <div 
            key={index} 
            className={`thumbnail ${mainImage === index ? 'active' : ''}`}
            onClick={() => setMainImage(index)}
          >
            <img src={getImageUrl(pic)} alt={`${product.name} view ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>

    {/* Product Info */}
    <div className="product-info">
      {product.isNew && <span className="new-badge">NEW!</span>}
      <h1>{product.name}</h1>
      <p className="subtitle">Unisex Shoes</p>
      
      {/* Add Serial Number */}
      <p className="serial-number">Serial Number: {product.serialNumber}</p>

      {/* Add Rating and Popularity */}
      <div className="product-stats">
        <div className="rating-display">
          {Array.from({ length: 5 }).map((_, index) => (
            <span 
              key={index} 
              className={`star ${index < Math.floor(product.overallRating) ? 'filled' : 'empty'}`}
            >
              ★
            </span>
          ))}
          <span className="rating-number">({product.overallRating})</span>
        </div>
        <div className="popularity-display">
          <span className="popularity-icon"></span>
          <span className="popularity-number">{product.popularity} is the score out of 100 for popularity</span>
        </div>
      </div>

      <p className="product-description">{product.description}</p>

      {/* Price */}
      <div className="product-price">
        <span className="current-price">${Number(product.discountedPrice || product.unitPrice).toFixed(2)}</span>
      </div>

      {/* Material and Warranty Info */}
      <div className="product-details">
        <div className="detail-item">
          <span className="detail-label">Material:</span>
          <span className="detail-value">{product.material}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Warranty:</span>
          <span className="detail-value">{product.warrantyMonths} months</span>
        </div>
        {/* Add Supplier Info */}
        <div className="detail-item">
          <span className="detail-label">Supplier:</span>
          <span className="detail-value">{product.supplierName}</span>
        </div>
      </div>

      {/* Stock Info */}
      <div className="stock-info">
        <span className={product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}>
          {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
        </span>
      </div>

      {/* Size Selection */}
      <div className="size-selector">
        <h3>Size (EU)</h3>
        <div className="size-grid">
          {[38, 39, 40, 41, 42, 43, 44].map(size => (
            <button
              key={size}
              className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="product-actions">
        <button 
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
        <button 
          className={`add-to-wishlist ${isInWishlist(product.productID) ? 'in-wishlist' : ''}`}
          onClick={() => toggleWishlistItem(product)}
        >
          <FontAwesomeIcon icon={faHeartSolid} className="heart-icon" />
        </button>
      </div>
    </div>

  </div>

  {/* Reviews Section */}
  <div className="product-reviews">
    <h2>Customer Reviews</h2>
    {reviewsLoading ? (
      <p>Loading reviews...</p>
    ) : reviews.length > 0 ? (
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={review.reviewID || index} className="review-card">
            <div className="review-header">
              <span className="reviewer-name">
                {reviewers[review.customerID]} {/* Remove the fallback 'User' since we should always get a username */}
              </span>
              <div className="review-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`star ${i < review.reviewStars ? "filled" : "empty"}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="review-content-wrapper">
              {review.reviewContent && (
                <p className="review-content">{review.reviewContent}</p>
              )}
              {review.reviewStars && (
                <div className="review-stats">
                  <div className="review-stars">Rating: {review.reviewStars}/5</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="no-reviews">No reviews yet for this product.</p>
    )}
  </div>
</div>
  );
};

export default ProductView;
