import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { setLoggedIn } from "../utils/auth"; // Import setLoggedIn from auth utils
import axios from "axios";
import "../styles/Login.css";
import { Link } from "react-router-dom";

// Login component for user authentication
function Login() {
  // Hooks for navigation and cart management
  const navigate = useNavigate();
  const { mergeCartsOnLogin } = useContext(CartContext);
  
  // State management for form fields and error messages
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission and authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request to the server
      const response = await axios.post('/user/login', {
        username,
        password
      });

      // Process successful login response
      if (response.data.token && response.data.user) {
        await setLoggedIn(response.data.token, response.data.user);
        
        // Redirect based on user role
        switch (response.data.user.role) {
          case 'productManager':
            navigate('/productmanager'); // Changed from '/manager'
            break;
          case 'salesManager':
            navigate('/salesmanager');
            break;
          case 'customer':
            // Handle customer login
            try {
              // Fetch additional customer data
              const customerResponse = await axios.get(
                `/user/customer/${response.data.user.username}`
              );
              
              // Enrich user data with customer ID
              const userData = {
                ...response.data.user,
                customerID: customerResponse.data.customerID
              };

              // Update auth state with complete user data
              await setLoggedIn(response.data.token, userData);
              // Merge any guest cart with user's stored cart
              await mergeCartsOnLogin(customerResponse.data.customerID);
              navigate('/shop');
            } catch (error) {
              console.error('Error getting customer data:', error);
              setError('Error getting customer data');
            }
            break;
          default:
            setError('Invalid user role');
            break;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
  };

  // Render the login form
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo with homepage link */}
        <div className="logo-container">
          <Link to="/">
            <img src={require("../assets/2.png")} alt="SneakerNest Logo" />
          </Link>
        </div>

        {/* Error message display */}
        {error && <div className="error-message">{error}</div>}

        {/* Login form */}
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

        {/* Sign up link for new users */}
        <p>
          New to SneakerNest? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
