const API_URL = 'http://localhost:5001/api/v1/store';
const IMAGE_URL = 'http://localhost:5001/api/v1/images';

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await response.json();
    
    return products.map(product => {
      // Format image name according to the convention
      const formatImageName = (name) => {
        if (!name) return 'placeholder.jpg';
        return name.replace(/\s+/g, '_').toLowerCase() + '.jpg';
      };
      
      // Determine image URL in a more reliable way
      let imageUrl;
      
      // First check if pictures array exists and has items
      if (product.pictures && Array.isArray(product.pictures) && product.pictures.length > 0 && product.pictures[0]) {
        imageUrl = `${IMAGE_URL}/${product.pictures[0]}`;
      } 
      // For newly added products, use the formatted name approach
      else {
        imageUrl = `${IMAGE_URL}/${formatImageName(product.name)}`;
      }
      
      return {
        ...product,
        unitPrice: parseFloat(product.unitPrice) || 0,
        discountPercentage: parseFloat(product.discountPercentage) || 0,
        discountedPrice: parseFloat(product.discountedPrice) || 
          ((product.unitPrice * (1 - (product.discountPercentage || 0) / 100)) || 0),
        imageUrl: imageUrl
      };
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return []; // Return empty array instead of throwing
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