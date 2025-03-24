const { default: mongoose, mongo } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
);

// ✅ Prevent Overwriting the Model
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
