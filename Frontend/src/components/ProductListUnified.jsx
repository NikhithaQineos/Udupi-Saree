import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./ProductListUnified.css";
import { CartContext } from "../../context/cartContext";
import { useContext } from "react";
import { WishlistContext } from "../../context/wishlistContext";

const ProductListUnified = () => {
  const navigate = useNavigate();
  const { catId } = useParams();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [availableColors, setAvailableColors] = useState([]);
  const [availableFabrics, setAvailableFabrics] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const { cartItems, setCartItems } = useContext(CartContext);
  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = catId
          ? `${baseURL}/api/getproductbycatid/${catId}`
          : `${baseURL}/api/getproduct`;
        const res = await axios.get(url);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [catId]);



  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product._id);

    const discount = product.offer?.offerpercentage || 0;
    const originalPrice = Number(product.productprice);
    const discountedPrice = discount
      ? Number(originalPrice - (originalPrice * discount) / 100)
      : originalPrice;

    const newItem = {
      id: product._id,
      name: product.productname,
      image: product.productimages?.[0]
        ? `${baseURL}/uploads/${product.productimages[0]}`
        : "/default-image.png",
      price: discountedPrice,
      originalPrice: originalPrice,
      quantity: 1,
      productgst: product.productgst,
      offer: product.offer || null,
      maxQty: product.productquantity,
    };

    if (existingItem) {
      const updatedCart = cartItems.map(item =>
        item.id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, newItem]);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchWishlist();
    }
  }, [user?._id]);

  const toggleWishlist = async (productId) => {
    if (!user?._id) {
      alert("Please login to manage your wishlist.");
      return;
    }
    try {
      await axios.post(`${baseURL}/api/addremove`, {
        userId: user._id,
        productId,
      });
      await fetchWishlist();
    } catch (err) {
      console.error("Error updating wishlist", err);
    }
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/getfilters`);
        setAvailableColors(res.data.colors);
        setAvailableFabrics(res.data.fabrics);
      } catch (err) {
        console.error("Error fetching filter options", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = catId
          ? `${baseURL}/api/getproductbycatid/${catId}`
          : `${baseURL}/api/getproduct`;

        // Add filter query params
        const params = new URLSearchParams();
        if (selectedColor) params.append("color", selectedColor);
        if (selectedFabric) params.append("fabric", selectedFabric);
        if (!catId) url = `${baseURL}/api/getfilteredproducts?${params.toString()}`;

        const res = await axios.get(url);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [catId, selectedColor, selectedFabric]);

  return (
    <section className="product-section">
      <h2 className="product-heading">
        {catId ? "Products in Category" : "All Products"}
      </h2>

      {/* Always render filters if on /api/getproduct (not homepage, not byCatId) */}
      {!isHomePage && !catId && (
        <div className="filter-bar">
          <label>
            Color:
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              <option value="">All</option>
              {availableColors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </label>

          <label>
            Fabric:
            <select value={selectedFabric} onChange={(e) => setSelectedFabric(e.target.value)}>
              <option value="">All</option>
              {availableFabrics.map((fabric) => (
                <option key={fabric} value={fabric}>{fabric}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : products.length === 0 ? (
        <p className="loading-text">No products found.</p>
      ) : (
        <div className={`product-grid-wrapper ${isHomePage ? "scrollable" : ""}`}>
          <div className="product-grid">
            {products.map((product) => {
              const discount = product.offer?.offerpercentage || 0;
              const originalPrice = Number(product.productprice);
              const discountedPrice = originalPrice - (originalPrice * discount) / 100;
              const isWishlisted = product && wishlistItems.some(item => item._id === product._id);
              const isLowStock = product.productquantity < 20;
              const existingItem = cartItems.find(item => item.id === product._id);
              const isMaxQuantityReached = existingItem && existingItem.quantity >= product.productquantity;
              const isOutOfStock = product.productquantity === 0;

              return (
                <div
                  key={product._id}
                  className="product-card-wrapper"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="product-card">
                    {isLowStock && <span className="low-stock-tag">Low Stock</span>}

                    <img
                      src={
                        product.productimages.length > 0
                          ? `${baseURL}/uploads/${product.productimages[0]}`
                          : "/default-image.png"
                      }
                      alt={product.productname}
                      className="product-image"
                    />
                    <h3 className="product-name">{product.productname}</h3>
                    <p className="product-price">
                      {discount ? (
                        <>
                          <span className="discounted-price">₹{discountedPrice.toFixed(2)}</span>
                          <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="discounted-price">₹{originalPrice.toFixed(2)}</span>
                      )}
                    </p>
                    <div className="product-actions">
                      <button
                        className="add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={isOutOfStock || isMaxQuantityReached}
                        style={{
                          opacity: isOutOfStock || isMaxQuantityReached ? 0.5 : 1,
                          cursor: isOutOfStock || isMaxQuantityReached ? "not-allowed" : "pointer",
                        }}
                      >
                        🛒 {isOutOfStock || isMaxQuantityReached ? "Out of Stock" : "Add"}
                      </button>

                      <button
                        className="wishlist-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                      >
                        {isWishlisted ? (
                          <FaHeart color="red" size={16} />
                        ) : (
                          <FaRegHeart color="gray" size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductListUnified;