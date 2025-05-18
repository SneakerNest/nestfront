// Add or update the useEffect hook

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/store/categories');
      const parentCategories = response.data.filter(cat => !cat.parentCategoryID);
      setCategories(parentCategories);
    } catch (error) {
      console.error("Error fetching categories for shop sidebar:", error);
    }
  };

  fetchCategories();
}, []);

// Then in your sidebar JSX:
<div className="shop-sidebar">
  <h3>Categories</h3>
  <ul className="category-list">
    {categories.map(category => (
      <li key={category.categoryID}>
        <Link 
          to={`/category/${category.categoryID}`}
          className={activeCategory === category.categoryID ? 'active' : ''}
        >
          {category.name}
        </Link>
      </li>
    ))}
  </ul>
</div>