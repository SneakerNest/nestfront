import { fetchWithAuth } from './api';

export const getCart = () => fetchWithAuth('/cart/fetch', { method: 'POST' });
export const addToCart = (productId) => 
    fetchWithAuth(`/cart/product/add/${productId}`, { method: 'POST' });
export const removeFromCart = (productId) => 
    fetchWithAuth(`/cart/product/remove/${productId}`, { method: 'POST' });