// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { easeInOut, motion } from "framer-motion";
import api from "../utils/axios";
import { Blog } from "../types";
import icon from "../assets/brain.gif";


const iconVariants = {
  animate: {
    y: [0, -6, 0],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 3.2, repeat: Infinity, ease: easeInOut },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: easeInOut },
  }),
};

const Home: React.FC = () => {
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const res = await api.get<Blog[]>("/api/blogs");
        setRecentBlogs(res.data);
      } catch (err) {
        console.error("Failed to load recent blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBlogs();
  }, []);

  const curatedBlogs = recentBlogs.slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05010b] text-white">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(225, 187, 255, 0.4), transparent 45%),
          radial-gradient(circle at 80% 0%, rgba(141, 92, 246, 0.35), transparent 40%),
          radial-gradient(circle at 50% 80%, rgba(53, 12, 96, 0.7), transparent 60%)`,
        }}
      />

      <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-20">
        {/* Hero Section */}
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-purple-100"
          >
            <motion.span variants={iconVariants} animate="animate">
              ✦
            </motion.span>
            TechShare Bulletin
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className="mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Write-Ups Crafted by Developers for Developers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-base text-purple-100 sm:text-lg"
          >
            A write-up experience for sharing releases, technology architecture, and
            useful developer tips. Broadcast your ideas in a format that feels curated and
            crafted.
          </motion.p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-2xl bg-white/90 px-8 py-4 text-center text-base font-semibold text-purple-900 shadow-[0_10px_25px_rgba(255,255,255,0.25)] transition-transform duration-300 hover:-translate-y-1 sm:w-auto"
            >
              Join Techshare
            </Link>
            <Link
              to="/all-blogs"
              className="w-full rounded-2xl border border-white/20 px-8 py-4 text-center text-base font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto"
            >
              Read latest edition
            </Link>
          </div>
        </div>

        {/* Editorial Banner */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-2xl lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-purple-200">
              Editor's Desk
            </p>

            <h3 className="text-2xl font-semibold text-white">
              TechShare highlights engineering insights crafted by developers and builders.
            </h3>

            <p className="text-sm text-purple-100/90">
              Explore thoughtful write-ups on software development, project breakdowns,
              architectural decisions, and deep dives into real-world system design.
              Curated for engineers who love learning from how things are built.
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-purple-100/80">
              <span className="rounded-full border border-white/20 px-4 py-1">
                Engineering Notes
              </span>
              <span className="rounded-full border border-white/20 px-4 py-1">
                Architecture Deep Dives
              </span>
              <span className="rounded-full border border-white/20 px-4 py-1">
                Project Insights
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-5 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-lg overflow-hidden">
              <img
                src={icon}
                alt="icon"
                className="h-full w-full object-cover"
              />
            </div>



            <h4 className="text-lg font-semibold text-white">TechShare Library</h4>

            <p className="mt-2 text-sm text-purple-100/80">
              A growing collection of practical knowledge from developers across
              different tech stacks — distilled into clear explanations you can learn
              from and build on.
            </p>
          </div>
        </div>


        {/* Recent Blogs Newsletter Grid */}
        <div className="mx-auto mt-16 max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-16 text-center text-purple-100">
              Loading the latest edition...
            </div>
          ) : curatedBlogs.length > 0 ? (
            <>
              <div className="mb-8 flex flex-col gap-3 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-purple-200">
                  TechShare Weekly
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  Featured Write-Ups cards
                </h2>
                <p className="text-base text-purple-100/80">
                  Purposeful Shares
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {curatedBlogs.map((blog, index) => (
                  <motion.article
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={cardVariants}
                    key={blog._id}
                    className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white text-purple-950 shadow-[0_18px_50px_rgba(82,40,168,0.15)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#a855f7] via-[#fbcfe8] to-[#9333ea]" />
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="group flex flex-1 flex-col"
                    >
                      {blog.imageUrl ? (
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"
                            animate={{ opacity: [0.7, 0.4, 0.7] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 text-4xl font-bold text-purple-400">
                          {blog.title?.slice(0, 1) || "T"}
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-4 p-6">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">
                          <span>Issue #{String(index + 1).padStart(2, "0")}</span>
                          <motion.span
                            variants={iconVariants}
                            animate="animate"
                            className="text-purple-500"
                          >
                            ⟶
                          </motion.span>
                        </div>
                        <h3 className="text-xl font-semibold leading-tight text-purple-900">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-purple-500">
                          {new Date(blog.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="mt-auto">
                          <div className="h-px bg-gradient-to-r from-purple-200 via-purple-300 to-transparent" />
                          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-purple-400">
                            Read the briefing
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  to="/all-blogs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Browse the archive
                  <motion.span
                    variants={iconVariants}
                    animate="animate"
                    className="text-lg"
                  >
                    ↺
                  </motion.span>
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center text-purple-100">
              No editions yet. Publish your first TechShare briefing.
            </div>
          )}
        </div>

        {/* Footer Tagline */}
        <div className="mx-auto mt-24 max-w-3xl text-center text-sm text-purple-100/80">
          Every great thought deserves a headline. Send yours through
          TechShare.
        </div>
      </div>
    </div>
  );
};

export default Home;