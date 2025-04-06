import React from "react";
import "../styles/Login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={require("../assets/2.png")} alt="SneakerNest Logo" />
        </div>

        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
        <p>New to SneakerNest? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
}

export default Login;

