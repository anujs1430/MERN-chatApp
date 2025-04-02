import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); //backend URL

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(""); // 🔹 Use `selectedChat` instead of `selectedUser`
  const [loggedInUser, setLoggedInUser] = useState(null); // ✅ Store logged-in user object
  const [onlineUsers, setOnlineUsers] = useState([]);

  const navigate = useNavigate();

  const allUserAPI = "http://localhost:8000/api/user/all";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, redirecting to login...");
        navigate("/");
        return;
      }

      const response = await axios.get(allUserAPI, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);

      toast.error("Unauthorized! Please log in again.");

      localStorage.removeItem("token");
      navigate("/");
    }
  };

  // 🔹 Fetch Logged-in User
  const fetchLoggedInUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await axios.get("http://localhost:8000/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoggedInUser(response.data.user); // ✅ Save logged-in user object
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (userId) {
      console.log(`🔗 Sending userOnline event for ${userId}`); // Debugging log
      socket.emit("userOnline", userId); // ✅ Notify backend when user logs in
    }

    socket.on("updateOnlineUsers", (users) => {
      console.log("🟢 Updated Online Users:", users); // Debugging log
      setOnlineUsers(users);
    });

    return () => {
      socket.off("updateOnlineUsers");
    };
  }, []);

  useEffect(() => {
    // console.log("loggedInUser==>", loggedInUser);
    fetchUsers();
    fetchLoggedInUser();
  }, []);

  return (
    <section className="main-container">
      <div className="chat-container">
        <ChatSidebar
          users={users}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          loggedInUser={loggedInUser}
          onlineUsers={onlineUsers}
        />
        <ChatWindow
          selectedChat={selectedChat}
          loggedInUser={loggedInUser}
          onlineUsers={onlineUsers}
        />
      </div>
    </section>
  );
};

export default ChatPage;
