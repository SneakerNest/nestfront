import React, { useState, useEffect } from "react";
import "../styles/ProductManager.css";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "",
    sizes: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  // Load initial product data (mock data for now)
  useEffect(() => {
    const initialProducts = [
      { 
        id: 1, 
        name: "Sneaker A", 
        price: 100, 
        stock: 10, 
        category: "Sneakers", 
        image: "https://via.placeholder.com/220x250?text=Sneaker+A",
        sizes: ["42", "43", "43", "45"]
      },
      { 
        id: 2, 
        name: "Casual B", 
        price: 80, 
        stock: 15, 
        category: "Casual", 
        image: "https://via.placeholder.com/220x250?text=Casual+B",
        sizes: ["42", "43", "43", "45"]
      },
      {
        id: 3,
        name: "Boot C",
        price: 120,
        stock: 5,
        category: "Boots",
        image: "https://via.placeholder.com/220x250?text=Boot+C",
        sizes: ["42", "43", "43", "45"]
      }
    ];

    setProducts(initialProducts);
    // Calculate total products and stock
    updateTotals(initialProducts);
  }, []);

  // Update total products and stock dynamically
  useEffect(() => {
    updateTotals(products);
  }, [products]);

  const updateTotals = (products) => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalProducts = products.length;
    setTotalStock(totalStock);
    setTotalProducts(totalProducts);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  // Add new product
  const handleAddProduct = (e) => {
    e.preventDefault();
    const { name, price, stock, category, image, sizes } = newProduct;
    if (!name || !price || !stock || !category || !image || !sizes) {
      alert("Please fill in all fields.");
      return;
    }
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const productToAdd = {
      id: newId,
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      image,
      sizes: sizes.split(",").map(s => s.trim()),
    };
    setProducts([...products, productToAdd]);
    setNewProduct({ name: "", price: "", stock: "", category: "", image: "", sizes: "" });
  };

  // Delete a product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Inline update for product fields
  const handleUpdate = (id, field, value) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, [field]: field === "price" || field === "stock" ? Number(value) : value }
          : p
      )
    );
  };

  // Filter products based on search query (by name)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="h1">Product Manager</h1>

      {/* Dashboard Summary */}
      <div className="dashboard-summary">
        <p>Total Products: {totalProducts}</p>
        <p>Total Stock: {totalStock}</p>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={newProduct.category}
          onChange={handleInputChange}
        />
        <input
          type="url"
          name="image"
          placeholder="Product Image URL"
          value={newProduct.image}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="sizes"
          placeholder="Available Sizes (comma-separated)"
          value={newProduct.sizes}
          onChange={handleInputChange}
        />
        <button type="submit" className="add-btn">Add Product</button>
      </form>

      {/* Products List */}
      <div className="product-list">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>
                  <img className="product-img" src={p.image} alt={p.name} />
                </td>
                <td>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleUpdate(p.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => handleUpdate(p.id, "price", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => handleUpdate(p.id, "stock", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={p.category}
                    onChange={(e) => handleUpdate(p.id, "category", e.target.value)}
                  />
                </td>
                <td>{p.sizes.join(", ")}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" className="no-results">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
