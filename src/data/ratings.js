

// In‑memory store of all ratings.
// Each rating is { id, productId, userId, rating } where rating is 1–5.
const ratings = [
    { id: 1, productId: 5, userId: 2, rating: 4 },
    { id: 2, productId: 6, userId: 1, rating: 5 },
    { id: 3, productId: 3, userId: 3, rating: 3 },
    { id: 4, productId: 5, userId: 4, rating: 5 },
    // …add more sample entries as you like
  ];
  
  /**
   * Add a new rating (no approval step).
   * @param {{ productId: number, userId: number, rating: number }} param0
   */
  export function addRating({ productId, userId, rating }) {
    const newId = ratings.length ? ratings[ratings.length - 1].id + 1 : 1;
    ratings.push({ id: newId, productId, userId, rating });
  }
  
  /**
   * Get all raw ratings for a given product.
   * @param {number} productId
   * @returns {Array<{id:number,productId:number,userId:number,rating:number}>}
   */
  export function getRatingsFor(productId) {
    return ratings.filter(r => r.productId === productId);
  }
  
  /**
   * Compute the average rating (1–5) for a product.
   * @param {number} productId
   * @returns {number} average or 0 if none
   */
  export function getAverageRating(productId) {
    const productRatings = getRatingsFor(productId);
    if (!productRatings.length) return 0;
    const sum = productRatings.reduce((acc, r) => acc + r.rating, 0);
    return sum / productRatings.length;
  }
  
  /**
   * (Optional) Get every rating record.
   */
  export function getAllRatings() {
    return [...ratings];
  }
  