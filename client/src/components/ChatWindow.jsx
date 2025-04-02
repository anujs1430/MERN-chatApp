import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import noChat from "/images/no-chat1.webp";
import { io } from "socket.io-client";
import { IoIosSend } from "react-icons/io";
import { FaArrowAltCircleDown } from "react-icons/fa";

const socket = io("http://localhost:8000"); // ✅ Connect to backend socket

const ChatWindow = ({ selectedChat, loggedInUser, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(true);

  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null); // ✅ Reference to the chat body

  // ✅ Find the other user in the chat
  const otherUser = selectedChat?.users?.find(
    (user) => user?._id !== loggedInUser?._id
  );

  // 🔹 Fetch messages when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !selectedChat._id || !loggedInUser) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/message/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();

    if (selectedChat) {
      socket.emit("joinChat", selectedChat._id);
    }

    socket.on("receiveMessage", (newMsg) => {
      if (!selectedChat || newMsg.chat !== selectedChat._id) return;
      setMessages((prevMessage) => [...prevMessage, newMsg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedChat, loggedInUser]);

  // 🔹 Scroll to bottom on new message
  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    if (selectedChat && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedChat, messages]);

  // 🔹 Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedChat) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/message",
        { chatId: selectedChat._id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sentMessage = response.data.message;
      setNewMessage("");

      socket.emit("sendMessage", sentMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 🔹 Scroll to Bottom Function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Detect Scroll Movement
  const handleScroll = () => {
    if (chatBodyRef.current) {
      const scrollTop = chatBodyRef.current.scrollTop;
      const scrollHeight = chatBodyRef.current.scrollHeight;
      const clientHeight = chatBodyRef.current.clientHeight;

      // Show the button if the user has scrolled up at least 100px
      const isScrolledUp = scrollHeight - clientHeight - scrollTop > 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // 🔹 Attach Scroll Event Listener
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener("scroll", handleScroll);
      handleScroll(); // Run once on mount
    }

    return () => {
      if (chatBody) {
        chatBody.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="chat-window">
      {!selectedChat || !loggedInUser ? (
        <img src={noChat} alt="" className="w-50 m-auto" />
      ) : (
        <>
          <div className="chat-header">
            <div className="d-flex align-items-center">
              <span className="user-avatar">{otherUser?.name?.charAt(0)}</span>
              <span className="ms-2 text-capitalize">
                {otherUser
                  ? otherUser.name
                  : messages[0]?.sender?._id === loggedInUser._id
                  ? "You"
                  : "User Not Found"}

                {onlineUsers.includes(otherUser?._id) && (
                  <small style={{ fontSize: "12px" }}>&nbsp; (Online)</small>
                )}
              </span>
            </div>
          </div>

          {/* ✅ Scrollable Chat Body */}
          <div className="chat-body position-relative" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : null} // ✅ Attach ref to last message
                className={`chat-message ${
                  (msg.sender._id || msg.sender) === loggedInUser._id
                    ? "me"
                    : "other"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* ✅ Scroll Down Button (Visible Only When Scrolled Up 100px) */}
            {showScrollButton && (
              <FaArrowAltCircleDown
                onClick={scrollToBottom}
                className="scroll-down-btn"
              />
            )}

            {/* ✅ Invisible Element to Scroll to Bottom */}
            <div ref={messagesEndRef}></div>
          </div>

          <div>
            <form className="chat-footer" onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-control"
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>
                <IoIosSend />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
