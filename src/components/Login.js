import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { setLoggedIn } from "../utils/auth"; // Import setLoggedIn from auth utils
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
      // Login request
      const response = await axios.post('http://localhost:5001/api/v1/user/login', {
        username,
        password
      });

      if (response.data.token && response.data.user) {
        // Get customerID if user is a customer
        if (response.data.user.role === 'customer') {
          try {
            const customerResponse = await axios.get(
              `http://localhost:5001/api/v1/user/customer/${response.data.user.username}`
            );
            
            // Add customerID to user data
            const userData = {
              ...response.data.user,
              customerID: customerResponse.data.customerID
            };

            // Store complete user data
            await setLoggedIn(response.data.token, userData);

            // Merge carts using the customerID
            await mergeCartsOnLogin(customerResponse.data.customerID);
            navigate('/shop');
          } catch (error) {
            console.error('Error getting customer data:', error);
            setError('Error getting customer data');
          }
        } else {
          // For non-customer roles, just store the data and navigate
          await setLoggedIn(response.data.token, response.data.user);
          if (response.data.user.role === 'productManager') {
            navigate('/productmanager');
          } else if (response.data.user.role === 'salesManager') {
            navigate('/salesmanager');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
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
