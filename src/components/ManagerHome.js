import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isUserLogged } from "../utils/auth";
import ProductManager from "./ProductManager";

const ManagerHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = isUserLogged();
    if (!user || user.role !== 'productManager') {
      navigate('/login');
      return;
    }
    setUserData(user);
  }, [navigate]);

  return (
    <div className="manager-dashboard">
      <h1>Product Manager Dashboard</h1>
      <h2>Welcome, {userData?.name}</h2>
      
      <div className="dashboard-content">
        <ProductManager />
      </div>
    </div>
  );
};

export default ManagerHome;
