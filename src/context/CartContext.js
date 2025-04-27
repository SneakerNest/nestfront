import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { isUserLogged } from '../utils/auth';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const customerID = isUserLogged()?.customerID || null;
      
      const response = await axios.post('http://localhost:5001/api/v1/cart/fetch', 
        { customerID },
        { withCredentials: true }
      );
      
      if (response.data && response.data.products) {
        const formattedItems = response.data.products.map(item => ({
          id: item.productID,
          name: item.name,
          price: item.unitPrice,
          discountedPrice: item.unitPrice * (1 - item.discountPercentage / 100),
          quantity: item.quantity,
          size: item.size,
          // Use the first picture from the pictures array or fallback to placeholder
          image: item.picturePath ? 
            `http://localhost:5001/api/v1/images/${item.picturePath.split(',')[0]}` : 
            '/placeholder.jpg'
        }));
        setCartItems(formattedItems);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (item) => {
    try {
      const customerID = isUserLogged() ? JSON.parse(localStorage.getItem('user'))?.customerID : null;
      
      await axios.post(
        `http://localhost:5001/api/v1/cart/product/add/${item.productID}`,
        { customerID },
        { withCredentials: true }
      );
      
      await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const customerID = isUserLogged() ? JSON.parse(localStorage.getItem('user'))?.customerID : null;
      
      await axios.post(
        `http://localhost:5001/api/v1/cart/product/remove/${productId}`,
        { customerID },
        { withCredentials: true }
      );
      
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const customerID = isUserLogged() ? JSON.parse(localStorage.getItem('user'))?.customerID : null;
      if (customerID) {
        await axios.delete(
          `http://localhost:5001/api/v1/cart/clear`,
          {
            data: { customerID },
            withCredentials: true
          }
        );
      }
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
    }
  };

  // Handler for merging carts on login
  const mergeCartsOnLogin = async (customerID) => {
    try {
      await axios.post(
        `http://localhost:5001/api/v1/cart/merge/${customerID}`,
        {},
        { withCredentials: true }
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
