const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References User collection
      },
    ],
    lastMesaage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // References Message collection
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model("chatModel", chatSchema);

module.exports = chatModel;
