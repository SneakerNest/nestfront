import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLoggedIn } from "../utils/auth";
import axios from "axios";
import "../styles/Login.css";
import { Link } from "react-router-dom";

function Login({ cartContext }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5001/api/v1/user/login', credentials);
      
      if (response.data.user) {
        // Store user data as a string
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // If you have cart context
        if (cartContext && cartContext.mergeCartsOnLogin) {
          await cartContext.mergeCartsOnLogin(response.data.user.customerID);
        }
        
        navigate('/shop');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    handleLogin({ username, password });
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
