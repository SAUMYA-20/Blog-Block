"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext, { AuthContextType } from "../context/AuthContext";
import { Blocks } from "./Blocks";


const Navbar: React.FC = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { isAuthenticated, logout }: AuthContextType = context;

  return (
    <nav
      className="text-white py-4 px-4 sticky top-0 z-50 shadow-lg"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(120deg, #0f0e17 0%, #1a1b26 100%)",
      }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <Blocks width={26} height={26} stroke="#ffffff" /> {/* 🟣 animated icon */}
          <div>
            <Link
              to="/"
              className="text-white text-xl font-bold hover:text-blue-300 transition-colors"
            >
              Blog Block
            </Link>
            <p className="text-sm text-gray-300 mt-1">Write. Share. Inspire.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          <Link
            to="/all-blogs"
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            All Blogs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-blogs"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                My Blogs
              </Link>
              <Link
                to="/my-drafts"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Drafts
              </Link>
              <Link
                to="/create-blog"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                New Post
              </Link>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-red-300 font-medium transition-colors focus:outline-none"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
