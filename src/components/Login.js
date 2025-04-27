import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import "../styles/Login.css";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const { mergeCartsOnLogin } = useContext(CartContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/v1/user/login', {
        username,
        password
      });

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Merge carts after login
        await mergeCartsOnLogin(response.data.user.customerID);
        
        // Navigate back to cart if that's where user came from
        const tempCart = localStorage.getItem('tempCart');
        if (tempCart) {
          localStorage.removeItem('tempCart');
          navigate('/cart');
        } else {
          navigate('/shop');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <Link to="/">
            <img src={require("../assets/2.png")} alt="SneakerNest Logo" />
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        <p>
          New to SneakerNest? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
