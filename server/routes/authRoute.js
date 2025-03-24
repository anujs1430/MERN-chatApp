const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const secretKey = process.env.JWT_token || "your_jwt_screte";

// 🔹 Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingEmail = await userModel.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Save User
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
});
//
//
//
// 🔹 Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare Password
    const isPassMatch = await bcrypt.compare(password, user.password);

    if (!isPassMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ userID: user._id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
});
//
//
//
// 🔹 Get All Users
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const allUsers = await userModel.find({});

    res.status(200).json({
      success: true,
      message: "All Users",
      data: allUsers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
});
//
//
//
// ✅ Get Logged-in User Details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userID; // Extracted from token by authMiddleware

    const user = await userModel.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
