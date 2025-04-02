import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { RiProfileFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // ✅ Keep this for UI error handling

  const navigate = useNavigate();
  const registerAPI = "http://localhost:8000/api/user/register";

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formSubmitHandle = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(registerAPI, formData);

      toast.success(response?.data?.message);

      setFormData({ name: "", email: "", password: "" });

      navigate("/");
    } catch (err) {
      console.error("Registration Error:", err); // ✅ Fix: Use `err`, not `error`

      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);

      toast.error(errorMessage);
    }
  };

  return (
    <section className="registration-card">
      <div className="col-lg-4 m-auto mt-5">
        <div className="card">
          <div className="card-body">
            <div className="text-center">
              <h4>Register</h4>
            </div>
            <form onSubmit={formSubmitHandle}>
              <div className="mb-3 position-relative">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <RiProfileFill className="name" />
                <input
                  value={formData.name}
                  onChange={inputChange}
                  type="text"
                  className="form-control"
                  name="name"
                  id="name"
                  placeholder="Enter your Full Name..."
                  required
                />
              </div>
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
                <button type="submit" className="btn btn-dark">
                  Submit
                </button>
              </div>
              <p className="text-end mt-4">
                <small>
                  Already have an account? <Link to={"/"}>Login here</Link>
                </small>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
