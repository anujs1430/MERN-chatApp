const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const authRoute = require("./routes/authRoute");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();

const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/user", authRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

let onlineUsers = {};

// ✅ Handle Socket.io Connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Receive and broadcast new messages
  socket.on("sendMessage", (messageData) => {
    io.to(messageData.chat).emit("receiveMessage", messageData);
  });

  // Listen for user login (send userId from frontend)
  socket.on("userOnline", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("updateOnlineUsers", Object.keys(onlineUsers));
  });

  //When user disconnects
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);

    // Remove user from online list
    let disconnectedUser = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );

    if (disconnectedUser) {
      delete onlineUsers[disconnectedUser];
      io.emit("updateOnlineUsers", Object.keys(onlineUsers)); // Send updated list
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
  connectDB();
});
