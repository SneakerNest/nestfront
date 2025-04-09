import React, { useEffect, useState } from "react";

const ManagerHome = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    const mockProducts = [
      { id: 1, name: "Sneaker A", price: 100, stock: 10 },
      { id: 2, name: "Casual B", price: 80, stock: 15 },
      { id: 3, name: "Boot C", price: 120, stock: 5 },
    ];
    setTotalProducts(mockProducts.length);
    setTotalStock(mockProducts.reduce((acc, p) => acc + p.stock, 0));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Manager Dashboard</h1>
        <div style={styles.stats}>
          <p style={styles.stat}>
            <strong>Total Products:</strong> {totalProducts}
          </p>
          <p style={styles.stat}>
            <strong>Total Stock:</strong> {totalStock}
          </p>
        </div>
        <p style={styles.welcomeText}>Welcome to your manager dashboard!</p>
        <a href="/manager/products" style={styles.buttonLink}>
          <button style={styles.button}>Go to Product Management</button>
        </a>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
  },
  stats: {
    marginBottom: "30px",
  },
  stat: {
    fontSize: "1.2rem",
    marginBottom: "10px",
    color: "#555",
  },
  welcomeText: {
    fontSize: "1rem",
    color: "#777",
    marginBottom: "20px",
  },
  buttonLink: {
    textDecoration: "none",
  },
  button: {
    padding: "12px 25px",
    backgroundColor: "#e63946",
    color: "white",
    fontSize: "1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#b22234",
  },
};

export default ManagerHome;
