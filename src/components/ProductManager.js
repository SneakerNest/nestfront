import React, { useState, useEffect } from "react";
import "../styles/ProductManager.css";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    stock: "",
    category: "Sneakers", // Default category is Sneakers
    image: "",
    sizes: "",
    status: "Ordered", // Default status is Ordered
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
        sizes: ["42", "43", "43", "45"],
        units: [
          { id: 1, status: "Ordered", size: "42" },
          { id: 2, status: "Ordered", size: "43" },
          { id: 3, status: "Ordered", size: "43" },
          { id: 4, status: "Ordered", size: "45" },
          { id: 5, status: "Ordered", size: "42" },
        ],
      },
      { 
        id: 2, 
        name: "Casual B", 
        price: 80, 
        stock: 15, 
        category: "Casual", 
        image: "https://via.placeholder.com/220x250?text=Casual+B",
        sizes: ["42", "43", "43", "45"],
        units: [
          { id: 1, status: "Ordered", size: "42" },
          { id: 2, status: "Ordered", size: "43" },
          { id: 3, status: "Ordered", size: "43" },
          { id: 4, status: "Ordered", size: "45" },
          { id: 5, status: "Ordered", size: "42" },
        ],
      },
      {
        id: 3,
        name: "Boot C",
        price: 120,
        stock: 5,
        category: "Boots",
        image: "https://via.placeholder.com/220x250?text=Boot+C",
        sizes: ["42", "43", "43", "45"],
        units: [
          { id: 1, status: "Ordered", size: "42" },
          { id: 2, status: "Ordered", size: "43" },
          { id: 3, status: "Ordered", size: "43" },
          { id: 4, status: "Ordered", size: "45" },
          { id: 5, status: "Ordered", size: "42" },
        ],
      }
    ];

    setProducts(initialProducts);
    updateTotals(initialProducts);
  }, []);

  // Update total products and stock dynamically
  useEffect(() => {
    updateTotals(products);
  }, [products]);

  const updateTotals = (products) => {
    const totalStock = products.reduce((sum, product) => sum + product.units.length, 0);
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
    const { name, stock, category, image, sizes, status } = newProduct;
    if (!name || !stock || !category || !image || !sizes) {
      alert("Please fill in all fields.");
      return;
    }

    // Create units based on stock
    const units = [];
    const stockNumber = Number(stock);
    for (let i = 0; i < stockNumber; i++) {
      units.push({ id: i + 1, status: status, size: sizes.split(",")[i % sizes.split(",").length].trim() });
    }

    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const productToAdd = {
      id: newId,
      name,
      stock: stockNumber,
      category,
      image,
      sizes: sizes.split(",").map(s => s.trim()),
      units, // Store the units
    };
    setProducts([...products, productToAdd]);
    setNewProduct({ name: "", stock: "", category: "Sneakers", image: "", sizes: "", status: "Ordered" });
  };

  // Handle changing status (e.g., Bought -> Shipped)
  const handleStatusChange = (productId, unitId, newStatus) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              units: p.units.map(u =>
                u.id === unitId ? { ...u, status: newStatus } : u
              ),
            }
          : p
      )
    );
  };

  // Delete a product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
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
              <th>Stock</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>
                  <img className="product-img" src={p.image} alt={p.name} />
                </td>
                <td>{p.name}</td>
                <td>{p.units.length}</td>
                <td>{p.category}</td>
                <td>{p.sizes.join(", ")}</td>
                <td>
                  {p.units.map(unit => (
                    <div key={unit.id}>
                      <span>{unit.size}: {unit.status}</span>
                      <select 
                        value={unit.status} 
                        onChange={(e) => handleStatusChange(p.id, unit.id, e.target.value)}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Bought">Bought</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Arrived">Arrived</option>
                      </select>
                    </div>
                  ))}
                </td>
                <td>
                  <button onClick={() => handleDelete(p.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
