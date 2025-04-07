import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProductPage from "./components/ProductPage";
import MainMenu from "./components/MainMenu";

// You can create these category pages as separate components
import SneakersPage from "./components/Sneakers";
import CasualPage from "./components/Casual";
import BootsPage from "./components/Boots";
import SlippersSandalsPage from "./components/SlippersSandals";
import WishlistPage from "./components/WishlistPage";



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main navigation pages */}
        <Route path="/product-page" element={<ProductPage />} />
        <Route path="/main-menu" element={<MainMenu />} />

        {/* Product category routes */}
        <Route path="/sneakers" element={<SneakersPage />} />
        <Route path="/casual" element={<CasualPage />} />
        <Route path="/boots" element={<BootsPage />} />
        <Route path="/slippers-sandals" element={<SlippersSandalsPage />} />

      </Routes>
    </>
  );
}

export default App;
