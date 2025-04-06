import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // ✅ ✅

import "./styles/Global.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <CartProvider>
      <WishlistProvider> {/* ✅ This is crucial */}
        <Router>
          <App />
        </Router>
      </WishlistProvider>
    </CartProvider>
  </React.StrictMode>
);
