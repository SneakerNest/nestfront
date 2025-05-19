import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import axios from 'axios';

import "./styles/Global.css";
import "./index.css";

// Base URL configuration
axios.defaults.baseURL = 'http://localhost:5001/api/v1';

// Ensure cookies are sent with requests (for authentication)
axios.defaults.withCredentials = true;

// Add axios interceptor to include token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling common errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Authentication error - redirecting to login');
      // Handle authentication errors
      localStorage.removeItem('token');
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </Router>
  </React.StrictMode>
);
