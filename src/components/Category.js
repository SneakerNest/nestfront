import React from 'react';
import '../styles/Category.css';
import aj1highredwhite from "../assets/aj1highredwhite.jpg";
import yeezyslideblack from "../assets/yeezyslideblack.jpg";
import loafer from "../assets/sambawhite.jpg";
import boot from "../assets/Timberland-6-Inch-Premium-Waterproof-Wheat-Product.avif";
import { Link } from 'react-router-dom';

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
                {categories.map((category, index) => {
                    const link = category.name.split(' ')[0].toLowerCase();
                    return (
                        <Link to={`/${link}`} key={index} className="category-card">
                            <img src={category.image} alt={category.name} className="category-image" />
                            <p className="category-name">{category.name}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Category;
