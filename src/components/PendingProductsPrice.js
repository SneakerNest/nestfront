import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PendingProductsPrice.css';

const PendingProductsPrice = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productPrices, setProductPrices] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const formatImageName = (productName) => {
    // Convert to lowercase and replace spaces with underscores
    return productName.replace(/\s+/g, '_').toLowerCase() + '.jpg';
  };

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/store/debug/pending-products');
      
      if (response.data && response.data.rawData) {
        const pendingData = response.data.rawData;
        
        // Process products with enhanced details
        const processedProducts = await Promise.all(pendingData.map(async (product) => {
          try {
            // Get the actual category for each product
            const categoryResponse = await axios.get(`/store/product/${product.productID}/category`);
            const categoryName = categoryResponse.data.categoryName || 'Uncategorized';
            
            // Format image name according to the convention: product_name.jpg (lowercase with underscores)
            const imageFileName = formatImageName(product.name);
            
            return {
              ...product,
              pictures: [imageFileName],
              imageUrl: `http://localhost:5001/api/v1/images/${imageFileName}`,
              categoryName: categoryName
            };
          } catch (err) {
            console.warn(`Error getting details for product ${product.productID}:`, err);
            return {
              ...product,
              pictures: [],
              imageUrl: '/placeholder.jpg',
              categoryName: 'Unknown'
            };
          }
        }));
        
        // Initialize form state with default values
        const initialPrices = {};
        processedProducts.forEach(product => {
          initialPrices[product.productID] = {
            price: '0.00',
            discount: '0'
          };
        });
        
        setPendingProducts(processedProducts);
        setProductPrices(initialPrices);
        setError(null);
      } else {
        console.warn('Unexpected response format:', response.data);
        setPendingProducts([]);
        setError('Failed to load pending products data.');
      }
    } catch (err) {
      console.error('Error fetching pending products:', err);
      setError('Error fetching pending products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (productId, field, value) => {
    setProductPrices(prevState => ({
      ...prevState,
      [productId]: {
        ...prevState[productId],
        [field]: value
      }
    }));
  };

  const calculateFinalPrice = (productId) => {
    const price = parseFloat(productPrices[productId]?.price || 0);
    const discount = parseInt(productPrices[productId]?.discount || 0);
    
    if (isNaN(price) || price <= 0) return '0.00';
    
    return (price * (1 - discount / 100)).toFixed(2);
  };

  const handleApproveProduct = async (productId) => {
    try {
      const productData = productPrices[productId];
      
      // Validate price before submitting
      const price = parseFloat(productData.price);
      const discount = parseInt(productData.discount, 10);
      
      if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price greater than zero.');
        return;
      }
      
      if (isNaN(discount) || discount < 0 || discount > 100) {
        alert('Discount must be between 0 and 100.');
        return;
      }
      
      // Initialize footballCategoryID at the beginning of the function
      let footballCategoryID = null;
      
      // Find Football category ID
      try {
        const catResponse = await axios.get('/store/categories');
        const footballCategory = catResponse.data.find(
          cat => cat.name.toLowerCase() === 'football'
        );
        
        if (footballCategory) {
          footballCategoryID = footballCategory.categoryID;
          console.log(`Found Football category ID: ${footballCategoryID}`);
        }
      } catch (err) {
        console.error('Error getting Football category ID:', err);
      }
      
      // Approve the product
      const approveResponse = await axios.put(`/store/products/pending/${productId}/approve`, {
        price: price,
        discountPercentage: discount,
        categoryID: footballCategoryID
      });
      
      // If discount is applied, send notifications
      if (discount > 0) {
        try {
          const notifyResponse = await axios.post('/store/products/notify-discount', {
            productID: productId,
            discountPercentage: discount,
            unitPrice: price
          });
          
          const notifiedCount = notifyResponse.data.sent || 0;
          
          if (notifiedCount > 0) {
            setSuccessMessage(`Product approved with ${discount}% discount. ${notifiedCount} customer(s) notified!`);
          } else {
            setSuccessMessage(`Product approved with ${discount}% discount. No customers to notify.`);
          }
        } catch (notifyErr) {
          console.error('Error sending discount notifications:', notifyErr);
          setSuccessMessage('Product approved with discount, but notification sending failed.');
        }
      } else {
        setSuccessMessage('Product approved and price set successfully!');
      }
      
      // Remove the approved product from the list
      setPendingProducts(prevProducts => 
        prevProducts.filter(product => product.productID !== productId)
      );
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving product:', err);
      alert('Failed to approve product. Please try again.');
    }
  };

  // Render loading indicator
  if (loading) {
    return <div className="loading-spinner">Loading pending products...</div>;
  }
  
  return (
    <div className="pending-products-price-container">
      <div className="header-actions">
        <h2>Set Prices for Pending Products</h2>
        <button onClick={fetchPendingProducts} className="refresh-button">
          🔄 Refresh Products
        </button>
      </div>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {pendingProducts.length === 0 ? (
        <div className="no-products-message">
          No pending products waiting for price approval.
        </div>
      ) : (
        <div className="products-list">
          {pendingProducts.map((product, index) => (
            <div key={product.productID} className="list-item">
              {index > 0 && <hr />}
              <div className="list-content">
                <div className="list-image">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    onError={(e) => {
                      console.log(`Error loading image: ${e.target.src}`);
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className="list-details">
                  <h3>{product.name}</h3>
                  <div className="product-meta">
                    <span className="meta-item">Category: {product.categoryName}</span>
                    <span className="meta-item">Stock: {product.stock} units</span>
                  </div>
                  <p className="product-description">{product.description || 'No description provided'}</p>
                </div>
                
                <div className="list-price-controls">
                  <div className="control-row">
                    <div className="price-input">
                      <label>Price ($):</label>
                      <div className="input-with-icon">
                        <span className="input-icon">$</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={productPrices[product.productID]?.price || ''}
                          onChange={(e) => handleInputChange(product.productID, 'price', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="discount-input">
                      <label>Discount (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={productPrices[product.productID]?.discount || '0'}
                        onChange={(e) => handleInputChange(product.productID, 'discount', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="control-row">
                    <div className="final-price">
                      Final: <strong>${calculateFinalPrice(product.productID)}</strong>
                    </div>
                    
                    <button 
                      className="approve-button"
                      onClick={() => handleApproveProduct(product.productID)}
                      disabled={!productPrices[product.productID]?.price}
                    >
                      Approve & Set Price
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingProductsPrice;