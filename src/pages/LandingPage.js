import React from "react";
import {Link} from "react-router-dom"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-green-100 flex flex-col relative">
      {/* Logo Section */}
      <div className="absolute top-4 left-4  p-2 rounded-md z-10">
        <img
          src="/lakowe.png" // Replace with your logo image path
          alt="Company Logo"
          className="h-32 w-auto"
        />
      </div>

      {/* Hero Section */}
      <header className="relative w-full h-screen flex items-center justify-center ">
        <img
          src="/lakowe2.jpg" // Replace with a better image URL
          alt="Landing background"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            Welcome to The Agronomy Department
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow-md">
            A place where innovation meets simplicity.
          </p>
          <Link>
          <button className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 transition rounded-full text-white text-lg font-semibold">
            Get Started
          </button></Link>
        </div>
      </header>

      {/* Login Button at Bottom Right */}
      <Link to="/login">
      <button className="absolute bottom-6 right-6 px-6 py-3 bg-green-600 hover:bg-green-700 transition rounded-full text-white text-lg font-semibold shadow-lg">
        Login
      </button></Link>
    </div>
  );
};

export default LandingPage;
