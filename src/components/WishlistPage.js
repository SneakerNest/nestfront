import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import "../styles/WishlistPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, loading, error, toggleWishlistItem } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [selectedSizes, setSelectedSizes] = useState({});

  React.useEffect(() => {
    if (!isUserLogged()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleMoveToCart = async (product) => {
    const size = selectedSizes[product.productID];
    if (!size) {
      alert("Please select a size");
      return;
    }

    try {
      await addToCart({ ...product, size });
      await toggleWishlistItem(product);
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Failed to move item to cart');
    }
  };

  const getImageUrl = (picturePath) => {
    if (!picturePath) return '/placeholder.jpg';
    
    // Clean up the picture path (remove any spaces and convert to lowercase)
    const cleanPath = picturePath?.toLowerCase().replace(/\s+/g, '-');
    return `http://localhost:5001/api/v1/images/${cleanPath}`;
  };

  if (loading) return <div className="wishlist-container">Loading...</div>;
  if (error) return <div className="wishlist-container">Error: {error}</div>;

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title-main">My Wishlist</h1>
      
      <div className="wishlist-grid">
        {wishlist.length === 0 ? (
          <p className="empty-message">Your wishlist is empty</p>
        ) : (
          wishlist.map((item) => (
            <div className="wishlist-card" key={item.productID}>
              <button
                className="remove-icon"
                onClick={() => toggleWishlistItem(item)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <img 
                src={getImageUrl(item.pictures?.[0] || item.picturePath)}
                alt={item.name} 
                className="wishlist-img"
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = '/placeholder.jpg';
                }}
              />

              <div className="wishlist-details">
                <h3 className="wishlist-product-name">{item.name}</h3>
                <p className="wishlist-price">
                  ${Number(item.discountedPrice || item.unitPrice).toFixed(2)}
                </p>

                <div className="action-row">
                  <select
                    value={selectedSizes[item.productID] || ""}
                    onChange={(e) => handleSizeChange(item.productID, e.target.value)}
                  >
                    <option value="">Select Size</option>
                    {[38, 39, 40, 41, 42, 43, 44].map((size) => (
                      <option key={size} value={size}>EU {size}</option>
                    ))}
                  </select>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleMoveToCart(item)}
                    disabled={!selectedSizes[item.productID]}
                  >
                    Move to Cart
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