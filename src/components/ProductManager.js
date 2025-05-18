import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProductManager.css";

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
  const [recentlyApproved, setRecentlyApproved] = useState([]);
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

  // Update the useEffect for tab switching
  useEffect(() => {
    const refreshTabData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "stock") {
          // Always refresh products when switching to stock tab
          console.log("Switching to stock tab - refreshing products");
          await fetchRecentlyApprovedProducts(); // Get fresh approved products first
          await fetchProducts();
        } else if (activeTab === "pendingProducts") {
          await fetchPendingProducts();
        } else if (activeTab === "orders") {
          await fetchOrders();
        } else if (activeTab === "reviews") {
          await fetchPendingReviews();
        } else if (activeTab === "deliveries") {
          await fetchDeliveryData();
        }
      } catch (error) {
        console.error("Error refreshing tab data:", error);
        setError("Failed to refresh data");
      } finally {
        setIsLoading(false);
      }
    };

    refreshTabData();
  }, [activeTab]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();
        await fetchRecentlyApprovedProducts();  // Load this first so it's available for product formatting
        await fetchProducts();
        await fetchPendingProducts();
        await fetchOrders();
        await fetchPendingReviews();
        await fetchDeliveryData();
      } catch (error) {
        setError("Failed to load data");
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update fetchRecentlyApprovedProducts to return the data
  const fetchRecentlyApprovedProducts = async () => {
    try {
      console.log("Fetching recently approved products...");
      const response = await axios.get('/store/debug/recently-approved?nocache=' + new Date().getTime());
      
      if (response.data && response.data.products) {
        const products = response.data.products;
        console.log(`Found ${products.length} recently approved products:`, 
          products.map(p => `${p.name} (ID: ${p.productID})`));
        
        setRecentlyApproved(products);
        return products;
      }
      return [];
    } catch (err) {
      console.error("Error fetching recently approved products:", err);
      return [];
    }
  };

  // Replace the fetchProducts function with this improved version

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all products from all categories, including newly approved ones...");
      
      // Force refresh the recently approved products first to get the latest data
      const recentlyApprovedList = await fetchRecentlyApprovedProducts();
      
      // First fetch ALL categories without filtering to parent categories only
      const categoriesResponse = await axios.get('/store/categories?nocache=' + new Date().getTime());
      const allCategories = categoriesResponse.data;
      
      // Get all unique category IDs that we need to fetch products for
      const categoryIds = [...new Set(allCategories.map(cat => cat.categoryID))];
      console.log(`Found ${categoryIds.length} total categories to fetch products from`);
      
      // Fetch products from ALL categories in parallel
      const categoryPromises = categoryIds.map(categoryId => {
        const categoryName = allCategories.find(c => c.categoryID === categoryId)?.name || 'Unknown';
        return axios.get(`/store/categories/${categoryId}/all-products?nocache=${new Date().getTime()}`)
          .then(response => ({
            categoryName,
            categoryId,
            products: response.data.products || []
          }))
          .catch(error => {
            console.error(`Error fetching products for category ${categoryName} (ID: ${categoryId}):`, error);
            return { categoryName, categoryId, products: [] };
          });
      });
      
      const categoryResults = await Promise.all(categoryPromises);
      
      // Log all category results for debugging
      categoryResults.forEach(result => {
        console.log(`Category ${result.categoryName} (ID: ${result.categoryId}): ${result.products.length} products`);
      });
      
      // Process products from all categories
      let allProducts = [];
      categoryResults.forEach(result => {
        if (result.products && result.products.length > 0) {
          const formattedProducts = formatProductsWithCategory(
            result.products, 
            result.categoryName, 
            recentlyApprovedList
          );
          allProducts = [...allProducts, ...formattedProducts];
        }
      });
      
      // Also fetch products that might not be properly categorized
      try {
        const uncategorizedResponse = await axios.get('/store/products?nocache=' + new Date().getTime());
        const allProductIds = new Set(allProducts.map(p => p.productID));
        
        // Find products that weren't already included in any category
        const uncategorizedProducts = uncategorizedResponse.data.filter(product => 
          product.showProduct === 1 && 
          product.unitPrice > 0 && 
          !allProductIds.has(product.productID)
        );
        
        if (uncategorizedProducts.length > 0) {
          console.log(`Found ${uncategorizedProducts.length} uncategorized products`);
          const formattedUncategorized = formatProductsWithCategory(
            uncategorizedProducts, 
            'Uncategorized', 
            recentlyApprovedList
          );
          allProducts = [...allProducts, ...formattedUncategorized];
        }
      } catch (err) {
        console.error("Error fetching uncategorized products:", err);
      }
      
      setStock(allProducts);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setIsLoading(false);
    }
  };

  // Updated function that takes recentlyApproved as parameter
  const formatProductsWithCategory = (products, categoryName, approvedProducts) => {
    // Use the passed approvedProducts parameter or fall back to state if not provided
    const recentProducts = approvedProducts || recentlyApproved;
    
    return products.map(product => {
      // Check if this product is in the recently approved list
      const isNewlyApproved = recentProducts.some(
        approved => approved.productID === product.productID
      );
      
      if (isNewlyApproved) {
        console.log(`Product ${product.name} (ID: ${product.productID}) is newly approved!`);
      }
      
      // Determine the correct image URL
      let imageUrl;
      
      // First check if pictures array exists and has items
      if (product.pictures && Array.isArray(product.pictures) && product.pictures.length > 0 && product.pictures[0]) {
        imageUrl = `http://localhost:5001/api/v1/images/${product.pictures[0]}`;
        console.log(`Using picture from database for ${product.name}: ${imageUrl}`);
      } 
      // For newly approved products, use the formatted name approach
      else {
        imageUrl = `http://localhost:5001/api/v1/images/${formatImageName(product.name)}`;
        console.log(`Using formatted name for ${product.name}: ${imageUrl}`);
      }
      
      return {
        ...product,
        category: categoryName,
        imageUrl: imageUrl,
        isRecentlyApproved: isNewlyApproved
      };
    });
  };

  const formatImageName = (productName) => {
    if (!productName) return 'placeholder.jpg';
    // Convert to lowercase and replace spaces with underscores
    return productName.replace(/\s+/g, '_').toLowerCase() + '.jpg';
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
      
      const mainCategories = response.data.filter(cat => !cat.parentCategoryID);
      
      const enhancedCategories = mainCategories.map(mainCat => {
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
      
      const response = await axios.get('/store/debug/pending-products');
      console.log('Debug pending products response:', response);
      
      if (response.data && response.data.rawData) {
        const pendingData = response.data.rawData;
        console.log(`Found ${pendingData.length} pending products from debug endpoint`);
        
        const processedProducts = await Promise.all(pendingData.map(async (product) => {
          try {
            const categoryResponse = await axios.get(`/store/product/${product.productID}/category`);
            const categoryName = categoryResponse.data.categoryName || 'Uncategorized';
            console.log(`Category for product ${product.productID}: ${categoryName}`);
            
            const imageFileName = product.name.replace(/\s+/g, '_').toLowerCase();
            
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
      const productData = {
        name: formData.name || '',
        categoryID: formData.category || '',
        description: formData.description || '',
        stock: formData.stock || 0,
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
        showProduct: false,
        status: 'pending'
      };
      
      console.log("Sending product data:", productData);
      
      const response = await axios.post('/store/products/pending', productData);
      
      console.log('Product added successfully:', response.data);
      alert('Product added successfully! Waiting for price approval.');
      
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
      
      const isPending = pendingProducts.some(p => p.productID === productId);
      
      if (isPending) {
        await axios.delete(`/store/debug/pending-products/${productId}`);
      } else {
        await axios.delete(`/store/products/${productId}`);
      }
      
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
      subcategory: ''
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>Products Management</h3>
              <button 
                onClick={() => {
                  console.log('Manual refresh of products');
                  fetchProducts();
                }}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#52c41a', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔍 Check for New Products
              </button>
            </div>
            <button onClick={() => setShowAddForm(true)} className="add-product-btn">
              + Add Product
            </button>
            <div className="refresh-products" style={{ marginBottom: '15px' }}>
              <button 
                onClick={() => fetchProducts()} 
                className="refresh-button"
              >
                🔄 Refresh All Products
              </button>
            </div>
            
            {stock.length === 0 ? (
              <div className="no-products-message">No products found. Add your first product!</div>
            ) : (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(product => (
                    <tr key={product.productID} className={product.isRecentlyApproved ? "recently-approved" : ""}>
                      <td>{product.productID}</td>
                      <td>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-thumbnail"
                          onError={(e) => {
                            console.log(`Failed to load image: ${e.target.src}`);
                            e.target.onerror = null;
                            // Try the formatted name approach as a fallback
                            if (!e.target.src.includes(formatImageName(product.name))) {
                              e.target.src = `http://localhost:5001/api/v1/images/${formatImageName(product.name)}`;
                              console.log(`Trying alternate image path: ${e.target.src}`);
                            } else {
                              e.target.src = '/placeholder.jpg';
                            }
                          }}
                        />
                      </td>
                      <td>
                        {product.name}
                        {product.isRecentlyApproved && (
                          <span className="badge-new">New</span>
                        )}
                      </td>
                      <td>
                        {product.category || 'Uncategorized'}
                        {product.category === 'Uncategorized' && (
                          <button
                            onClick={async () => {
                              try {
                                const catResponse = await axios.get('/store/debug/product-category/' + product.productID);
                                console.log('Category debug info:', catResponse.data);
                                alert('Check console for category debug info');
                              } catch (err) {
                                console.error('Error checking category:', err);
                              }
                            }}
                            style={{
                              marginLeft: '5px',
                              fontSize: '10px',
                              padding: '2px 5px',
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Debug
                          </button>
                        )}
                      </td>
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
                        ${Number(product.unitPrice).toFixed(2)}
                        {product.discountPercentage > 0 && (
                          <span className="discount-badge">{product.discountPercentage}% off</span>
                        )}
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
