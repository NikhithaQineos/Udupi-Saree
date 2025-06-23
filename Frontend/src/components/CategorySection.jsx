import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CategorySection.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/getcategorylist`);
        setCategories(res.data.newgetcategory);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/category/${catId}`);
  };

  return (
    <section className="category-section">
      <div className="container">
        <h2 className="category-title">Category</h2>
        {loading ? (
          <p style={{ color: '#b78c6a', fontWeight: '500' }}>Loading categories...</p>
        ) : (
          <div>
            <div className="category-scroll-wrapper">
              <div className="category-grid">
                {categories.map((category, index) => (
                  <div key={index} className="category-card" onClick={() => handleCategoryClick(category._id)}
                    style={{ cursor: "pointer" }}>
                    <div className="category-image-wrapper">
                      <img
                        src={`${baseURL}/uploads/${category.catimage}`} // Ensure your backend provides a valid image path or full URL
                        alt={category.catname}
                        className="category-image"
                      />
                    </div>
                    <h3 className="category-name">{category.catname}</h3>
                    <p className="category-description">{category.catdescription}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
