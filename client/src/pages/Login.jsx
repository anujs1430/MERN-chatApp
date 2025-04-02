import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const loginAPI = "http://localhost:8000/api/user/login";

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formSubmitHandle = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(loginAPI, formData);

      localStorage.setItem("token", response?.data?.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(`${response?.data?.user.name}, ${response?.data?.message}`);

      setFormData({
        email: "",
        password: "",
      });

      navigate("/chats");

      console.log(response);
    } catch (error) {
      console.error("error=>", error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="login-card">
      <div className="col-lg-4 m-auto mt-5">
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <h4>Login</h4>
            </div>
            <form className="loginForm" onSubmit={formSubmitHandle}>
              <div className="mb-3 position-relative">
                <label htmlFor="email" className="form-label">
                  User Name
                </label>
                <FaUser className="user" />
                <input
                  value={formData.email}
                  onChange={inputChange}
                  type="email"
                  className="form-control"
                  name="email"
                  id="email"
                  placeholder="Enter your User Name..."
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <RiLockPasswordFill className="password" />
                <input
                  value={formData.password}
                  onChange={inputChange}
                  type="password"
                  className="form-control"
                  name="password"
                  id="password"
                  placeholder="Enter your Password..."
                  required
                />
              </div>
              <div className="text-center">
                <button className="btn btn-dark">Submit</button>
              </div>
            </form>
            <p className="text-end mt-4">
              <small>
                Don't have account <Link to={"/register"}>Register here</Link>
              </small>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
