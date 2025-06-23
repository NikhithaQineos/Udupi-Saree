import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero-section position-relative text-center">
      <div className="hero-content">
        <h2 className="fw-bold">Wide Range of Sarees</h2>
        <p className="fs-5">To Enhance Your Look</p>
      </div>
      <img src="images/Saree-image.jpg" alt="Saree Banner" className="img-fluid" />
    </div>
  );
};

export default Hero;
