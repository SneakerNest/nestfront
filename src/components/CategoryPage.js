import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { isUserLogged } from "../utils/auth";
import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import "../styles/ProductPage.css";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  // Fetch products for this category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        console.log(`Fetching products for category ID: ${id}`);
        const response = await axios.get(`/store/categories/${id}/all-products`);
        
        if (response.data && response.data.products) {
          setCategory({
            id: response.data.categoryId,
            name: response.data.categoryName || 'Category'
          });
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
          
          // Initialize selected sizes for each product
          const initialSizes = {};
          response.data.products.forEach(product => {
            initialSizes[product.productID] = '';
          });
          setSelectedSizes(initialSizes);
        } else {
          setError('No products found in this category');
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id]);

  // Apply filters and sort whenever relevant states change
  useEffect(() => {
    if (!products.length) return;
    
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortOrder) {
      switch(sortOrder) {
        case "low-to-high":
          result.sort((a, b) => 
            (a.discountedPrice || a.unitPrice) - (b.discountedPrice || b.unitPrice)
          );
          break;
        case "high-to-low":
          result.sort((a, b) => 
            (b.discountedPrice || b.unitPrice) - (a.discountedPrice || a.unitPrice)
          );
          break;
        case "rating-high-to-low":
          result.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
          break;
        case "rating-low-to-high":
          result.sort((a, b) => (a.overallRating || 0) - (b.overallRating || 0));
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, sortOrder]);

  const getImageUrl = (picturePath) => {
    if (!picturePath) return '/placeholder.jpg';
    // Fix: Use the same API endpoint as other components
    return `http://localhost:5001/api/v1/images/${picturePath}`;
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const size = selectedSizes[product.productID];
    if (!size) {
      alert("Please select a size.");
      return;
    }
    
    try {
      await addToCart({
        ...product,
        size: size
      });
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
          <h1>{category?.name || 'Products'}</h1>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="rating-high-to-low">Rating: High to Low</option>
            <option value="rating-low-to-high">Rating: Low to High</option>
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
          {filteredProducts.length === 0 ? (
            <div className="empty-category-container">
              <div className="empty-category-message">
                <img 
                  src={`/assets/empty-category.svg`}
                  alt="No products"
                  className="empty-category-icon"
                />
                <h2>No products available</h2>
                <p>There are currently no products in this category.</p>
                <p className="empty-suggestion">Check back later or explore our other categories.</p>
                <Link to="/product-page" className="browse-more-btn">
                  Browse All Products
                </Link>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Link
                to={`/product/${product.productID}`}
                key={product.productID}
                className="product-card-link"
              >
                <div className="product-card">
                  {product.stock <= 0 ? (
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
                    {product.discountPercentage > 0 ? (
                      <>
                        <span className="discount-price">
                          ${Number(product.discountedPrice).toFixed(2)}
                        </span>
                        <span className="original-price">
                          ${Number(product.unitPrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>${Number(product.unitPrice).toFixed(2)}</span>
                    )}
                  </p>

                  <div className="product-actions">
                    <select
                      value={selectedSizes[product.productID] || ""}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSizeChange(product.productID, e.target.value);
                      }}
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
};

export default CategoryPage;