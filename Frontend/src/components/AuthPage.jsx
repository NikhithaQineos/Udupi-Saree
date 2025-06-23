import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AuthPage.css";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | register | forgot | reset
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    newPassword: "",
    resetCode: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (pwd) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(pwd);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Field-level validation
    let errorMsg = "";

    if (name === "email" && value && !isValidEmail(value)) {
      errorMsg = "Invalid email format";
    }
    if ((name === "password" || name === "newPassword") && value && !isValidPassword(value)) {
      errorMsg = "Min 6 chars with letter, number & special char";
    }
    if (name === "phone" && value && !isValidPhone(value)) {
      errorMsg = "Phone must be 10 digits";
    }
    if ((name === "name" || name === "resetCode") && value.trim() === "") {
      errorMsg = "This field is required";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }
    if (Object.values(errors).some((msg) => msg)) {
      alert("Please correct the errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${baseurl}/api/registration`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      alert("Registration successful. Please log in.");
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please enter email and password.");
      return;
    }
    if (Object.values(errors).some((msg) => msg)) {
      alert("Please correct the errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${baseurl}/api/login`, {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || errors.email) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${baseurl}/api/forgot`, { email: formData.email });
      alert("Reset code sent to your email.");
      setMode("reset");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email || !formData.resetCode || !formData.newPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (Object.values(errors).some((msg) => msg)) {
      alert("Please correct the errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${baseurl}/api/reset`, {
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword,
      });
      alert("Password reset successful. You can now log in.");
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>
        {mode === "login"
          ? "Login"
          : mode === "register"
          ? "Register"
          : mode === "forgot"
          ? "Forgot Password"
          : "Reset Password"}
      </h2>

      {(mode === "register" || mode === "login") && (
        <>
          {mode === "register" && (
            <>
              <div className="input-error-wrap">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <span className="error-msg-inline">{errors.name}</span>}
              </div>

              <div className="input-error-wrap">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span className="error-msg-inline">{errors.phone}</span>}
              </div>
            </>
          )}

          <div className="input-error-wrap">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error-msg-inline">{errors.email}</span>}
          </div>

          <div className="input-error-wrap password-input">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <span onClick={togglePasswordVisibility} className="toggle-icon">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <span className="error-msg-inline">{errors.password}</span>}
          </div>

          <button
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>

          {mode === "login" ? (
            <p onClick={() => setMode("forgot")}>Forgot Password?</p>
          ) : (
            <p onClick={() => setMode("login")}>Already have an account? Login</p>
          )}

          {mode === "login" && (
            <p onClick={() => setMode("register")}>Don't have an account? Register</p>
          )}
        </>
      )}

      {mode === "forgot" && (
        <>
          <div className="input-error-wrap">
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error-msg-inline">{errors.email}</span>}
          </div>

          <button onClick={handleForgotPassword} disabled={loading}>
            {loading ? "Sending code..." : "Send Reset Code"}
          </button>
          <p onClick={() => setMode("login")}>Back to Login</p>
        </>
      )}

      {mode === "reset" && (
        <>
          <div className="input-error-wrap">
            <input
              type="text"
              name="resetCode"
              placeholder="Reset Code"
              value={formData.resetCode}
              onChange={handleInputChange}
            />
            {errors.resetCode && <span className="error-msg-inline">{errors.resetCode}</span>}
          </div>

          <div className="input-error-wrap password-input">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleInputChange}
            />
            <span onClick={togglePasswordVisibility} className="toggle-icon">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.newPassword && <span className="error-msg-inline">{errors.newPassword}</span>}
          </div>

          <button onClick={handleResetPassword} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <p onClick={() => setMode("login")}>Back to Login</p>
        </>
      )}
    </div>
  );
};

export default AuthPage;
