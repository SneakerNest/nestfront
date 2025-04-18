import React, { useContext, useState } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import "../styles/WishlistPage.css";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const WishlistPage = () => {
  const { wishlist, toggleWishlistItem } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [selectedSizes, setSelectedSizes] = useState({});
  const step = 1; // Always show first step (Favorite) on wishlist page only

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleProceed = (productId) => {
    const product = wishlist.find((item) => item.id === productId);
    const size = selectedSizes[productId];

    if (product && size) {
      addToCart({ ...product, size });
    }
  };

  const progressionLabels = ["Favorite", "Confirm Order", "Payment", "Delivered"];

  const getProgressPercent = () => {
    return ((step - 1) / (progressionLabels.length - 1)) * 100;
  };

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title-main">My Favorites</h1>

      {/* Visual Red Progress Bar */}
      <div className="status-bar">
        <div className="status-header">
          <span className="status-label">Order Progress</span>
          <span className="status-step">{progressionLabels[step - 1]}</span>
        </div>
        <div className="status-line">
          <div className="status-fill" style={{ width: `${getProgressPercent()}%` }}></div>
        </div>
        <div className="status-points">
          {progressionLabels.map((label, i) => (
            <div key={i} className="status-point">
              <span className={step === i + 1 ? "highlight-label" : ""}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="wishlist-grid">
        {wishlist.length === 0 ? (
          <p className="empty-message">Your wishlist is empty.</p>
        ) : (
          wishlist.map((item) => (
            <div className="wishlist-card" key={item.id}>
              <button
                className="remove-icon"
                onClick={() => toggleWishlistItem(item)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <img src={item.image} alt={item.name} className="wishlist-img" />
              <div className="wishlist-details">
                <h3 className="wishlist-product-name"><strong>{item.name}</strong></h3>
                <p className="wishlist-price">{item.price.toLocaleString()} TL</p>

                <div className="action-row">
                  <select
                    id={`size-${item.id}`}
                    value={selectedSizes[item.id] || ""}
                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                  >
                    <option value="">Body</option>
                    {["36", "37", "38", "39", "40", "41", "42", "43", "44"].map(
                      (size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleProceed(item.id)}
                    disabled={!selectedSizes[item.id]}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistPage;