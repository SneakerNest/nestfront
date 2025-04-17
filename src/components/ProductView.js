import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import products from "../data/products";
import "../styles/ProductView.css";
import { WishlistContext } from "../context/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const reviewData = [
  {
    id: 1,
    name: "Jane Lee",
    avatar: "https://i.pravatar.cc/80?img=1",
    time: "Just now",
    rating: 5,
    text: "I recently had the pleasure of experiencing the Converse Red, and I must say, it exceeded my expectations. From the comfort of the insole to the sleek streetwear look, these kicks are a must-have!"
  },
  {
    id: 2,
    name: "Ralph Edwards",
    avatar: "https://i.pravatar.cc/80?img=2",
    time: "3 hours ago",
    rating: 5,
    text: "The Yeezy Slide Black is incredibly comfortable and the quality is top-notch. Perfect fit and stylish—everything I wanted in a slip-on shoe."
  },
  {
    id: 3,
    name: "Kristin Watson",
    avatar: "https://i.pravatar.cc/80?img=3",
    time: "2 days ago",
    rating: 4,
    text: "Love the overall style and color options. The sizing was a bit snug but still manageable. Definitely turning heads when I step out in these."
  }
];

const ProductView = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));
  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState("default");

  const sizes = [38, 39, 40, 41, 42, 43, 44];
  const colors = ["default", "red", "gray", "white"];

  const reviewSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <FontAwesomeIcon icon={faChevronLeft} className="slick-prev" />,
    nextArrow: <FontAwesomeIcon icon={faChevronRight} className="slick-next" />,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="product-view-page">
      <div className="product-view-container">
        <div className="image-section">
          <img src={product.image} alt={product.name} className="product-main-img" />
        </div>
        <div className="info-section">
          <span className="product-new-tag">New!</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-subtitle">Unisex Shoes</p>
          <p className="product-description">
            This is a temporary description. The {product.name} blends comfort and style into the ultimate streetwear experience.
          </p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <div className="color-options">
            {colors.map((c) => (
              <div
                key={c}
                className={`color-dot ${c} ${selectedColor === c ? "active" : ""}`}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>
          <div className="size-section">
            <p className="size-label">Size (EU)</p>
            <div className="sizes">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={`size-btn ${selectedSize === s ? "selected" : ""}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="actions">
            <button className="cart-button">Add to Cart</button>
            <button className="wishlist-button" onClick={() => toggleWishlistItem(product)}>
              Favorite <FontAwesomeIcon icon={faHeart} color={isInWishlist(product.id) ? "red" : "black"} />
            </button>
          </div>
        </div>
      </div>
      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        <Slider {...reviewSettings} className="reviews-slider">
          {reviewData.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <img src={r.avatar} alt={r.name} className="review-avatar" />
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-time">{r.time}</p>
                  <div className="review-stars">
                    {Array(r.rating).fill().map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} color="#ffc107" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductView;