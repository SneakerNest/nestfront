// src/components/ProductPage.js
import React, { useState, useEffect, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import { getAllProducts } from "../services/productService";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import "../styles/ProductPage.css";

function ProductPage({ defaultCategory = "all" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const externalSearch = params.get("search")?.toLowerCase() || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "sneakers", label: "Sneakers" },
    { value: "casual", label: "Casual" },
    { value: "boots", label: "Boots" },
    { value: "slippers", label: "Slippers & Sandals" }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        // Log the data to check if we're getting stock information
        console.log('Products loaded:', data);
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    if (externalSearch) setSearchQuery(externalSearch);
  }, [externalSearch]);

  const getImageUrl = (picturePath) => {
    if (!picturePath) return '/placeholder.jpg';
    return `http://localhost:5001/api/v1/images/${picturePath}`;
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" 
      ? true 
      : product.brand?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch = searchQuery === "" 
      ? true 
      : (product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "low-to-high":
        return (parseFloat(a.discountedPrice) || 0) - (parseFloat(b.discountedPrice) || 0);
      case "high-to-low":
        return (parseFloat(b.discountedPrice) || 0) - (parseFloat(a.discountedPrice) || 0);
      case "rating-high-to-low":
        return (parseFloat(b.overallRating) || 0) - (parseFloat(a.overallRating) || 0);
      case "rating-low-to-high":
        return (parseFloat(a.overallRating) || 0) - (parseFloat(b.overallRating) || 0);
      case "popularity-high-to-low":
        return (parseInt(b.popularity) || 0) - (parseInt(a.popularity) || 0);
      case "popularity-low-to-high":
        return (parseInt(a.popularity) || 0) - (parseInt(b.popularity) || 0);
      default:
        return 0;
    }
  });

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = async (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const size = selectedSizes[product.productID];
    if (!size) {
      alert("Please select a size.");
      return;
    }

    if (!isUserLogged()) {
      setShowLoginModal(true);
      return;
    }

    try {
      await addToCart({
        ...product,
        size: size
      });
      // Show success message
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="product-container">
        <div className="filter-bar">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
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
            onChange={(e) => setSearchQuery(e.target.value.trim())}
            className="search-input"
          />
        </div>

        <div className="product-grid">
          {sortedProducts.length === 0 ? (
            <div className="no-products">No products found</div>
          ) : (
            sortedProducts.map((product) => (
              <Link
                to={`/product/${product.productID}`}
                key={product.productID}
                className="product-card-link"
              >
                <div className="product-card">
                  {product.stock === 0 ? (
                    <div className="stock-badge out-of-stock">Out of Stock</div>
                  ) : product.stock < 10 ? (
                    <div className="stock-badge">Limited Stock: {product.stock}</div>
                  ) : null}

                  <button
                    className={`wishlist-btn ${isInWishlist(product.productID) ? "active" : ""}`}
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
                      icon={isInWishlist(product.productID) ? faHeartSolid : faHeartOutline}
                    />
                  </button>

                  <img
                    src={getImageUrl(product.pictures?.[0])}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />

                  <h3 className="product-title">{product.name}</h3>

                  <p className="product-price">
                    ${Number(product.unitPrice).toFixed(2)}
                  </p>

                  <div className="product-actions">
                    <select
                      value={selectedSizes[product.productID] || ""}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onChange={(e) => handleSizeChange(product.productID, e.target.value)}
                      className="size-dropdown"
                    >
                      <option value="">Size</option>
                      {[36, 37, 38, 39, 40, 41, 42, 43, 44].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>

                    <button
                      className="add-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!selectedSizes[product.productID] || product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <h2>Please login to continue</h2>
            <button className="login-modal-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="login-modal-cancel" onClick={() => setShowLoginModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

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
              <li><Link to="/slippers-sandals">Slippers & Sandals</Link></li>
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
