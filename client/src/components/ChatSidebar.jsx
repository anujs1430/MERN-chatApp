import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdSearch } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { ImProfile } from "react-icons/im";

const ChatSidebar = ({ selectedChat, setSelectedChat, loggedInUser }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Handle User Click (Create Chat)
  const handleUserClick = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/chat",
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.chat) {
        setSelectedChat(response.data.chat); // ✅ Ensure selectedChat is updated
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // 🔹 Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const profileOption = () => {
    setToggle(!toggle);
  };

  const options = [
    {
      name: "Profile",
      icon: <ImProfile />,
      action: () => console.log("Profile"),
    },
    {
      name: "LogOut",
      icon: <TbLogout />,
      action: () => localStorage.clear(),
    },
  ];

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="d-flex justify-content-between align-items-center position-relative">
          <h3>Chats</h3>
          <FaUserCircle
            onClick={profileOption}
            className="profile-icon h3"
            title="Profile & More"
          />
          <div className={`profileOptionsList ${!toggle ? "d-none" : ""}`}>
            <ul>
              {options.map((item, index) => (
                <li key={index} onClick={item.action}>
                  {item.icon} &nbsp;
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="search-box mt-2">
          <IoMdSearch />
          <input
            type="text"
            placeholder="Search users..."
            className="form-control search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="user-list">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`user-item ${
              selectedChat &&
              selectedChat.users.find((u) => u._id !== loggedInUser._id)
                ?._id === user._id
                ? "active"
                : ""
            }`}
            onClick={() => handleUserClick(user._id)} // ✅ Create chat when clicking user
          >
            <span className="user-avatar">{user.name.charAt(0)}</span>
            <span className="user-name text-capitalize">
              {loggedInUser?._id === user._id ? "You" : user.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
