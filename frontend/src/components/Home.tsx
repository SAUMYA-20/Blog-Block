// src/components/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Blog } from '../types';

const Home: React.FC = () => {
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const res = await api.get<Blog[]>('/api/blogs?limit=3');
        setRecentBlogs(res.data);
      } catch (err) {
        console.error('Failed to load recent blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBlogs();
  }, []);

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
        }}
      />

      <div className="relative z-10 py-12 px-4 sm:px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6">
            Share Your Ideas with the World
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Write, publish, and connect with readers. No fluff — just your voice, beautifully presented.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/all-blogs"
              className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Read Recent Posts
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300"
            >
              Start Writing →
            </Link>
          </div>
        </div>

        {/* Stats Bar (Subtle) */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex justify-center gap-8 text-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">100+</div>
              <div className="text-sm">Blogs Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">50+</div>
              <div className="text-sm">Active Writers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">∞</div>
              <div className="text-sm">Ideas Shared</div>
            </div>
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-600">Loading recent stories...</div>
          ) : recentBlogs.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Latest from the Community</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentBlogs.map(blog => (
                  <Link
                    key={blog._id}
                    to={`/blogs/${blog._id}`}
                    className="block group"
                  >
                    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                      {blog.imageUrl ? (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(blog.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/all-blogs"
                  className="inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all posts →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              No blogs published yet. Be the first!
            </div>
          )}
        </div>

        {/* Footer Tagline */}
        <div className="max-w-2xl mx-auto mt-20 text-center text-gray-600">
          <p>
            Every great thought deserves an audience. <br className="sm:hidden" />
            Start yours today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;