// src/components/ProductPage.js
import React, { useState, useEffect, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../styles/ProductPage.css";
import products from "../data/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

function ProductPage({ defaultCategory = "all" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const externalSearch = params.get("search")?.toLowerCase() || "";

  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    if (externalSearch) setSearchQuery(externalSearch);
  }, [externalSearch]);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  let filtered = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  filtered = filtered.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filtered].sort((a, b) => {
    if (sortOrder === "low-to-high") return a.price - b.price;
    if (sortOrder === "high-to-low") return b.price - a.price;
    if (sortOrder === "rating-high-to-low") return b.rating - a.rating;
    if (sortOrder === "rating-low-to-high") return a.rating - b.rating;
    if (sortOrder === "popularity-high-to-low") return b.popularity - a.popularity;
    if (sortOrder === "popularity-low-to-high") return a.popularity - b.popularity;
    return 0;
  });

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id];
    if (!size) return alert("Please select a size.");
    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }
    addToCart({ ...product, size });
  };

  return (
    <>
      <div className="product-container">
        {/* Filter Bar */}
        <div
          className="filter-bar"
          style={{ justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="rating-high-to-low">Rating: High to Low</option>
            <option value="rating-low-to-high">Rating: Low to High</option>
            <option value="popularity-high-to-low">Popularity: High to Low</option>
            <option value="popularity-low-to-high">Popularity: Low to High</option>
          </select>

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
              flex: 1,
              minWidth: "150px",
            }}
          />
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="product-card-link"
              >
                <div className="product-card">
                  {product.stock < 10 && (
                    <div className="stock-badge">Limited Stock</div>
                  )}

                  <button
                    className={`wishlist-btn ${isInWishlist(product.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isUserLogged()) {
                        setShowLoginModal(true);
                        return;
                      }
                      toggleWishlistItem(product);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={isInWishlist(product.id) ? faHeartSolid : faHeartOutline}
                    />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />

                  <h3 className="product-title">{product.name}</h3>

                  <p className="product-price">
                    ${product.price.toFixed(2)}
                  </p>

                  <div
                    className="product-actions"
                    style={{ gap: "8px", justifyContent: "center" }}
                  >
                    <select
                      value={selectedSizes[product.id] || ""}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onChange={(e) => handleSizeChange(product.id, e.target.value)}
                      className="size-dropdown"
                    >
                      <option value="">Size</option>
                      {["36", "37", "38", "39", "40", "41", "42", "43", "44"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      className="add-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!selectedSizes[product.id]}
                    >
                      Add to Cart
                    </button>
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>Please login to continue</h2>
            <button
              className="login-modal-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="login-modal-cancel"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="new-footer">
        <div className="footer-container">
          <div className="footer-column">
            <div className="footer-logo">SneakerNest</div>
            <p>
              Based in Sabanci University, SneakerNest is your go‑to platform for
              high‑end, exclusive streetwear and sneakers across the globe.
            </p>
            <p className="copyright">
              © 2024 SneakerNest. All rights reserved.
            </p>
          </div>

          <div className="footer-column">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/sneakers">Sneakers</Link></li>
              <li><Link to="/casual">Casual</Link></li>
              <li><Link to="/boots">Boots</Link></li>
              <li><Link to="/slippers-sandals">Slippers & Sandals</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#"><FaInstagram /> Instagram</a></li>
              <li><a href="#"><FaFacebookF /> Facebook</a></li>
              <li><a href="#"><FaTiktok /> TikTok</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

export default ProductPage;
