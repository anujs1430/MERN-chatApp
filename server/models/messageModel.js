const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // Links message to a chat
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tracks who sent the message
    },
    content: {
      type: String,
      required: true, // Message cannot be empty
    },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("messageModel", messageSchema);

module.exports = messageModel;
