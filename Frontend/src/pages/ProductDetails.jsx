import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./ProductDetails.css";
import { useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { WishlistContext } from "../../context/wishlistContext";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [wishlist, setWishlist] = useState([]);


  const [loading, setLoading] = useState(true);
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  const { cartItems, setCartItems } = useContext(CartContext);
  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);

  // const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const isWishlisted = product && wishlistItems.some(item => item._id === product._id);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${baseurl}/api/getproductbyid/${id}`);
        const fetchedProduct = res.data.products;
        setProduct(fetchedProduct);

        if (fetchedProduct.productimages?.length > 0) {
          setMainImage(`${baseurl}/uploads/${fetchedProduct.productimages[0]}`);
        } else {
          setMainImage("/default-image.png");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`${baseurl}/api/getwishlist/${user._id}`);
        const wishlistIds = res.data.wishlist.map((item) => item._id);
        setWishlist(wishlistIds);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchProduct();
    fetchWishlist();
  }, [id, user?._id]);

  const handleAddToCart = () => {
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
        ? `${baseurl}/uploads/${product.productimages[0]}`
        : "/default-image.png",
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
  };

  const toggleWishlist = async () => {
    if (!user?._id) {
      alert("Please login to manage your wishlist.");
      return;
    }

    try {
      await axios.post(`${baseurl}/api/addremove`, {
        userId: user._id,
        productId: product._id,
      });

      // Re-fetch to update global state
      fetchWishlist();
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };


  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  const discount = product.offer?.offerpercentage || 0;
  const originalPrice = Number(product.productprice);
  const discountedPrice = discount
    ? Number(originalPrice - (originalPrice * discount) / 100)
    : originalPrice;

  // const isWishlisted = wishlist.includes(product._id);

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-left">
        <div className="thumbnail-column">
          {product.productimages?.map((img, index) => (
            <img
              key={index}
              src={`${baseurl}/uploads/${img}`}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${mainImage === `${baseurl}/uploads/${img}` ? "active-thumbnail" : ""}`}
              onClick={() => setMainImage(`${baseurl}/uploads/${img}`)}
            />
          ))}
        </div>
        <div className="main-image-container">
          <img src={mainImage} alt="Main Product" className="main-image" />
        </div>
      </div>

      <div className="product-detail-right">
        <div className="title-wishlist">
          <h2 className="product-title">{product.productname}</h2>
        </div>

        <p className="product-description">{product.productdescription}</p>

        <p className="product-price">
          {discount > 0 ? (
            <>
              <span className="discounted-price">₹{discountedPrice.toFixed(2)}</span>
              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
              <span className="offer-percent">({discount}% OFF)</span>
            </>
          ) : (
            <span className="discounted-price">₹{originalPrice.toFixed(2)}</span>
          )}
        </p>
        <p className="product-color">
          <strong>Color:</strong> {product.productcolor || "N/A"}
        </p>

        <p className="product-fabric">
          <strong>Fabric:</strong> {product.productfabric || "N/A"}
        </p>

        <p className="gst">
          <strong>GST:</strong> {product.productgst}%
        </p>
        <div className="buttons">
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
          <button className="wishlist-icon-button" onClick={toggleWishlist}>
            {isWishlisted ? (
              <FaHeart color="red" size={20} />
            ) : (
              <FaRegHeart color="gray" size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
