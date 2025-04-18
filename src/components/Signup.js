import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import logo from "../assets/2.png";
import background from "../assets/background.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const [showAddress, setShowAddress] = useState(false);

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

    if (email.endsWith("@salesmanager.com")) {
      navigate("/salesmanager");
    } else if (email.endsWith("@productmanager.com")) {
      navigate("/productmanager");
    } else {
      setShowAddress(true);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    console.log("User Info:", userInfo);
    navigate("/login");
  };

  return (
    <div className="signup-container">
      <img src={background} alt="background" className="background-image" />

      <div className="signup-box">
        <img src={logo} alt="SneakerNest Logo" className="logo" />
        <h2>{showAddress ? "Enter Address Info" : "SIGN UP"}</h2>

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
                required
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
