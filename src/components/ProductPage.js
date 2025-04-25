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

// Main product listing component with filtering, sorting and search functionality
// Displays all available products with options to add to cart or wishlist
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
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "low-to-high") return a.price - b.price;
    if (sortOrder === "high-to-low") return b.price - a.price;
    if (sortOrder === "rating-high-to-low") return b.rating - a.rating;
    if (sortOrder === "rating-low-to-high") return a.rating - b.rating;
    if (sortOrder === "popularity-high-to-low") return b.popularity - a.popularity;
    if (sortOrder === "popularity-low-to-high") return a.popularity - b.popularity;
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
          <option value="popularity-low-to-high">Popularity: Low to High</option>
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
            <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
              <div className="product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-img"
                />
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
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
            </Link>
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
