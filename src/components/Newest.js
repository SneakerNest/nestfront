import React from "react";
import "../styles/Newest.css";

// Example images (replace paths as needed)
import aj1highredwhite from "../assets/aj1highredwhite.jpg";
import nb9060 from "../assets/9060white.jpg";
import birkenstockarizona from "../assets/birkenstockarizonablack.jpg";
import dunk from "../assets/dunkpurple.jpg";
import yeezyslideblack from "../assets/yeezyslideblack.jpg";
import yeezy350 from "../assets/yeezywhite.jpg";
import converse from "../assets/conversered.jpg";
import crocs from "../assets/crocsblue.jpg";

// Sample product array
const newestProducts = [
  { id: 1, name: "Air Jordan 1", image: aj1highredwhite, price: "$199" },
  { id: 2, name: "Nike Dunk", image: dunk, price: "$149" },
  { id: 3, name: "Yeezy 350 Boost", image: yeezy350, price: "$220" },
  { id: 4, name: "Yeezy Slide", image: yeezyslideblack, price: "$130" },
  { id: 5, name: "New Balance 9060", image: nb9060, price: "$140" },
  { id: 6, name: "Birkenstock Arizona", image: birkenstockarizona, price: "$180" },
  { id: 7, name: "Crocs", image: crocs, price: "$120" },
  { id: 8, name: "Converse", image: converse, price: "$85" },
];

const NewestProducts = () => {
  return (
    <div className="newest">
      <h2 className="newest-title">-Newest Arrivals-</h2>
      <div className="newest-container">
        {newestProducts.map((product) => (
          <div key={product.id} className="newest-card">
            <img
              src={product.image}
              alt={product.name}
              className="newest-image"
            />
            <p className="newest-name">{product.name}</p>
            <p className="newest-price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewestProducts;
