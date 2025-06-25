import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "./ProductDetails.css";
import { CartContext } from "../../context/cartContext";
import { WishlistContext } from "../../context/wishlistContext";


const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productOffer, setProductOffer] = useState(null);
  const [offers, setOffers] = useState([]);

  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user"));

  const { cartItems, setCartItems } = useContext(CartContext);
  const { wishlistItems, fetchWishlist } = useContext(WishlistContext);

  const isWishlisted = product && wishlistItems.some(item => item._id === product._id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${baseurl}/api/getproductbyid/${id}`);
        const fetchedProduct = res.data.products;
        setProduct(fetchedProduct);
        fetchOffer(fetchedProduct._id, fetchedProduct.cat_id);

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
        const wishlistIds = res.data.wishlist.map(item => item._id);
        setWishlist(wishlistIds);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    const fetchOffer = async (productId, categoryId) => {
      try {
        const res = await axios.get(`${baseurl}/api/list`);
        const allOffers = res.data.offers || [];

        setOffers(allOffers); // Store all offers for getOfferForProduct()

        const validOffers = allOffers.filter((offer) =>
          (offer.targetType === "product" && offer.targetIds.includes(productId)) ||
          (offer.targetType === "category" && offer.targetIds.includes(categoryId))
        );

        if (validOffers.length > 0) {
          setProductOffer(validOffers[0]); // still used for display
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchProduct();
    fetchWishlist();
  }, [id, user?._id]);

  const isLowStock = product?.productquantity < 20;
  const isOutOfStock = product?.productquantity === 0;
  const existingItem = cartItems.find(item => item.id === product?._id);
  const isMaxQuantityReached = existingItem && existingItem.quantity >= product?.productquantity;

  const getOfferForProduct = (product) => {
    return offers.find(offer =>
      (offer.targetType === "product" && offer.targetIds.includes(product._id)) ||
      (offer.targetType === "category" && offer.targetIds.includes(product.cat_id?.toString()))
    );
  };

  const handleAddToCart = () => {
    if (!user?._id) {
      alert("Please login to add items to the cart.");
      return;
    }

    const existingItem = cartItems.find(item => item.id === product._id);

    const offer = getOfferForProduct(product); // use consistent logic
    const originalPrice = Number(product.productprice);
    let discountedPrice = originalPrice;

    if (offer?.offerType === "percentage") {
      discountedPrice -= (originalPrice * offer.offerValue) / 100;
    } else if (offer?.offerType === "rupees") {
      discountedPrice -= offer.offerValue;
    }

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
      offer: offer || null,
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

      fetchWishlist();
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  const discountPercent = productOffer?.offerType === "percentage" ? productOffer.offerValue : 0;
  const discountRupees = productOffer?.offerType === "rupees" ? productOffer.offerValue : 0;

  const originalPrice = Number(product.productprice);
  let discountedPrice = originalPrice;

  if (discountPercent) {
    discountedPrice = originalPrice - (originalPrice * discountPercent) / 100;
  } else if (discountRupees) {
    discountedPrice = originalPrice - discountRupees;
  }

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail-left">
        <div className="thumbnail-column">
          {product.productimages?.map((img, index) => (
            <img
              key={index}
              src={`${baseurl}/uploads/${img}`}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${mainImage === `${baseurl}/uploads/${img}` ? "active-thumbnail" : ""
                }`}
              onClick={() => setMainImage(`${baseurl}/uploads/${img}`)}
            />
          ))}
        </div>
        <div className="main-image-container">
          {isLowStock && <span className="low-stock-badge">Low Stock</span>}
          <img src={mainImage} alt="Main Product" className="main-image" />
        </div>
      </div>

      <div className="product-detail-right">
        <div className="title-wishlist">
          <h2 className="product-title">{product.productname}</h2>
        </div>

        <p className="product-description">{product.productdescription}</p>

        <p className="product-price">
          {discountPercent > 0 || discountRupees > 0 ? (
            <>
              <span className="discounted-price">₹{discountedPrice.toFixed(2)}</span>
              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
              <span className="offer-percent">
                ({discountPercent > 0 ? `${discountPercent}% OFF` : `₹${discountRupees} OFF`})
              </span>
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
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxQuantityReached}
            style={{
              opacity: isOutOfStock || isMaxQuantityReached ? 0.5 : 1,
              cursor: isOutOfStock || isMaxQuantityReached ? "not-allowed" : "pointer",
            }}
          >
            🛒 {isOutOfStock ? "Out of Stock" : isMaxQuantityReached ? "Out of Stock" : "Add to Cart"}
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
