import React from 'react'
import '../styles/Category.css'
import aj1highredwhite from "../assets/aj1highredwhite.jpg"
import yeezyslideblack from "../assets/yeezyslideblack.jpg"
import loafer from "../assets/Gucci-Horsebit-Loafers-Black.avif"
import boot from "../assets/Timberland-6-Inch-Premium-Waterproof-Wheat-Product.avif"
// will make this dynamic later
const categories = [
    { name: "Sneakers", image: aj1highredwhite },
    { name: "Casual", image: loafer },
    { name: "Boots", image: boot },
    { name: "Slippers & Sandals", image: yeezyslideblack }
];

const Category = () => {
    return (
        <div className="category-section">
            <h2 className="category-title">-Shop by Category-</h2>
            <div className="category-container">
                {categories.map((category, index) => (
                    <div key={index} className="category-card">
                        <img src={category.image} alt={category.name} className="category-image" />
                        <p className="category-name">{category.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Category;