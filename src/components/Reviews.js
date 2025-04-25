// src/components/Reviews.js
import React, { useState } from "react";
import Slider from "react-slick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import reviews from "../data/reviewsdata";
import "../styles/Reviews.css";

export default function Reviews({ productId }) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <FontAwesomeIcon icon={faChevronLeft} className="slick-prev" />,
    nextArrow: <FontAwesomeIcon icon={faChevronRight} className="slick-next" />,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  // only show reviews for this product (or all if no productId passed)
  const filtered = productId
    ? reviews.filter((r) => r.productId === productId)
    : reviews;

  return (
    <div className="reviews-wrapper">
      <Slider {...settings}>
        {filtered.map((r) => (
          <ReviewCard key={r.id} {...r} />
        ))}
      </Slider>
    </div>
  );
}

function ReviewCard({ avatar, name, rating, text, time }) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    text.length > 100 && !expanded ? text.slice(0, 100) + "…" : text;

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-header-bg" />
        <img src={avatar} alt={name} className="review-avatar" />
        <div className="review-header-content">
          <div className="review-name">{name}</div>
          <div className="review-stars">
            {Array(rating)
              .fill()
              .map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} />
              ))}
          </div>
        </div>
      </div>

      <div className="review-body">
        <p className="review-text">{preview}</p>
        {text.length > 100 && !expanded && (
          <span className="show-more" onClick={() => setExpanded(true)}>
            Show More
          </span>
        )}
      </div>

      {/* only show the timestamp now */}
      <div className="review-footer">
        <span className="time">{time}</span>
      </div>
    </div>
  );
}
