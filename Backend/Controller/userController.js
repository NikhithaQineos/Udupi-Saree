import { User } from "../Model/userModel.js";
import { sendResetCodeEmail } from "../utils/mailSender.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    // Basic validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already registered" });
    }
    // Create new user
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ message: "Error registering user", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Check password (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(200).json({message: "Login successful",user});
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

export const getUser =   async (req, res) => {
  try {
    const users = await User.find().select("-password -__v"); // Find all users in the database exclude password and __v fields
    res.status(200).json({ message: "Users fetched successfully",users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user){
        return res.status(404).json({ message: "User not found" });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    // Send email
    await sendResetCodeEmail(email, resetCode);
    res.status(200).json({ message: "Reset code sent to your email" });
  } catch (err) {
    res.status(400).json({ message: "Error sending reset code", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    // Basic validation
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Find user
    const user = await User.findOne({ email, resetCode });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset code or email" });
    }
    // Check if code expired
    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }
    // Update password and clear reset fields
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Error resetting password", error: err.message });
  }
};