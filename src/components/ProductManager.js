import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProductManager.css";
import InvoiceViewer from './InvoiceViewer';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    image: null
  });
  const [pendingProducts, setPendingProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    newSubcategory: "",
    description: "",
    stock: "",
    image: null,
    status: "pending"
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchPendingReviews(),
          fetchCategories(),
          fetchPendingProducts()
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
      const [sneakers, casual, boots, slippers] = await Promise.all([
        axios.get('/store/categories/1/all-products'),
        axios.get('/store/categories/2/all-products'),
        axios.get('/store/categories/3/all-products'),
        axios.get('/store/categories/4/all-products')
      ]);

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
      console.log('Orders:', response.data);
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      console.log('Fetching pending reviews...');
      const response = await axios.get('/reviews/pending');
      console.log('Pending reviews response:', response.data);
      setPendingReviews(response.data || []);
    } catch (err) {
      console.error("Error fetching pending reviews:", err);
      setPendingReviews([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/store/categories');
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const response = await axios.get('/store/products/pending');
      setPendingProducts(response.data);
    } catch (err) {
      console.error("Error fetching pending products:", err);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const stockValue = parseInt(newStock);
      if (isNaN(stockValue) || stockValue < 0) {
        alert('Please enter a valid stock number (0 or greater)');
        return;
      }

      await axios.put(`/store/products/${productId}/stock`, {
        stock: stockValue
      });

      setStock(prevStock => 
        prevStock.map(product => 
          product.productID === productId 
            ? { ...product, stock: stockValue }
            : product
        )
      );

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
      fetchPendingReviews();
    } catch (err) {
      console.error("Error handling review:", err);
      alert('Error processing review');
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!formData.name || !formData.category || !formData.stock) {
        alert('Please fill in all required fields: name, category, and stock');
        return;
      }

      // Check if we have a subcategory (either selected or new)
      const finalSubcategory = formData.newSubcategory || formData.subcategory || "";
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('categoryID', formData.category);
      formDataToSend.append('subcategory', finalSubcategory);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('status', 'pending'); // Always set as pending
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Submit to pending endpoint
      await axios.post('/store/products/pending', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setShowAddForm(false);
      setFormData({ 
        name: "", 
        category: "", 
        subcategory: "", 
        newSubcategory: "",
        description: "", 
        stock: "", 
        image: null, 
        status: "pending" 
      });
      
      // Refresh pending products
      fetchPendingProducts();
      alert('Product submitted for approval!');
    } catch (err) {
      console.error("Error adding product:", err);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }
      
      await axios.delete(`/store/products/${productId}`);
      
      setStock(stock.filter(product => product.productID !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      console.error("Error deleting product:", err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryData.name) {
        alert('Please enter a category name');
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', newCategoryData.name);
      formDataToSend.append('description', newCategoryData.description);
      
      if (newCategoryData.image) {
        formDataToSend.append('image', newCategoryData.image);
      }

      const response = await axios.post('/store/categories', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCategories([...categories, response.data]);
      setNewCategoryData({ name: "", description: "", image: null });
      setShowAddCategoryForm(false);
      alert('Category added successfully!');
    } catch (err) {
      console.error("Error adding category:", err);
      alert('Failed to add category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this category? This will affect all associated products.")) {
        return;
      }
      
      await axios.delete(`/store/categories/${categoryId}`);
      
      setCategories(categories.filter(cat => cat.categoryID !== categoryId));
      alert('Category deleted successfully!');
    } catch (err) {
      console.error("Error deleting category:", err);
      alert('Failed to delete category. Please try again.');
    }
  };

  const getSubcategoriesForCategory = (categoryId) => {
    const category = categories.find(cat => cat.categoryID === parseInt(categoryId));
    return category?.subcategories || [];
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
        <button onClick={() => setActiveTab("invoices")}>Invoices</button>
      </div>

      {activeTab === "stock" && (
        <div className="stock-section">
          <div className="category-management">
            <h3>Category Management</h3>
            <button onClick={() => setShowAddCategoryForm(true)} className="add-product-btn">
              + Add Category
            </button>
            
            <div className="categories-list">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.categoryID}>
                      <td>{category.categoryID}</td>
                      <td>
                        <img
                          src={category.image ? `http://localhost:5001/api/v1/images/${category.image}` : '/placeholder-category.jpg'}
                          alt={category.name}
                          className="category-thumbnail"
                        />
                      </td>
                      <td>{category.name}</td>
                      <td>{category.description || 'No description'}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteCategory(category.categoryID)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="product-management">
            <h3>Products Management</h3>
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
                  <th>Actions</th>
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
                    <td>
                      <button
                        onClick={() => handleDeleteProduct(product.productID)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                      value={order.deliveryStatus || 'Processing'}
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

      {activeTab === "invoices" && (
        <div className="invoice-section">
          <InvoiceViewer />
        </div>
      )}


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
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  category: e.target.value,
                  subcategory: "" // Reset subcategory when category changes
                });
              }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.categoryID} value={cat.categoryID}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formData.category && (
              <div className="form-group">
                <label>Subcategory:</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                >
                  <option value="">Select Subcategory</option>
                  {categories
                    .find(cat => cat.categoryID == formData.category)?.subcategories?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    )) || []}
                </select>
                <div className="subcategory-option">
                  <p>- OR -</p>
                  <input
                    type="text"
                    placeholder="Enter new subcategory"
                    value={formData.newSubcategory || ""}
                    onChange={(e) => setFormData({ ...formData, newSubcategory: e.target.value })}
                  />
                </div>
              </div>
            )}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
            <div className="pending-notice">
              <p>
                <i className="fas fa-info-circle"></i>
                Product will be pending until a sales manager sets the price
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddProduct}>Add</button>
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddCategoryForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Category</h3>
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryData.name}
              onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
            />
            <textarea
              placeholder="Category description"
              value={newCategoryData.description}
              onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
              rows={3}
            />
            <div className="form-group">
              <label>Category Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCategoryData({ ...newCategoryData, image: e.target.files[0] })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddCategory}>Add Category</button>
              <button onClick={() => setShowAddCategoryForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
