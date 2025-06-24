import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaHeart,
  FaYoutube,
  FaLinkedin,
  FaSearch,
  FaBars,
  FaShoppingCart
} from "react-icons/fa";
import "./Navbar.css";
import { CartContext } from "../../context/cartContext";
import { useContext } from "react";
import { WishlistContext } from "../../context/wishlistContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const { cartCount } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`${baseurl}/api/getproduct?query=${searchQuery}`);
        const data = await res.json();
        setSuggestions(data.products || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300); // debounce delay

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth");
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false); // close menu on navigation (mobile)
  };
  return (
    <>
      {/* Top Header */}
      <div className="container-fluid top-header d-none d-md-flex">
        <div className="d-flex align-items-center">
          <a href="https://www.facebook.com/61570322945024" target="_blank" rel="noopener noreferrer" className="me-2 text-dark">
            <FaFacebook />
          </a>
          <a href="https://www.linkedin.com/company/qineos-software-private-limited" target="_blank" rel="noopener noreferrer" className="me-2 text-dark">
            <FaLinkedin />
          </a>
          <a href="https://www.instagram.com/qineossoftware9?igsh=eWxzNHM3dGF4ajBv" target="_blank" rel="noopener noreferrer" className="me-2 text-dark">
            <FaInstagram />
          </a>
          <a href="https://m.youtube.com/@qineossoftware?fbclid=PAQ0xDSwKQEMRleHRuA2FlbQIxMAABp3CwGlFerFgYlWkOfgZpqp3sLHyAHqqVnIld4kjEyJJITpdLUcLtNyWVN9kQ_aem_XSaSKc1khrBg3jhHvh2teA" target="_blank" rel="noopener noreferrer" className="me-2 text-dark">
            <FaYoutube />
          </a>
        </div>
        <div className="contact-info">
          <FaPhone /> +91-9876543210 &nbsp; | &nbsp;
          <FaEnvelope /> udupisaree@gmail.com
        </div>
        <div className="user-options">
          📍Udupi &nbsp; | &nbsp;
          {user ? (
            <span className="fw-bold text-dark" style={{ cursor: "pointer" }}>
              Hello, {user.name} &nbsp; | &nbsp;
              <span onClick={handleLogout} style={{ textDecoration: "underline" }}>
                Logout
              </span>
            </span>
          ) : (
            <span
              onClick={() => navigate("/auth")}
              className="fw-bold text-dark"
              style={{ cursor: "pointer" }}
            >
              Log In | Sign Up
            </span>
          )}
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
        <div className="container">
          <button
            className="menu-toggle d-lg-none me-2"
            onClick={handleToggleMenu}
          >
            <FaBars size={20} />
          </button>


          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center">
            <img
              src="https://img.freepik.com/premium-vector/fashion-saree-logo-design-with-women-figure-template-illustration-generative-ai_1161132-770.jpg?ga=GA1.1.956460162.1738081963&semt=ais_hybrid"
              alt="Saree World Logo"
              className="logo"
            />
            <span className="brand-name">Udupi Saree</span>
          </a>

          {/* Navbar Items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate("/")}>
                  HOME
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate("/category")}>
                  CATEGORY
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate("/products")}>
                  PRODUCTS
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate("/about")}>
                  ABOUT US
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" onClick={() => navigate("/contact")}>
                  CONTACT US
                </a>
              </li>
            </ul>
          </div>

          {/* Search and Cart */}
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center">
              <div className="input-group search-bar" style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setHighlightIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (suggestions.length > 0) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightIndex((prev) => (prev + 1) % suggestions.length);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightIndex((prev) =>
                          prev <= 0 ? suggestions.length - 1 : prev - 1
                        );
                      } else if (e.key === "Enter" && highlightIndex >= 0) {
                        e.preventDefault();
                        const selectedProduct = suggestions[highlightIndex];
                        navigate(`/product/${selectedProduct._id}`);
                        setSearchQuery("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // small delay to allow click

                />
                <button className="btn">
                  <FaSearch />
                </button>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((item, index) => (
                      <li
                        key={item._id}
                        className={index === highlightIndex ? "highlighted" : ""}
                        onMouseDown={() => {
                          navigate(`/product/${item._id}`);
                          setSearchQuery("");
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                      >
                        {item.productname}
                      </li>

                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Cart Icon */}
            <div
              className="position-relative ms-3"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (user) {
                  navigate("/cart");
                } else {
                  navigate("/auth");
                }
              }}
            >
              <FaShoppingCart size={22} color="black" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span
              onClick={() => {
                if (user) {
                  navigate("/wishlist");
                } else {
                  navigate("/auth");
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <FaHeart
                size={22}
                color={wishlistItems.length > 0 ? "red" : "gray"}
                style={{ marginLeft: "16px" }}
              />
            </span>
            <img
              src="https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
              alt="User Icon"
              className="icon ms-3"
              onClick={() => {
                if (user) {
                  navigate("/profile");
                } else {
                  navigate("/auth");
                }
              }}
            />
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={handleToggleMenu}></div>
          <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="menu-header">
              <span className="close-btn" onClick={handleToggleMenu}>×</span>
            </div>
            <ul>
              <li onClick={() => handleNavigate("/")}>HOME</li>
              <li onClick={() => handleNavigate("/category")}>CATEGORY</li>
              <li onClick={() => handleNavigate("/products")}>PRODUCTS</li>
              <li onClick={() => handleNavigate("/about")}>ABOUT US</li>
              <li onClick={() => handleNavigate("/contact")}>CONTACT US</li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
