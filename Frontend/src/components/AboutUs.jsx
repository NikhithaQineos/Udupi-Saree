import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="image-container">
        <img 
          src="images/Aboutus.png" 
          alt="Saree Model"
        />
      </div>
      <div className="text-container">
        <h2>About Us</h2>
        <p>
          We, Karnataka Silk and Sarees, situated at Malad West, Mumbai, Maharashtra, 
          are your one-stop shop for all types and patterns of sarees. Our sarees are available 
          in many different ranges and varieties. We have a qualified team of adroit 
          professionals, who test the entire range of offered sarees to make sure that the 
          clients receive flawless supplies. The demand for our sarees is increasing rapidly 
          owing to their beautiful designs, finest quality, and attractive colours.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
