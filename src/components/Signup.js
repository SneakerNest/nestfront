import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Signup.css";
import logo from "../assets/2.png";
import background from "../assets/background.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const [showAddress, setShowAddress] = useState(false);
  const [error, setError] = useState("");

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    taxId: "",
    addressTitle: "",
    streetAddress: "",
    province: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = userInfo.email.toLowerCase();

    if (email.endsWith("@salesmanager.com") || email.endsWith("@productmanager.com")) {
      handleRegistration();
    } else {
      setShowAddress(true);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    await handleRegistration();
  };

  const handleRegistration = async () => {
    try {
      const userData = {
        name: userInfo.name,
        email: userInfo.email,
        username: userInfo.username,
        password: userInfo.password,
        ...(showAddress && {
          address: {
            addressTitle: userInfo.addressTitle,
            country: userInfo.country,
            city: userInfo.city,
            province: userInfo.province,
            zipCode: userInfo.zipCode,
            streetAddress: userInfo.streetAddress,
          },
          phone: userInfo.phone,
          ...(userInfo.taxId && { taxID: userInfo.taxId }), // Only include taxID if it exists
        }),
      };

      console.log('Sending registration data:', userData);
      const response = await registerUser(userData);
      
      if (response.role === "salesManager") {
        navigate("/salesmanager");
      } else if (response.role === "productManager") {
        navigate("/productmanager");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="signup-container">
      <img src={background} alt="background" className="background-image" />

      <div className="signup-box">
        <img src={logo} alt="SneakerNest Logo" className="logo" />
        <h2>{showAddress ? "Enter Address Info" : "SIGN UP"}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={showAddress ? handleFinalSubmit : handleSubmit}>
          {!showAddress && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name and Surname"
                value={userInfo.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userInfo.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={userInfo.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={userInfo.password}
                onChange={handleInputChange}
                required
              />
            </>
          )}

          {showAddress && (
            <>
              <input
                type="text"
                name="addressTitle"
                placeholder="Address Title"
                value={userInfo.addressTitle}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={userInfo.phone}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="taxId"
                placeholder="Tax ID"
                value={userInfo.taxId}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                value={userInfo.streetAddress}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="province"
                placeholder="Province"
                value={userInfo.province}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={userInfo.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                value={userInfo.zipCode}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={userInfo.country}
                onChange={handleInputChange}
                required
              />
            </>
          )}

          <button type="submit" className="signup-btn">
            {showAddress ? "Submit Info" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
