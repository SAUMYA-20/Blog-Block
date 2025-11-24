"use client";

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext, { AuthContextType } from "../context/AuthContext";
import { Blocks } from "./Blocks";

const navVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0 },
};

const Navbar: React.FC = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { isAuthenticated, logout }: AuthContextType = context;

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 px-4 py-4 text-white shadow-[0_10px_30px_rgba(88,28,135,0.35)] backdrop-blur-3xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(82,40,168,0.9), rgba(163,120,255,0.85))",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo + Brand */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3"
        >
          <Blocks width={28} height={28} stroke="#fde1ff" />
          <div>
            <Link
              to="/"
              className="text-white text-2xl font-semibold tracking-tight hover:text-fuchsia-100 transition-colors"
            >
              TechShare
            </Link>
            <motion.p
              className="text-sm text-purple-100/80"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Daily creator briefing
            </motion.p>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-sm font-medium">
          <Link
            to="/all-blogs"
            className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-white hover:bg-white/10"
          >
            Editions
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-blogs"
                className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                My Desk
              </Link>
              <Link
                to="/my-drafts"
                className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Draft Box
              </Link>
              <Link
                to="/create-blog"
                className="rounded-full bg-white/90 px-5 py-2 text-purple-800 shadow-lg shadow-purple-900/30 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Publish
              </Link>
              <button
                onClick={logout}
                className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-transparent hover:bg-red-400/20 hover:text-white"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Join
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-white/90 transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
