// In the component that displays category tiles/cards:

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/store/categories');
      const parentCategories = response.data.filter(cat => !cat.parentCategoryID);
      setCategories(parentCategories);
      console.log('Fetched categories for homepage:', parentCategories);
    } catch (error) {
      console.error("Error fetching categories for homepage:", error);
    }
  };

  fetchCategories();
}, []);

// Then in your JSX:
<div className="categories-section">
  <h2>Shop by Category</h2>
  <div className="category-grid">
    {categories.map(category => (
      <div key={category.categoryID} className="category-card">
        <Link to={`/category/${category.categoryID}`}>
          <div className="category-image">
            {/* Use category name for the image path */}
            <img 
              src={`/images/${category.name.replace(/\s+/g, '')}.jpg`}
              alt={category.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/category-placeholder.jpg";
              }}
            />
          </div>
          <h3>{category.name}</h3>
        </Link>
      </div>
    ))}
  </div>
</div>