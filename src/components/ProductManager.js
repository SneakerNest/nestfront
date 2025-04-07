import React, { useState, useEffect } from "react";
import "../styles/ProductManager.css";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  // Load initial product data (this could be replaced with an API call)
  useEffect(() => {
    setProducts([
      { id: 1, name: "Sneaker A", price: 100, stock: 10, category: "Sneakers" },
      { id: 2, name: "Casual B", price: 80, stock: 15, category: "Casual" },
    ]);
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new product to the list
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.stock ||
      !newProduct.category
    ) {
      alert("Please fill in all fields.");
      return;
    }
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const productToAdd = {
      id: newId,
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      category: newProduct.category,
    };
    setProducts([...products, productToAdd]);
    setNewProduct({ name: "", price: "", stock: "", category: "" });
  };

  // Update stock for a given product
  const handleUpdateStock = (id, newStock) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? { ...product, stock: Number(newStock) }
          : product
      )
    );
  };

  return (
    <div className="container">
      <h1 className="h1">Product Manager</h1>
      {/* Form to add a new product */}
      <form onSubmit={handleAddProduct} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={newProduct.category}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Table displaying existing products */}
      <div className="product-list">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.category}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={product.stock}
                    onBlur={(e) =>
                      handleUpdateStock(product.id, e.target.value)
                    }
                  />
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
