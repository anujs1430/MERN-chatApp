import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(""); // 🔹 Use `selectedChat` instead of `selectedUser`
  const [loggedInUser, setLoggedInUser] = useState(null); // ✅ Store logged-in user object

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
        />
        <ChatWindow selectedChat={selectedChat} loggedInUser={loggedInUser} />
      </div>
    </section>
  );
};

export default ChatPage;
