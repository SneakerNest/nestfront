import React from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/2.png";
import background from "../assets/background.jpg";

const Login = () => {
  return (
    <div className="login-container">
      <img src={background} alt="background" className="background-image" />
      <div className="login-box">
        <img src={logo} alt="SneakerNest Logo" className="logo" />
        <h2>LOGIN</h2>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button className="login-btn">Login</button>
        <p>
          New to SneakerNest?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
