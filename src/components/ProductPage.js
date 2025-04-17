import React, { useState, useEffect, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/ProductPage.css";
import products from "../data/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faHeart } from "@fortawesome/free-solid-svg-icons";
import { WishlistContext } from "../context/WishlistContext";

function ProductPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const externalSearch = params.get("search")?.toLowerCase() || "";

  const [sortOrder, setSortOrder] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { toggleWishlistItem, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    setSearchQuery(externalSearch);
  }, [externalSearch]);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

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
    return 0;
  });

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
                  <button className="cart-btn">
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </button>
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="wishlist-icon"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation on icon click
                      toggleWishlistItem(product);
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
