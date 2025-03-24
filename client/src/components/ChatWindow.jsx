import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import noChat from "/images/no-chat1.webp";
import { io } from "socket.io-client";
import { IoIosSend } from "react-icons/io";
import { FaArrowAltCircleDown } from "react-icons/fa";

const socket = io("http://localhost:8000"); //✅ Connect to backend socket

const ChatWindow = ({ selectedChat, loggedInUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const lastMessageRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Ensure `selectedChat` is not null before finding `otherUser`
  const otherUser = selectedChat?.users?.find(
    (user) => user?._id !== loggedInUser?._id
  );

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !selectedChat._id || !loggedInUser) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/message/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(response.data.messages); // ✅ Store messages in state
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();

    if (selectedChat) {
      socket.emit("joinChat", selectedChat._id); // ✅ Join chat room
    }

    socket.on("receiveMessage", (newMsg) => {
      // ✅ Ensure the message updates even if the receiver is not in the chat yet
      if (!selectedChat || newMsg.chat !== selectedChat._id) return;

      setMessages((prevMessage) => [...prevMessage, newMsg]); // ✅ Update state in real-time
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedChat, loggedInUser]); // ✅ Runs when `selectedChat` changes

  useEffect(() => {
    // ✅ Scroll to bottom when new message arrives
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // ✅ Scroll to bottom when select user to chat
    if (selectedChat && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100); // ✅ Small delay ensures messages are loaded before scrolling
    }
  }, [selectedChat, messages]); // ✅ Runs when chat or messages update

  // 🔹 Handle Sending a Message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedChat) return; // ✅ Prevent empty messages

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/message",
        { chatId: selectedChat._id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sentMessage = response.data.message;
      // setMessages([...messages, sentMessage]); // ✅ Add new message to state
      setNewMessage(""); // ✅ Clear input field

      socket.emit("sendMessage", sentMessage); // ✅ Send message via WebSocket
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-window">
      {!selectedChat || !loggedInUser ? (
        <img src={noChat} alt="" className="w-50 m-auto" /> // ✅ Show loading state inside JSX instead of returning early
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
              </span>
            </div>
          </div>

          <div className="chat-body position-relative">
            {messages.map((msg, index) => {
              return (
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
              );
            })}

            <FaArrowAltCircleDown
              onClick={() =>
                messagesEndRef.current.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="scroll-down-btn"
            />

            {/* ✅ This empty div ensures scrolling to the bottom */}
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
