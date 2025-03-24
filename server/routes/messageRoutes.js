const express = require("express");
const chatModel = require("../models/chatModel");
const messageModel = require("../models/messageModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.userID; // From token

    const message = await messageModel.create({
      chat: chatId,
      sender: senderId,
      content,
    });

    // Update last message in chat
    await chatModel.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(200).json({
      success: true,
      message,
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
// 🔹 Fetch Messages for a Chat
router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    // console.log("Received request for messages. Chat ID:", chatId); // ✅ Debugging

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      console.log("Chat not found in DB for ID:", chatId); // ❌ Debugging
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .populate("sender", "name email _id");

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
});

module.exports = router;
