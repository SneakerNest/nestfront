// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProductPage from "./components/ProductPage";
import MainMenu from "./components/MainMenu";

import ProfilePage from "./components/ProfilePage";

import ProductView from "./components/ProductView";


import SneakersPage from "./components/Sneakers";
import CasualPage from "./components/Casual";
import BootsPage from "./components/Boots";
import SlippersSandalsPage from "./components/slippers & sandals";
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";

import ManagerHome from "./components/ManagerHome";
import ProductManager from "./components/ProductManager";
import SalesManagerMenu from "./components/SalesManagerMenu";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Cart & Wishlist */}
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Product detail (must come before the listing) */}
        <Route path="/product/:id" element={<ProductView />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main navigation */}
        <Route path="/product-page" element={<ProductPage />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Category pages */}
        <Route path="/sneakers" element={<SneakersPage />} />
        <Route path="/casual" element={<CasualPage />} />
        <Route path="/boots" element={<BootsPage />} />
        <Route path="/slippers-sandals" element={<SlippersSandalsPage />} />

        {/* Manager dashboards */}
        <Route path="/manager" element={<ManagerHome />} />
        <Route path="/manager/products" element={<ProductManager />} />
        <Route path="/salesmanager" element={<SalesManagerMenu />} />
      </Routes>
    </>
  );
}

export default App;
