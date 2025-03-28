// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./App";
import Navbar from "./components/Navbar";

// Import your components
import MainMenu from "./components/MainMenu";
import Hero from "./components/Hero";
import Category from "./components/Category";
import Newest from "./components/Newest";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import Login from "./components/Login";
import Signup from "./components/Signup";

// CartContext
import CartContextProvider from "./components/CartContext";

import "./styles/Global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <CartContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/mainmenu" element={<MainMenu />} />
          <Route path="/hero" element={<Hero />} />
          <Route path="/category" element={<Category />} />
          <Route path="/newest" element={<Newest />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </CartContextProvider>
  </React.StrictMode>
);
