import axios from 'axios';
import { CartContext } from '../context/CartContext';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5001/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const isUserLogged = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const parsedUser = JSON.parse(user);
    if (parsedUser.role === 'customer' && !parsedUser.customerID) {
      return null;
    }
    
    return parsedUser;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const setLoggedIn = (token, user) => {
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set default Authorization header for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting login data:', error);
    throw error;
  }
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.customerID) {
      try {
        // Call the API to handle server-side logout if needed
        await axios.post('/user/logout', {
          customerID: user.customerID
        });
      } catch (error) {
        console.error('Error during server logout:', error);
      }
    }
    
    // Clear all auth-related data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    
    // Clear axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Instead of reload, return true to indicate successful logout
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export { axios };  // Export configured axios instance
