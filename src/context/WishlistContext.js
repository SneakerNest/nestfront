// src/context/WishlistContext.js
import React, { createContext, useState, useEffect } from "react";
import { isUserLogged, axios } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const user = isUserLogged();
      if (!user) return;

      const response = await axios.get('/wishlist');
      setWishlist(response.data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlistItem = async (product) => {
    const user = isUserLogged();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const isInList = wishlist.some(item => item.productID === product.productID);
      
      if (isInList) {
        await axios.delete(`/wishlist/product/remove/${product.productID}`);
        setWishlist(prev => prev.filter(item => item.productID !== product.productID));
      } else {
        await axios.post(`/wishlist/product/add/${product.productID}`);
        setWishlist(prev => [...prev, product]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError(error.message);
    }
  };

  const moveToCart = async (productID, size) => {
    const user = isUserLogged();
    if (!user || !user.customerID) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/wishlist/product/move-to-cart/${productID}`, {
        customerID: user.customerID,
        size: size
      });
      setWishlist(prev => prev.filter(item => item.productID !== productID));
    } catch (error) {
      console.error('Error moving product to cart:', error);
      setError(error.message);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productID === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      error, 
      toggleWishlistItem, 
      isInWishlist,
      moveToCart 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
