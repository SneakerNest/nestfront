const API_URL = 'http://localhost:5001/api/v1/store';
const IMAGE_URL = 'http://localhost:5001/api/v1/images';

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await response.json();
    
    return products.map(product => ({
      ...product,
      unitPrice: parseFloat(product.unitPrice) || 0,
      discountedPrice: parseFloat(product.discountedPrice) || 0,
      imageUrl: product.pictures && product.pictures.length > 0 
        ? `${IMAGE_URL}/${product.pictures[0]}`
        : '/placeholder.jpg'
    }));
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL}/products/category/${categoryId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};