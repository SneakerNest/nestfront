import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesList.css';

const SalesList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingID, setEditingID] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Filter state
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        fetchAllProducts();
        fetchCategories();
    }, []);

    const formatImageName = (productName) => {
        // Convert to lowercase and replace spaces with underscores
        return productName.replace(/\s+/g, '_').toLowerCase() + '.jpg';
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/store/categories');
            setCategories(response.data.filter(cat => !cat.parentCategoryID));
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/store/products');
            // Only include active products that are already approved (not pending)
            const activeProducts = response.data.filter(product => 
                product.showProduct === 1 && product.unitPrice > 0
            );
            
            // Process products with appropriate image URLs
            const processedProducts = activeProducts.map(product => {
                // Check if pictures array exists and has valid items
                if (product.pictures && Array.isArray(product.pictures) && product.pictures.length > 0 && product.pictures[0]) {
                    console.log(`Using picture from database for ${product.name}: ${product.pictures[0]}`);
                    return {
                        ...product,
                        imageUrl: `http://localhost:5001/api/v1/images/${product.pictures[0]}`
                    };
                } 
                // Otherwise use the formatted name approach (newly approved products)
                else {
                    const formattedName = formatImageName(product.name);
                    console.log(`Using formatted name for ${product.name}: ${formattedName}`);
                    return {
                        ...product,
                        imageUrl: `http://localhost:5001/api/v1/images/${formattedName}`
                    };
                }
            });
            
            setProducts(processedProducts);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, field, value) => {
        setProducts(products.map(product => 
            product.productID === id ? 
            { ...product, [field]: value === '' ? null : parseFloat(value) }
            : product
        ));
    };
    
    const toggleEdit = (id) => {
        setEditingID(editingID === id ? null : id);
    };
    
    const handleSavePrice = async (product) => {
        try {
            // Ensure price is not negative
            if (product.unitPrice <= 0) {
                setSuccessMessage('');
                alert('Price must be greater than zero.');
                return;
            }
            
            // Ensure discount is between 0 and 100
            if (product.discountPercentage < 0 || product.discountPercentage > 100) {
                setSuccessMessage('');
                alert('Discount must be between 0 and 100%.');
                return;
            }
            
            // Update product price and discount
            await axios.put(`/store/products/${product.productID}/price`, {
                unitPrice: product.unitPrice,
                discountPercentage: product.discountPercentage || 0
            });
            
            setSuccessMessage(`Updated price for ${product.name}`);
            setTimeout(() => setSuccessMessage(''), 3000);
            
            // Close edit mode
            setEditingID(null);
        } catch (err) {
            console.error('Error updating product price:', err);
            setSuccessMessage('');
            alert('Failed to update price. Please try again.');
        }
    };
    
    const calculateFinalPrice = (product) => {
        return (product.unitPrice * (1 - (product.discountPercentage || 0) / 100)).toFixed(2);
    };
    
    // Filter products based on category and search query
    const filteredProducts = products.filter(product => {
        const matchesCategory = categoryFilter === 'all' || 
            (product.categoryName && product.categoryName.toLowerCase() === categoryFilter.toLowerCase());
        
        const matchesSearch = searchQuery === '' || 
            (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase()));
            
        return matchesCategory && matchesSearch;
    });
    
    if (loading) {
        return <div className="loading-spinner">Loading products...</div>;
    }

    return (
        <div className="sales-list-container">
            <div className="header-actions">
                <h2>Manage Product Prices</h2>
                <button onClick={fetchAllProducts} className="refresh-button">
                    🔄 Refresh Products
                </button>
            </div>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="filter-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="category-filter">
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category.categoryID} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {filteredProducts.length === 0 ? (
                <div className="no-products-message">
                    No products found matching your criteria.
                </div>
            ) : (
                <div className="products-list">
                    {filteredProducts.map((product, index) => (
                        <div key={product.productID} className="list-item">
                            {index > 0 && <hr />}
                            <div className="list-content">
                                <div className="list-image">
                                    <img 
                                        src={product.imageUrl}
                                        alt={product.name}
                                        onError={(e) => {
                                            console.log(`Image failed to load: ${e.target.src}`);
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                
                                <div className="list-details">
                                    <h3>{product.name}</h3>
                                    <div className="product-meta">
                                        <span className="meta-item">Category: {product.categoryName || 'General'}</span>
                                        <span className="meta-item">Stock: {product.stock} units</span>
                                    </div>
                                </div>
                                
                                {editingID === product.productID ? (
                                    <div className="list-edit-form">
                                        <div className="form-row">
                                            <div className="price-input">
                                                <label>Price ($):</label>
                                                <input 
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={product.unitPrice}
                                                    onChange={(e) => handleChange(product.productID, 'unitPrice', e.target.value)}
                                                />
                                            </div>
                                            
                                            <div className="discount-input">
                                                <label>Discount (%):</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={product.discountPercentage || 0}
                                                    onChange={(e) => handleChange(product.productID, 'discountPercentage', e.target.value)}
                                                />
                                            </div>
                                            
                                            <div className="final-price">
                                                Final: <strong>${calculateFinalPrice(product)}</strong>
                                            </div>
                                        </div>
                                        
                                        <div className="button-row">
                                            <button
                                                onClick={() => handleSavePrice(product)}
                                                className="save-button"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => toggleEdit(null)}
                                                className="cancel-button"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="list-price-info">
                                        <div>
                                            <div className="price-row">
                                                <span>Price: ${Number(product.unitPrice).toFixed(2)}</span>
                                            </div>
                                            
                                            <div className="price-row">
                                                <span>Discount: {Number(product.discountPercentage || 0).toFixed(0)}%</span>
                                            </div>
                                            
                                            {(product.discountPercentage > 0) && (
                                                <div className="price-row final">
                                                    <span>Final: ${calculateFinalPrice(product)}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button
                                            className="edit-button"
                                            onClick={() => toggleEdit(product.productID)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SalesList;
