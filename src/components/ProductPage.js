import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/ProductPage.css";
import products from "../data/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faHeart } from "@fortawesome/free-solid-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from '../context/CartContext';
import { isUserLogged } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function ProductPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const externalSearch = params.get("search")?.toLowerCase() || "";
  const navigate = useNavigate();

  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSizePopup, setActiveSizePopup] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showDescription, setShowDescription] = useState({});

  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart, isInCart } = useContext(CartContext);

  useEffect(() => {
    setSearchQuery(externalSearch);
  }, [externalSearch]);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveSizePopup(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) =>
            p.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  filteredProducts = filteredProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "low-to-high") return a.price - b.price;
    if (sortOrder === "high-to-low") return b.price - a.price;
    if (sortOrder === "rating-high-to-low") return b.rating - a.rating;
    if (sortOrder === "rating-low-to-high") return a.rating - b.rating;
    if (sortOrder === "popularity-high-to-low") return b.orderCount - a.orderCount;
    return 0;
  });

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };
  
  const handleAddToCart = (product) => {
    const selectedSize = selectedSizes[product.id];
    if (selectedSize) {
      addToCart({ ...product, size: selectedSize });
      setActiveSizePopup(null);
    }
  };

  const toggleDescription = (productId) => {
    setShowDescription(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Calculate popularity score out of 100 based on orderCount
  const calculatePopularity = (orderCount) => {
    const maxOrderCount = Math.max(...products.map(p => p.orderCount));
    return Math.round((orderCount / maxOrderCount) * 100);
  };

  return (
    <div className="product-container">
      {/* Filter Bar */}
      <div
        className="filter-bar"
        style={{ justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}
      >
        {/* Category Filter */}
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Price Sort */}
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="default">Sort By</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
          <option value="rating-high-to-low">Rating: High to Low</option>
          <option value="rating-low-to-high">Rating: Low to High</option>
          <option value="popularity-high-to-low">Popularity: High to Low</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            flex: "1",
            minWidth: "150px",
          }}
        />
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/product/${product.id}`} className="product-card-image">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-img"
                />
              </Link>
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
                
                {/* Popularity Score */}
                <div className="popularity-score">
                  <span>Popularity: {calculatePopularity(product.orderCount)}/100</span>
                  <div className="popularity-bar">
                    <div 
                      className="popularity-fill" 
                      style={{width: `${calculatePopularity(product.orderCount)}%`}}
                    ></div>
                  </div>
                </div>

                {/* Description Toggle Button */}
                <button 
                  className="description-toggle"
                  onClick={() => toggleDescription(product.id)}
                >
                  {showDescription[product.id] ? "Hide Details" : "Show Details"}
                </button>
                
                {/* Description */}
                {showDescription[product.id] && (
                  <div className="product-description">
                    <p>{product.description}</p>
                    <p className="product-category">Category: {product.category}</p>
                  </div>
                )}
                
                <div className="product-actions">
                  <div className="cart-btn" style={{ position: "relative" }}>
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      onClick={(e) => {
                        e.preventDefault(); // 🛑 Prevent <Link> navigation
                        e.stopPropagation(); // 🧼 Prevent bubbling
                        setActiveSizePopup(product.id);
                      }}
                      style={{
                        color: isInCart(product.id) ? "red" : "black",
                        cursor: "pointer",
                      }}
                    />

                    {activeSizePopup === product.id && (
                      <div className="size-popup" ref={popupRef}>
                        <select
                          value={selectedSizes[product.id] || ""}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // 🛑 prevent parent Link navigation
                          }}
                          onChange={(e) => 
                            handleSizeChange(product.id, e.target.value)}
                        >
                          <option value="">Size</option>
                          {["36", "37", "38", "39", "40", "41", "42", "43", "44"].map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product)}}
                          disabled={!selectedSizes[product.id]}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="wishlist-icon"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation on icon click
                      if (isUserLogged()) {
                        toggleWishlistItem(product);
                      } else {
                        alert("Please log in to add items to your wishlist.");
                        navigate("/login");
                      }
                    }}
                    style={{
                      color: isInWishlist(product.id) ? "red" : "black",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
