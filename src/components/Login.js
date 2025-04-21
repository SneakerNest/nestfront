import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLoggedIn } from "../utils/auth";
import "../styles/Login.css";
import { Link } from "react-router-dom";


const userDB = {
  "mert": "mert@salesmanager.com",
  "ramzy": "ramzy@productmanager.com",
  "tdoker": "tdoker@gmail.com",
};

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const email = userDB[username] || "";

    setLoggedIn();

    if (email.endsWith("@salesmanager.com")) {
      navigate("/salesmanager");
    } else if (email.endsWith("@productmanager.com")) {
      navigate("/manager");
    } else if (email){
      navigate("/main-menu");
    } else {
      alert("User not found")
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

        <form onSubmit={handleLogin}>
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
          New to SneakerNest? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
