// Main application component that handles routing and navigation
// This file defines the entire application structure and navigation flow

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Slick carousel CSS for product sliders and carousels
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Core application components
import Navbar from "./components/Navbar"; // Global navigation bar
import CategoryPage from "./components/CategoryPage"; // Dynamic category display
import Login from "./components/Login"; // User authentication
import Signup from "./components/Signup"; // New user registration
import ProductPage from "./components/ProductPage"; // Main product listing
import MainMenu from "./components/MainMenu"; // Application main menu
import ProfilePage from "./components/ProfilePage"; // User profile management
import ProductView from "./components/ProductView"; // Individual product details

// Category-specific pages
import SneakersPage from "./components/Sneakers";
import CasualPage from "./components/Casual";
import BootsPage from "./components/Boots";
import SlippersSandalsPage from "./components/slippers & sandals";

// Shopping features
import WishlistPage from "./components/WishlistPage"; // User saved items
import CartPage from "./components/CartPage"; // Shopping cart management
import CheckoutPage from "./components/CheckoutPage"; // Order processing
import PaymentPage from "./components/PaymentPage"; // Payment processing
import InvoiceView from "./components/InvoiceView"; // Order invoice display

// Administration components
import ManagerHome from "./components/ManagerHome"; // Admin dashboard
import ProductManager from "./components/ProductManager"; // Product inventory management
import SalesManagerMenu from "./components/SalesManagerMenu"; // Sales management interface

// Authentication and state management
import ProtectedRoute from "./components/ProtectedRoute"; // Route access control wrapper
import { CartProvider } from './context/CartContext'; // Shopping cart context provider

/**
 * Main App component
 * This component serves as the application's root and defines the routing structure
 * It wraps the entire application in a CartProvider context for global cart state
 */
function App() {
  return (
    // CartProvider makes cart functionality available throughout the application
    <CartProvider>
      <>
        {/* Global navigation appears on all pages except where conditionally hidden */}
        <Navbar />
        
        {/* Application routing configuration */}
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<CartPage />} /> {/* Cart is public to allow guest shopping */}
          
          {/* Protected routes - require user authentication */}
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
          
          {/* Admin routes - require specific role permissions */}
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
          
          {/* Checkout process routes - require authentication */}
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

          {/* Product manager section with nested routes */}
          <Route 
            path="/productmanager/*" 
            element={
              <ProtectedRoute roles={['productManager']}>
                <ProductManager />
              </ProtectedRoute>
            } 
          />

          {/* Product browsing routes - public access */}
          <Route path="/product/:id" element={<ProductView />} /> {/* Dynamic product detail page */}
          <Route path="/product-page" element={<ProductPage />} />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/shop" element={<ProductPage />} /> {/* Main shopping entry point */}

          {/* Category-specific shopping routes */}
          <Route path="/sneakers" element={<SneakersPage />} />
          <Route path="/casual" element={<CasualPage />} />
          <Route path="/boots" element={<BootsPage />} />
          <Route path="/slippers-sandals" element={<SlippersSandalsPage />} />
          <Route path="/category/:id" element={<CategoryPage />} /> {/* Dynamic category page */}

          {/* Invoice route - typically accessed after purchase or from account */}
          <Route path="/invoice/:orderId" element={<InvoiceView />} />

          {/* Default route - redirects to login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    </CartProvider>
  );
}

export default App;
