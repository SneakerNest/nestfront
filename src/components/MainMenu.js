import React from "react";
import "../styles/MainMenu.css";
import Hero from "./Hero"
import Category from "./Category";
import Newest from "./Newest";

const MainMenu = () => {
  return (
    <div>
        <Hero />
        <Category />
        <Newest />
    </div>
  )
}

export default MainMenu
