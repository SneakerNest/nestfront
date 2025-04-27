import axios from 'axios';
import { isUserLogged } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5001/api/v1';

/**
 * Get cart contents
 * @returns {Promise} - API response
 */
export const getCart = async () => {
  const customerID = isUserLogged()?.customerID || null;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/fetch`,
      { customerID },
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Merge carts upon login
 * @param {number} customerID - Customer ID to merge carts for
 * @returns {Promise} - API response
 */
export const mergeCartsOnLogin = async (customerID) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/merge/${customerID}`,
      {},
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error merging carts:', error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {number} productId - ID of the product to add
 * @returns {Promise} - API response
 */
export const addToCart = async (productId) => {
  const customerID = isUserLogged()?.customerID || null;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/product/add/${productId}`,
      { customerID },
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Remove one item from cart (decreases quantity by 1)
 * @param {number} productId - ID of the product to remove
 * @returns {Promise} - API response
 */
export const removeFromCart = async (productId) => {
  const customerID = isUserLogged()?.customerID || null;
  return axios.post(
    `${API_BASE_URL}/cart/product/remove/${productId}`, 
    { customerID }, 
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

/**
 * Delete item completely from cart
 * @param {number} productId - ID of the product to delete
 * @returns {Promise} - API response
 */
export const deleteFromCart = async (productId) => {
  const customerID = isUserLogged()?.customerID || null;
  return axios.post(
    `${API_BASE_URL}/cart/product/delete/${productId}`, 
    { customerID }, 
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

/**
 * Delete empty permanent cart on logout
 * @param {number} customerID - Customer ID whose cart should be deleted
 * @returns {Promise} - API response
 */
export const deletePermanentCartOnLogout = async (customerID) => {
  return axios.put(
    `${API_BASE_URL}/cart/permanent/${customerID}`, 
    {}, 
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};