import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./wishlist.css";
import { WishlistContext } from "../../context/wishlistContext";
import { useContext } from "react";
import { CartContext } from "../../context/cartContext";

const WishlistPage = ({ addToCart }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const { fetchWishlist } = useContext(WishlistContext);
  const { cartItems, setCartItems } = useContext(CartContext);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (!user?._id) return;
        const res = await axios.get(`${baseurl}/api/getwishlist/${user._id}`);
        const formatted = res.data.wishlist.map(item => ({
          _id: item._id,
          productname: item.productname,
          image: item.productimages[0]
            ? `${baseurl}/uploads/${item.productimages[0]}`
            : "/default-image.png",
          productprice: item.productprice,
          offer: item.offer || {},
          productgst: item.productgst || 0,
        }));
        setWishlist(formatted);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      }
    };
    loadWishlist(); // now no conflict with context.fetchWishlist
  }, [user?._id]);

  const removeFromWishlist = async (id) => {
    try {
      await axios.post(`${baseurl}/api/addremove`, {
        userId: user._id,
        productId: id
      });
      setWishlist(wishlist.filter(item => item._id !== id));
      fetchWishlist(); // <- from context

    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product._id);

    const discount = Number(product.offer?.offerpercentage || 0);
    const originalPrice = Number(product.productprice);
    const discountedPrice = discount
      ? Number(originalPrice - (originalPrice * discount) / 100)
      : originalPrice;

    const newItem = {
      id: product._id,
      name: product.productname,
      image: product.image,
      price: discountedPrice,
      originalPrice: originalPrice,
      quantity: 1,
      productgst: product.productgst,
      offer: product.offer || null,
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
    removeFromWishlist(product._id);
  };

  if (!wishlist.length) {
    return (
      <div className="wishlist-empty">
        <h3>Your wishlist is empty</h3>
        <Link to="/" className="wishlist-home-link">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">My Wishlist</h2>
      <div className="wishlist-items">
        {wishlist.map((item) => (
          <div className="wishlist-card" key={item._id}>
            <img src={item.image} alt={item.productname} className="wishlist-img" />
            <div className="wishlist-details">
              <h5>{item.productname}</h5>
              <div className="price-line">
                <span className="discounted-price">
                  ₹{(item.productprice * (1 - (item.offer?.offerpercentage || 0) / 100)).toFixed(2)}
                </span>
                {item.offer?.offerpercentage ? (
                  <>
                    <span className="original-price">₹{item.productprice}</span>
                    <span className="discount">{item.offer.offerpercentage}% Off</span>
                  </>
                ) : null}
              </div>
              <div className="wishlist-actions">
                <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
                <button onClick={() => removeFromWishlist(item._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
