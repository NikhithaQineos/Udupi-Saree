import React from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Useful Links</h3>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/category">Category</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/videos">Videos</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Shri Krishna Complex,3rd Floor,</p>
          <p>Kalasanka, Udupi, 522036</p>
          <p>+919563296583</p>
          <p>udupisaree@gmail.com</p>
        </div>

        <div className="footer-section">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/61570322945024" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://www.linkedin.com/company/qineos-software-private-limited" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="https://www.instagram.com/qineossoftware9?igsh=eWxzNHM3dGF4ajBv" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://m.youtube.com/@qineossoftware" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Udupi Saree. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
