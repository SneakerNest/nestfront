// src/components/ManagerHome.js
import React, { useEffect, useState } from "react";

const ManagerHome = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  // In a real app, you'd fetch stats from an API. For now, we mock them:
  useEffect(() => {
    // Example mock data. Replace with real fetch calls if you have an API.
    const mockProducts = [
      { id: 1, name: "Sneaker A", price: 100, stock: 10 },
      { id: 2, name: "Casual B", price: 80, stock: 15 },
      { id: 3, name: "Boot C", price: 150, stock: 5 },
    ];
    setTotalProducts(mockProducts.length);
    setTotalStock(mockProducts.reduce((acc, p) => acc + p.stock, 0));
  }, []);

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1>Manager Home</h1>
      <div style={{ marginTop: "30px" }}>
        <p>
          <strong>Total Products:</strong> {totalProducts}
        </p>
        <p>
          <strong>Total Stock:</strong> {totalStock}
        </p>
        <p>Welcome to your manager dashboard!</p>
        <a href="/manager/products" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 20px", marginTop: "20px" }}>
            Go to Product Management
          </button>
        </a>
      </div>
    </div>
  );
};

export default ManagerHome;
