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

  // Fetch cart data from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip the test request since we know GET works but POST doesn't
      // Let's directly try the POST request with proper configuration
      
      const customerID = isUserLogged()?.customerID || null;
      console.log('Fetching cart for customer:', customerID);
      
      const response = await axios.post(
        `${API_BASE_URL}/cart/fetch`, 
        { customerID },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 8000 // Increase timeout to allow for slower responses
        }
      );
      
      console.log('Cart response:', response.data);
      
      if (response.data && response.data.products) {
        const formattedItems = response.data.products.map(item => ({
          id: item.productID,
          name: item.name || item.productName,
          price: item.unitPrice || item.productPrice,
          discountedPrice: item.unitPrice ? 
            item.unitPrice * (1 - item.discountPercentage / 100) : 
            item.productPrice,
          quantity: item.quantity,
          size: item.size || "",
          image: item.picturePath ? 
            `${API_BASE_URL}/images/${item.picturePath.split(',')[0]}` : 
            '/placeholder.jpg'
        }));
        
        setCartItems(formattedItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.error || 'Unknown error'}`);
      } else if (err.request) {
        setError('Cannot connect to the server. Please check if the server is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (product) => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      const productID = product.id || product.productID;

      await axios.post(
        `${API_BASE_URL}/cart/product/add/${productID}`,
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
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
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

  // Delete item completely from cart
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

  // Clear entire cart
  const clearCart = async () => {
    try {
      // We don't have a direct backend endpoint for this,
      // so we'll delete each item individually
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

  // Handler for merging carts on login
  const mergeCartsOnLogin = async (customerID) => {
    try {
      await axios.post(
        `${API_BASE_URL}/cart/merge/${customerID}`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      await fetchCart();
    } catch (err) {
      console.error('Error merging carts:', err);
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
