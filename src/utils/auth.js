import axios from 'axios';
import { CartContext } from '../context/CartContext';

export const isUserLogged = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clear invalid data
    return null;
  }
};

export const setLoggedIn = (token, user) => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.customerID) {
      // Call the API to handle server-side logout if needed
      await axios.post('http://localhost:5001/api/v1/user/logout', {
        customerID: user.customerID
      });
    }
    
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    
    // Force a page refresh to clear all states
    window.location.reload();
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
