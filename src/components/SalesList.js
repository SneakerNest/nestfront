import React, { useState } from 'react';
import aj1highredwhite from "../assets/aj1highredwhite.jpg"
import dunk from "../assets/dunkpurple.jpg"
import yeezyslideblack from "../assets/yeezyslideblack.jpg"
import yeezy350 from "../assets/yeezywhite.jpg"
import '../styles/SalesList.css';
// i will change to dynamic data later
const Products = [
    { id: 1, name: "Air Jordan 1", image: aj1highredwhite, price: 199, discount: 0},
    { id: 2, name: "Nike Dunk", image: dunk, price: null, discount: 0},
    { id: 3, name: "Yeezy 350 Boost", image: yeezy350, price: null, discount: 0},
    { id: 4, name: "Yeezy Slide", image: yeezyslideblack, price: 130, discount: 0},
]

const SalesList = () => {
    const [products, setProducts] =  useState(Products);
    const [editingID, setEditingID] = useState(null);

    const handleChange = (id, field, value) => {
        setProducts(products.map(product => product.id === id ? 
            { ...product, [field]: value === '' ? null : parseFloat(value) }
            : product
        ));
    };
    
    const toggleEdit = (id) => {
        setEditingID(editingID === id ? null : id);
    };
    
    return (
        <div className='product-list'>
            <div className='card-grid'>
                {products.map(({ id, name, image, price, discount}) => (
                    <div className='product-card' key={id}>
                        <img src={image} alt={name} className="product-image" />
                        <h3>{name}</h3>
                        {editingID === id ? (
                            <>
                                <label>Price:</label>
                                <input type='number' value={price ?? ''} onChange={(e) => handleChange(id, 'price', e.target.value)}
                                />
                                <label>Discount:</label>
                                <input type='number' value={discount} onChange={(e) => handleChange(id, 'discount', e.target.value)}
                                />
                            </>
                        ): (
                            <>
                                <p>
                                    <strong>Price:</strong>{' '}
                                    {price !== null ? `$${price.toFixed(2)}` : <h>Not Set</h>}
                                </p>
                                <p>
                                    <strong>Discount:</strong> {discount}%
                                </p>
                                
                                {discount > 0 && price !== null && (
                                    <p>
                                        <strong>Discounted Price:</strong> ${ (price * (1 - discount / 100)).toFixed(2) }
                                    </p>
                                )}
                            </>
                        )}
                        <button className="edit-button" onClick={() => toggleEdit(id)}>
                            {editingID === id ? 'Done' : 'Edit'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesList;
