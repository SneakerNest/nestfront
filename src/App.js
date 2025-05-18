// src/App.js
import React from "react";
import CategoryPage from "./components/CategoryPage";
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
import CheckoutPage from "./components/CheckoutPage";
import PaymentPage from "./components/PaymentPage";

import ManagerHome from "./components/ManagerHome";
import ProductManager from "./components/ProductManager";
import SalesManagerMenu from "./components/SalesManagerMenu";

import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<CartPage />} /> {/* Remove ProtectedRoute wrapper */}
          
          {/* Protected routes */}
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute roles={['productManager']}>
              <ManagerHome />
            </ProtectedRoute>
          } />
          <Route path="/manager/products" element={
            <ProtectedRoute roles={['productManager']}>
              <ProductManager />
            </ProtectedRoute>
          } />
          <Route path="/salesmanager" element={
            <ProtectedRoute roles={['salesManager']}>
              <SalesManagerMenu />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Protected Product Manager Routes */}
          <Route 
            path="/productmanager/*" 
            element={
              <ProtectedRoute roles={['productManager']}>
                <ProductManager />
              </ProtectedRoute>
            } 
          />

          {/* Product routes */}
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/product-page" element={<ProductPage />} />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/shop" element={<ProductPage />} />

          {/* Category routes */}
          <Route path="/sneakers" element={<SneakersPage />} />
          <Route path="/casual" element={<CasualPage />} />
          <Route path="/boots" element={<BootsPage />} />
          <Route path="/slippers-sandals" element={<SlippersSandalsPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    </CartProvider>
  );
}

export default App;
