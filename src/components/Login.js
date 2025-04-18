import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { Link } from "react-router-dom";


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email.endsWith("@salesmanager.com")) {
      navigate("/salesmanager");
    } else if (email.endsWith("@productmanager.com")) {
      navigate("/manager");
    } else {
      navigate("/main-menu");
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
