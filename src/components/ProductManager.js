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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: ""
  });
  const [pendingProducts, setPendingProducts] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);

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
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
        await fetchProducts();
        await fetchOrders();
        await fetchPendingReviews();
        
        // Call this separately and log the result
        console.log("About to fetch pending products...");
        await fetchPendingProducts();
        console.log("Finished fetching pending products");

        await fetchDeliveryData();
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
      setIsLoading(true);
      const response = await axios.get('/store/categories');
      
      // Properly structure categories with subcategories
      const mainCategories = response.data.filter(cat => !cat.parentCategoryID);
      
      // Enhance categories with subcategories
      const enhancedCategories = mainCategories.map(mainCat => {
        // Find all subcategories for this main category
        const subs = response.data.filter(
          sub => sub.parentCategoryID === mainCat.categoryID
        ).map(sub => sub.name);
        
        return {
          ...mainCat,
          subcategories: subs
        };
      });
      
      console.log('Categories with subcategories:', enhancedCategories);
      setCategories(enhancedCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      console.log('Fetching pending products using debug route...');
      
      // Use the debug endpoint that works
      const response = await axios.get('/store/debug/pending-products');
      console.log('Debug pending products response:', response);
      
      if (response.data && response.data.rawData) {
        // Extract the rawData from the debug response
        const pendingData = response.data.rawData;
        console.log(`Found ${pendingData.length} pending products from debug endpoint`);
        
        // Process products with CORRECT image paths and actual categories
        const processedProducts = await Promise.all(pendingData.map(async (product) => {
          try {
            // 1. Get the actual category for each product
            const categoryResponse = await axios.get(`/store/product/${product.productID}/category`);
            const categoryName = categoryResponse.data.categoryName || 'Uncategorized';
            console.log(`Category for product ${product.productID}: ${categoryName}`);
            
            // 2. Format image name exactly like f50.jpg - all lowercase with underscores
            const imageFileName = product.name.replace(/\s+/g, '_').toLowerCase();
            
            // 3. IMPORTANT: Use the FULL correct URL path that matches your API
            // Must match the same pattern used in formatProductsWithCategory
            const imageUrl = `http://localhost:5001/api/v1/images/${imageFileName}`;
            
            console.log(`Image URL for ${product.name}: ${imageUrl}`);
            
            return {
              ...product,
              pictures: [imageFileName],
              imageUrl: imageUrl,
              categoryName: categoryName
            };
          } catch (err) {
            console.warn(`Error getting details for product ${product.productID}:`, err);
            return {
              ...product,
              pictures: [],
              imageUrl: '/placeholder.jpg',
              categoryName: 'Unknown Category'
            };
          }
        }));
        
        setPendingProducts(processedProducts);
        console.log('Processed pending products with actual categories:', processedProducts);
      } else {
        console.warn('Unexpected debug response format:', response.data);
        setPendingProducts([]);
      }
    } catch (err) {
      console.error('Error fetching pending products from debug endpoint:', err);
      
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
      
      setPendingProducts([]);
    }
  };

  const fetchDeliveryData = async () => {
    try {
      console.log('Fetching delivery data...');
      const response = await axios.get('/delivery/all');
      console.log('Delivery data response:', response.data);
      setDeliveryData(response.data);
    } catch (err) {
      console.error("Error fetching delivery data:", err);
      setDeliveryData([]);
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
      // Create a simple object with ALL required database fields
      const productData = {
        name: formData.name || '',
        categoryID: formData.category || '',
        description: formData.description || '',
        stock: formData.stock || 0,
        
        // Required database fields with defaults
        brand: formData.newSubcategory || formData.subcategory || 'Generic',
        supplierID: 1,
        material: 'Leather',
        warrantyMonths: 6,
        serialNumber: `SN-FB-${Math.floor(Math.random() * 10000)}`,
        popularity: 0,
        overallRating: 0,
        unitPrice: 0,
        discountPercentage: 0,
        color: 'Default',
        showProduct: false,  // This is important! Set to false initially
        status: 'pending'    // Add status field as pending
      };
      
      console.log("Sending product data:", productData);
      
      // Convert form data to JSON request
      const response = await axios.post('/store/products/pending', productData);
      
      console.log('Product added successfully:', response.data);
      alert('Product added successfully! Waiting for price approval.');
      
      // Reset form and refresh data
      setShowAddForm(false);
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        newSubcategory: "",
        description: "",
        stock: "",
        image: null
      });
      
      // Refresh the pending products list
      fetchPendingProducts();
    } catch (err) {
      console.error('Error details:', err);
      alert(`Failed to add product: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }
      
      // Check if the product is in pendingProducts (meaning it's a pending product)
      const isPending = pendingProducts.some(p => p.productID === productId);
      
      if (isPending) {
        // Use the special debug endpoint for pending products
        await axios.delete(`/store/debug/pending-products/${productId}`);
      } else {
        // Use the regular endpoint for normal products
        await axios.delete(`/store/products/${productId}`);
      }
      
      // Update both stock and pendingProducts states
      setStock(prevStock => prevStock.filter(product => product.productID !== productId));
      setPendingProducts(prevPending => prevPending.filter(product => product.productID !== productId));
      
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
      
      const response = await axios.post('/store/categories', {
        name: newCategoryData.name,
        description: newCategoryData.description
      });
      
      setCategories([...categories, response.data]);
      setNewCategoryData({ name: "", description: "" });
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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    });
  };

  if (isLoading) return <div className="loading-spinner">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <h1 className="h1">Product Manager Dashboard</h1>

      <div className="tab-buttons">
        <button 
          onClick={() => setActiveTab("stock")}
          className={activeTab === "stock" ? "active" : ""}
        >
          Stock Manager
        </button>
        <button 
          onClick={() => setActiveTab("pendingProducts")}
          className={activeTab === "pendingProducts" ? "active" : ""}
        >
          Pending Products
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "active" : ""}
        >
          Order Status
        </button>
        <button 
          onClick={() => setActiveTab("reviews")}
          className={activeTab === "reviews" ? "active" : ""}
        >
          Review Approval
        </button>
        <button 
          onClick={() => setActiveTab("deliveries")}
          className={activeTab === "deliveries" ? "active" : ""}
        >
          Delivery Tracking
        </button>
      </div>

      {activeTab === "stock" && (
        <div className="stock-section">
          <div className="category-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>Category Management</h3>
              <button 
                onClick={() => {
                  console.log('Manual refresh of categories');
                  fetchCategories();
                }}
                style={{ 
                  padding: '5px 10px', 
                  background: '#2196F3', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer' 
                }}
              >
                🔄 Refresh Categories
              </button>
            </div>
            <button onClick={() => setShowAddCategoryForm(true)} className="add-product-btn">
              + Add Category
            </button>
            
            <div className="categories-list">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <tr key={category.categoryID}>
                        <td>{category.categoryID}</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                        {isLoading ? 'Loading categories...' : 'No categories found. Add your first category!'}
                      </td>
                    </tr>
                  )}
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

      {activeTab === "pendingProducts" && (
        <div className="pending-products-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}>
            <h3>Pending Products (Awaiting Price)</h3>
            <button
              onClick={() => fetchPendingProducts()}
              style={{
                padding: '5px 10px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Pending
            </button>
          </div>
          
          <div style={{marginBottom: '10px', fontSize: '13px', color: '#666'}}>
            {pendingProducts.length > 0 ? 
              `Found ${pendingProducts.length} pending products` : 
              'No pending products found'}
          </div>
          
          {pendingProducts.length === 0 ? (
            <div className="no-pending-products">No pending products found</div>
          ) : (
            <table className="stock-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map(product => (
                  <tr key={product.productID}>
                    <td>{product.productID}</td>
                    <td>
                      <img
                        src={product.imageUrl || '/placeholder.jpg'}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.categoryName || 'Unknown'}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className="pending-badge">Pending Price</span>
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
          )}
        </div>
      )}

      {activeTab === "orders" && (
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

      {activeTab === "reviews" && (
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

      {activeTab === "deliveries" && (
        <div className="deliveries-section">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px' 
          }}>
            <h3>All Deliveries</h3>
            <button
              onClick={() => fetchDeliveryData()}
              style={{
                padding: '5px 10px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Deliveries
            </button>
          </div>
          
          {deliveryData.length === 0 ? (
            <div className="no-deliveries">No delivery data found</div>
          ) : (
            <div className="table-container">
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total Price</th>
                    <th>Delivery Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryData.map(order => (
                    <tr key={order.orderID} className={`status-${order.deliveryStatus?.toLowerCase() || 'unknown'}-row`}>
                      <td>{order.orderNumber}</td>
                      <td>{order.orderDate}</td>
                      <td>
                        <div className="customer-info">
                          <strong>{order.customerName}</strong>
                          <div className="customer-details">
                            <span>ID: {order.customerID}</span>
                            <span>User: {order.username}</span>
                            <span>{order.customerEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <ul className="product-list">
                          {order.products?.map(product => (
                            <li key={`${order.orderID}-${product.productID}`}>
                              {product.name} x {product.quantity} (${Number(product.purchasePrice).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>${Number(order.totalPrice).toFixed(2)}</td>
                      <td>
                        {order.deliveryAddress ? (
                          <div className="address-info">
                            <p><strong>{order.deliveryAddress.addressTitle}</strong></p>
                            <p>{order.deliveryAddress.streetAddress}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.zipCode}</p>
                            <p>{order.deliveryAddress.country}</p>
                          </div>
                        ) : (
                          "No address information"
                        )}
                      </td>
                      <td className={`status-${order.deliveryStatus?.toLowerCase() || 'unknown'}`}>
                        {order.deliveryStatus || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              onChange={handleCategoryChange}
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
