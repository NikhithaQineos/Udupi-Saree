import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import LocationMap from "./components/LocationMap";
import Footer from "./components/Footer";
import AuthPage from "./components/AuthPage";
import Cart from "./pages/Cart";
import PaymentPage from "./payments/PaymentPage";
import VideoSection from "./components/VideoSection";
import ProductDetails from "./pages/ProductDetails";
import WishlistPage from "./pages/wishlist";
import ProductListUnified from "./components/ProductListUnified";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function HomePage({ addToCart }) {
  return (
    <>
      <Hero />
      <CategorySection />
      <ProductListUnified addToCart={addToCart} />
      <AboutUs />
      <VideoSection />
      <ContactUs />
      <LocationMap />
      <Footer />
    </>
  );
}

function AppLayout({ addToCart, cartItems, setCartItems }) {
  const location = useLocation();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const hidenavbar = ["/auth"];
  const shownavbar = !hidenavbar.includes(location.pathname);

  const hideFooterRoutes = ["/auth", "/"];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);


  return (
    <>
      {shownavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage addToCart={addToCart} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/products" element={<ProductListUnified addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/category" element={<CategorySection />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/videos" element={<VideoSection />} />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/category/:catId" element={<ProductListUnified addToCart={addToCart} />} />
        <Route path="/wishlist" element={<WishlistPage addToCart={addToCart} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {shouldShowFooter && <Footer/>}
    </>
  );
}

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage when cartItems change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <Router>
      <AppLayout addToCart={addToCart} cartItems={cartItems} setCartItems={setCartItems} />
    </Router>
  );
}

export default App;

