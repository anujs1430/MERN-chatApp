import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdSearch } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { ImProfile } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ChatSidebar = ({
  selectedChat,
  setSelectedChat,
  loggedInUser,
  onlineUsers,
}) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [toggle, setToggle] = useState(false);

  const navigate = useNavigate();

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

  const openPopup = () => {
    let myModal = new bootstrap.Modal(
      document.getElementById("exampleModal"),
      {}
    );
    myModal.show();
  };

  const options = [
    {
      name: "Profile",
      icon: <ImProfile />,
      action: () => openPopup(),
    },
    {
      name: "LogOut",
      icon: <TbLogout />,
      action: () => {
        localStorage.clear(),
          toast.success(`${loggedInUser.name} Logged Out`),
          navigate("/");
      },
    },
  ];

  return (
    <>
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
                {loggedInUser?._id === user._id
                  ? `${loggedInUser?.name.split(" ", 1)} (You)`
                  : user.name}

                {onlineUsers.includes(user._id) && (
                  <span className="green-dot"></span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Hello👋, {loggedInUser?.name.split("", 4)}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setToggle(!toggle)}
              ></button>
            </div>
            <div className="modal-body">
              <table className="table table-bordered table-dark">
                <tbody>
                  <tr>
                    <th>UID:</th>
                    <td>{loggedInUser?._id}</td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>{loggedInUser?.email}</td>
                  </tr>
                  <tr>
                    <th>Name:</th>
                    <td>{loggedInUser?.name}</td>
                  </tr>
                  <tr>
                    <th>Created On:</th>
                    <td>{loggedInUser?.createdAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
