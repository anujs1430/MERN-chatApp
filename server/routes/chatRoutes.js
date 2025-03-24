const express = require("express");
const chatModel = require("../models/chatModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Create a Chat (Start a Conversation)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body; // User to chat with
    const loggedInUserId = req.user.userID; // From token

    // ✅ Check if chat already exists
    let chat = await chatModel.findOne({
      users: { $all: [loggedInUserId, userId] },
    });

    if (!chat) {
      // ✅ If chat doesn't exist, create a new one
      chat = await chatModel.create({ users: [loggedInUserId, userId] });
    }

    // ✅ Populate user details before sending response
    chat = await chatModel.findById(chat._id).populate("users", "name email");

    res.status(200).json({
      success: true,
      chat, // ✅ Send the chat object
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
});

// 🔹 Get All Chats for Logged-In User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const loggedInUserId = req.user.userID;

    const chats = await chatModel
      .find({ users: loggedInUserId })
      .populate("users", "name email"); // ✅ Ensure user details are populated

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
