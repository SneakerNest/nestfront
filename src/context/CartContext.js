import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { isUserLogged } from '../utils/auth';

// Base API URL for all requests
const API_BASE_URL = 'http://localhost:5001/api/v1';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addToCart = async (product) => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      
      console.log('Adding to cart:', { product, customerID });
      
      const response = await axios.post(
        `${API_BASE_URL}/cart/product/add/${product.id || product.productID}`,
        { 
          customerID,
          size: product.size 
        },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('Add to cart response:', response.data);
      await fetchCart(); // Refresh cart after adding
      return response.data;
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      
      const response = await axios.post(
        `${API_BASE_URL}/cart/fetch`,
        { customerID },
        { withCredentials: true }
      );
      
      if (response.data && response.data.products) {
        setCartItems(response.data.products);
      } else {
        setCartItems([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.error || err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      
      await axios.post(
        `${API_BASE_URL}/cart/product/remove/${productId}`,
        { customerID },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteFromCart = async (productId) => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      
      await axios.post(
        `${API_BASE_URL}/cart/product/delete/${productId}`,
        { customerID },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchCart();
    } catch (err) {
      console.error('Error deleting from cart:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      if (cartItems.length > 0) {
        setLoading(true);
        for (const item of cartItems) {
          await deleteFromCart(item.id);
        }
      }
      setCartItems([]);
      setLoading(false);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const mergeCartsOnLogin = async (customerID) => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/cart/merge/${customerID}`,
        {},
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error('Error merging carts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    refreshCart: fetchCart,
    mergeCartsOnLogin
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
