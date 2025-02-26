import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu } from "lucide-react";
import authService from "../services/authService"; // Your JWT Auth Service

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
    );

    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await axios.get("https://agronomy-dept-llgc.teemah.com.ng/api/user/details", {
        headers: { Authorization: `Bearer ${currentUser.access}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-green-700 text-white py-2 px-6 flex justify-between items-center shadow-md z-40 ">
      <div className="flex items-center space-x-2">
        <img src="/lakowelogowhite.png" alt="Logo" className="h-12 w-auto" />
        <span className="text-xl font-semibold">Maintenance Tracker</span>
      </div>

      {/* Right Side */}
      <div className="hidden md:flex items-center space-x-6">
        
        {user && (
          <div className="flex items-center space-x-3">
            <img
              src={user.profile_picture || "/default-profile.jpg"}
              alt="Profile"
              className="h-12 w-12 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-sm font-semibold">{greeting}, {user.username}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-white focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Menu size={28} />
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && user && (
        <div className="absolute top-16 right-6 bg-green-800 text-white p-4 rounded-lg shadow-lg w-64 md:hidden">
          <p className="text-sm font-semibold mb-2">{greeting}, {user.username}</p>
          <p className="text-sm">Welcome to Maintenance Analysis for Agronomy Department</p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
