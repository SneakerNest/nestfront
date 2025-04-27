import { fetchWithAuth } from './api';

export const getWishlist = () => fetchWithAuth('/wishlist');
export const addToWishlist = (productId) => 
    fetchWithAuth(`/wishlist/product/add/${productId}`, { method: 'POST' });
export const removeFromWishlist = (productId) => 
    fetchWithAuth(`/wishlist/product/remove/${productId}`, { method: 'DELETE' });