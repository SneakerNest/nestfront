import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProductManager.css";

const categories = [
  {
    name: 'Sneakers',
    subcategories: ['Converse', 'Nike', 'Adidas', 'Balenciaga', 'McQueen']
  },
  {
    name: 'Casual',
    subcategories: ['Balenciaga', 'McQueen', 'Newbalance']
  },
  {
    name: 'Boots',
    subcategories: ['Timberland']
  },
  {
    name: 'Slippers & Sandals',
    subcategories: ['Nike', 'Crocs', 'Champion']
  }
];

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    image: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchPendingReviews()
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products from all categories
      const [sneakers, casual, boots, slippers] = await Promise.all([
        axios.get('/store/categories/1/all-products'),
        axios.get('/store/categories/2/all-products'),
        axios.get('/store/categories/3/all-products'),
        axios.get('/store/categories/4/all-products')
      ]);

      // Combine and format all products
      const allProducts = [
        ...formatProductsWithCategory(sneakers.data.products, 'Sneakers'),
        ...formatProductsWithCategory(casual.data.products, 'Casual'),
        ...formatProductsWithCategory(boots.data.products, 'Boots'),
        ...formatProductsWithCategory(slippers.data.products, 'Slippers & Sandals')
      ];

      setStock(allProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Helper function to format products with their category
  const formatProductsWithCategory = (products, categoryName) => {
    return products.map(product => ({
      ...product,
      category: categoryName,
      imageUrl: product.pictures && product.pictures.length > 0 
        ? `http://localhost:5001/api/v1/images/${product.pictures[0]}`
        : '/placeholder.jpg'
    }));
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/order');
      console.log('Orders:', response.data); // Debug log
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      console.log('Fetching pending reviews...'); // Debug log
      
      const response = await axios.get('/reviews/pending');
      console.log('Pending reviews response:', response.data); // Debug log
      
      setPendingReviews(response.data || []);
    } catch (err) {
      console.error("Error fetching pending reviews:", err);
      setPendingReviews([]);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      // Validate stock value
      const stockValue = parseInt(newStock);
      if (isNaN(stockValue) || stockValue < 0) {
        alert('Please enter a valid stock number (0 or greater)');
        return;
      }

      // Fix: Remove /api/v1 from the URL since it's already configured in your axios base URL
      await axios.put(`/store/products/${productId}/stock`, {
        stock: stockValue
      });

      // Update local state
      setStock(prevStock => 
        prevStock.map(product => 
          product.productID === productId 
            ? { ...product, stock: stockValue }
            : product
        )
      );

      // Show success message
      alert('Stock updated successfully');
    } catch (err) {
      console.error("Error updating stock:", err);
      alert('Failed to update stock. Please try again.');
    }
  };

  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    try {
      if (!orderId || !newStatus) {
        console.error('Invalid order ID or status');
        return;
      }

      await axios.put(`/delivery/order/${orderId}/status`, {
        deliveryStatus: newStatus
      });
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderID === orderId
            ? { ...order, deliveryStatus: newStatus }
            : order
        )
      );

    } catch (err) {
      console.error("Error updating order status:", err);
      alert('Failed to update delivery status. Please try again.');
    }
  };

  const handleReviewApproval = async (reviewId, approved) => {
    try {
      if (approved) {
        const response = await axios.put(`/reviews/${reviewId}/approve`);
        alert(response.data.msg);
      } else {
        await axios.delete(`/reviews/${reviewId}`);
        alert('Review rejected and deleted');
      }
      fetchPendingReviews(); // Refresh the list after approval/rejection
    } catch (err) {
      console.error("Error handling review:", err);
      alert('Error processing review');
    }
  };

  const handleAddProduct = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.post('/store/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowAddForm(false);
      setFormData({ name: "", category: "", stock: "", image: null });
      fetchProducts(); // Refresh products after adding new one
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <h1 className="h1">Product Manager Dashboard</h1>

      <div className="tab-buttons">
        <button onClick={() => setActiveTab("stock")}>Stock Manager</button>
        <button onClick={() => setActiveTab("orderStatus")}>Order Status</button>
        <button onClick={() => setActiveTab("comments")}>Comment Approval</button>
      </div>

      {/* Stock Management Tab */}
      {activeTab === "stock" && (
        <div className="stock-section">
          <button onClick={() => setShowAddForm(true)} className="add-product-btn">
            + Add Product
          </button>
          
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(product => (
                <tr key={product.productID}>
                  <td>{product.productID}</td>
                  <td>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => handleStockUpdate(product.productID, e.target.value)}
                      className="stock-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Status Tab */}
      {activeTab === "orderStatus" && (
        <div className="orders-section">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Number</th>
                <th>Total Price</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderID}>
                  <td>{order.orderID}</td>
                  <td>{order.orderNumber}</td>
                  <td>${order.totalPrice}</td>
                  <td>
                    <select
                      value={order.deliveryStatus || 'Processing'} // Add default value
                      onChange={(e) => handleDeliveryStatusChange(order.orderID, e.target.value)}
                      className={`status-${(order.deliveryStatus || 'processing').toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="In-transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Approval Tab */}
      {activeTab === "comments" && (
        <div className="reviews-section">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Reviewer</th>
                  <th>Review Content</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-reviews">No pending reviews</td>
                  </tr>
                ) : (
                  pendingReviews.map(review => (
                    <tr key={review.reviewID}>
                      <td>{review.productName}</td>
                      <td>{review.reviewerName}</td>
                      <td>{review.reviewContent}</td>
                      <td>
                        <button 
                          onClick={() => handleReviewApproval(review.reviewID, true)}
                          className="approve-btn"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReviewApproval(review.reviewID, false)}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Product</h3>
            <input
              type="text"
              placeholder="Product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <optgroup key={cat.name} label={cat.name}>
                  {cat.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            />
            <div className="modal-actions">
              <button onClick={handleAddProduct}>Add</button>
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
