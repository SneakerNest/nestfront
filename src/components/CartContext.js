import React, { createContext, useState } from "react";

// Create the Cart context
export const CartContext = createContext();

// Create a provider component
const CartContextProvider = ({ children }) => {
  // Example cart state as an array of items
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  // Remove item by id
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
