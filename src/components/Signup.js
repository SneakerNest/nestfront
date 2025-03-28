import React from "react";
import "../styles/Signup.css";
import logo from "../assets/2.png";
import background from "../assets/background.jpg";

const Signup = () => {
  return (
    <div className="signup-container">
      <img src={background} alt="background" className="background-image" />
      <div className="signup-box">
        <img src={logo} alt="SneakerNest Logo" className="logo" />
        <h2>SIGN UP</h2>
        <input type="text" placeholder="Name and Surname" />
        <input type="email" placeholder="Email" />
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button className="signup-btn">Sign up</button>
      </div>
    </div>
  );
};

export default Signup;
