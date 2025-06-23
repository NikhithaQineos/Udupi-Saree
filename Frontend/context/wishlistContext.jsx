import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const baseurl = import.meta.env.VITE_API_BASE_URL;

  const fetchWishlist = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${baseurl}/api/getwishlist/${user._id}`);
      setWishlistItems(res.data.wishlist || []);
    } catch (err) {
      console.error("Error fetching wishlist", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?._id]);

  return (
    <WishlistContext.Provider value={{ wishlistItems, setWishlistItems, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};