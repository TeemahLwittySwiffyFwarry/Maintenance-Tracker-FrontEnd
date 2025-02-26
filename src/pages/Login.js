import React, { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";  // Import SweetAlert2
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Show loading Swal
    Swal.fire({
      title: "Logging in...",
      html: `
                            <div class="custom-loading">
                                <div class="spinner">
                                    <img src="/small_logo1.png" alt="Loading" />
                                </div>
                                <p>Please hold on while your request is being processed.</p>
                            </div>
                        `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    try {
      await authService.login(username, password);

      // Success notification
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        html: `Welcome <strong> ${username} </strong>. \n <p> Redirecting to dashboard... </p>`,
        text: "Redirecting to dashboard...",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/dashboard"), 2000); // Redirect after delay
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please check your credentials and try again.",
      });

      setError("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      {/* Glassmorphic Login Card */}
      <div className="bg-white/30 backdrop-blur-lg shadow-2xl p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-black drop-shadow-lg">Welcome Back</h2>
        <p className="text-center text-black text-sm mb-6">Sign in to continue</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-center text-red-500 bg-red-100 p-2 rounded-md animate-pulse">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-black font-medium">Username</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-white/20 text-black placeholder-gray-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
          <label className="block text-black font-medium">Password</label>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full p-3 rounded-lg bg-white/20 text-black placeholder-gray-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 pr-10"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* Eye Icon Button */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-10 transform -translate-y-1/2 text-white"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300 ease-in-out py-3 rounded-lg font-semibold shadow-md"
          >
            Login
          </button>
        </form>

        {/* Forgot Password & Signup */}
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            Forgot password?{" "}
            <a href="#" className="underline hover:text-gray-200 transition">
              Reset here
            </a>
          </p>
          <p className="text-white text-sm mt-2">
            Don't have an account?{" "}
            <a href="#" className="underline hover:text-gray-200 transition">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
