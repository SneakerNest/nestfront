import React, { useState } from 'react';
import {
  ShoppingCart,
  Heart,
  Menu,
  Search,
  User,
  X,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isUserLogged } from "../utils/auth";

const Navbar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // ✅ NEW
  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleCategories = () => setShowCategories(!showCategories);
  const handleUserClick = () => {
    if (isUserLogged()) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <nav className="w-full bg-white text-black shadow-md px-6 py-4 flex items-center justify-between fixed top-0 z-50">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <img src={require("../assets/2.png")} alt="Logo" className="h-16 w-auto" />
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-6 max-w-lg">
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/product-page?search=${encodeURIComponent(searchValue)}`);
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-black focus:outline-none"
              placeholder="Search sneakers..."
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-black" />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-6">
          <Heart className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => navigate('/wishlist')}/>
          <ShoppingCart className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => navigate('/cart')}/>
          <User className="cursor-pointer hover:text-red-600 transition-colors" onClick={handleUserClick} />
          <Menu className="cursor-pointer hover:text-red-600 transition-colors" onClick={toggleSidebar} />
        </div>
      </nav>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 ${showSidebar ? 'right-0' : '-right-full'} h-full w-64 bg-white shadow-lg z-40 transition-all duration-300 pt-28 px-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-black">MENU</h2>
          <X className="cursor-pointer hover:text-red-600" onClick={toggleSidebar} />
        </div>
        <ul className="space-y-4">
          <li
            className="cursor-pointer hover:text-red-600 transition-colors"
            onClick={() => {
              navigate('/main-menu');
              toggleSidebar();
            }}
          >
            Main Menu
          </li>
          <li
            className="cursor-pointer hover:text-red-600 transition-colors"
            onClick={() => {
              navigate('/product-page');
              toggleSidebar();
            }}
          >
            Product Page
          </li>
          <li
            className="cursor-pointer hover:text-red-600 transition-colors flex items-center justify-between"
            onClick={toggleCategories}
          >
            <span>Categories</span>
            <ChevronDown className={`ml-2 transform transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
          </li>
          {showCategories && (
            <ul className="ml-4 mt-2 space-y-2 text-sm text-gray-700">
              <li className="hover:text-red-600 cursor-pointer" onClick={() => navigate('/sneakers')}>Sneakers</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => navigate('/casual')}>Casual</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => navigate('/boots')}>Boots</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => navigate('/slippers-sandals')}>Slippers & Sandals</li>
            </ul>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Navbar;

