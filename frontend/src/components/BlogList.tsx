import React, { useEffect, useState, useContext } from 'react';
import { easeOut, motion } from 'framer-motion';
import api from '../utils/axios';
import { Link, useLocation } from 'react-router-dom';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';

const getInitials = (title: string): string => {
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();
};

// Format relative time (e.g., "2 mins ago")
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
};

// Simple toast state
const useToast = () => {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  return { toast, showToast };
};

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 text-white backdrop-blur-2xl animate-pulse">
    <div className="h-4 w-24 rounded-full bg-white/20" />
    <div className="mt-6 h-6 w-3/4 rounded-full bg-white/25" />
    <div className="mt-4 space-y-2">
      <div className="h-3 rounded-full bg-white/15" />
      <div className="h-3 w-2/3 rounded-full bg-white/15" />
    </div>
  </div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.45, ease: easeOut },
  }),
};

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();
  const context = useContext(AuthContext);
  const { toast, showToast } = useToast();

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { user }: AuthContextType = context;

  useEffect(() => {
    const fetchBlogs = async (): Promise<void> => {
      try {
        let response;
        const currentPath = location.pathname;

        if (currentPath === '/my-blogs') {
          response = await api.get<Blog[]>(`/api/blogs?user=${user?._id}&status=published`);
        } else if (currentPath === '/my-drafts') {
          response = await api.get<Blog[]>(`/api/blogs?user=${user?._id}&status=draft`);
        } else {
          response = await api.get<Blog[]>('/api/blogs');
        }

        const allBlogsData = response.data;
        const sortedBlogs = allBlogsData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setBlogs(sortedBlogs);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    if (location.pathname === '/all-blogs' || user) {
      fetchBlogs();
    }
  }, [location.pathname, user]);

  const handleDelete = async (blogId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/blogs/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handleCopyLink = (blogId: string) => {
    const url = `${window.location.origin}/blogs/${blogId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard!');
    });
  };

  const isMyBlogsRoute = location.pathname === '/my-blogs';
  const isMyDraftsRoute = location.pathname === '/my-drafts';
  const showDeleteButtons = isMyBlogsRoute || isMyDraftsRoute;
  const isAllBlogs = !isMyBlogsRoute && !isMyDraftsRoute;

  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');

  const getPageTitle = (): string => {
    if (isMyBlogsRoute) return 'My TechShare Editions';
    if (isMyDraftsRoute) return 'Draft Desk';
    return 'Open Edition Archive';
  };

  const getPageTagline = (): string => {
    if (isMyBlogsRoute)
      return 'Your editions are live for the community to read.';
    if (isMyDraftsRoute)
      return 'Unfinished ideas with potential. Polish and publish the next drop.';
    return 'Discover designer-grade stories, insights, and founder memos.';
  };

  // Check if blog was updated in the last 24 hours
  const isNew = (updatedAt: string): boolean => {
    const now = new Date();
    const updated = new Date(updatedAt);
    return (now.getTime() - updated.getTime()) < 24 * 60 * 60 * 1000;
  };

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#05010b] text-white">
        <div className="rounded-3xl border border-white/20 bg-white/5 px-8 py-10 text-center backdrop-blur-2xl">
          <p className="text-lg font-semibold text-white/90">Error loading blogs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05010b] text-white">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 0%, rgba(225,187,255,0.35), transparent 45%),
            radial-gradient(circle at 80% 10%, rgba(99,47,161,0.45), transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(12,3,23,0.8), transparent 60%)
          `,
        }}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 rounded-2xl border border-white/30 bg-white px-4 py-2 text-sm font-semibold text-purple-900 shadow-lg">
          {toast.message}
        </div>
      )}

      <div className="relative z-10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Page Header */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-purple-100/80">TechShare</p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{getPageTitle()}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-purple-100/80">{getPageTagline()}</p>
          </div>

          {/* Published Blogs */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {publishedBlogs.length > 0 && (
                <section className="space-y-6">
                  <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-purple-100/80">
                        Featured Editions
                      </p>
                      <h2 className="text-2xl font-semibold text-white">Published Cards</h2>
                    </div>
                    {isAllBlogs && (
                      <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-purple-100/90">
                        {publishedBlogs.length} live
                      </span>
                    )}
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {publishedBlogs.map((blog, index) => (
                      <motion.article
                        key={blog._id}
                        custom={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white text-purple-900 shadow-[0_18px_50px_rgba(82,40,168,0.25)]"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#a855f7] via-white to-[#6366f1]" />
                        <Link
                          to={`/blogs/${blog._id}`}
                          className="flex flex-1 flex-col gap-4 px-6 py-7"
                        >
                          <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-400">
                            <span>Edition #{String(index + 1).padStart(2, '0')}</span>
                            <span>{formatRelativeTime(blog.updated_at)}</span>
                          </div>
                          <h3 className="text-xl font-semibold leading-tight text-purple-900">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-purple-500">
                            Published by {blog?.user?.username || 'Unknown Author'}
                          </p>
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {blog.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border border-purple-100/70 px-3 py-1 text-xs text-purple-500"
                                  title={`Tag: ${tag}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {isNew(blog.updated_at) && (
                            <span className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-400 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                              New drop
                            </span>
                          )}
                        </Link>

                        {/* Action Buttons (only for owner) */}
                        {showDeleteButtons && (
                          <div className="flex gap-2 border-t border-purple-50/80 px-6 py-4">
                            <Link
                              to={`/edit-blog/${blog._id}`}
                              className="flex-1 rounded-2xl border border-purple-200/70 px-4 py-2 text-center text-sm font-semibold text-purple-700 transition-colors duration-300 hover:bg-purple-50"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(blog._id);
                              }}
                              className="flex-1 rounded-2xl border border-red-200 px-4 py-2 text-center text-sm font-semibold text-red-600 transition-colors duration-300 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        {/* Copy Link (only on /all-blogs) */}
                        {isAllBlogs && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCopyLink(blog._id);
                            }}
                            className="absolute right-5 top-5 rounded-full border border-purple-100/80 bg-white/80 p-2 text-purple-600 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
                            aria-label="Copy link"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        )}
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {/* Drafts */}
              {draftBlogs.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">Draft Studio</h2>
                    <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-purple-100/90">
                      {draftBlogs.length} pending
                    </span>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {draftBlogs.map((blog, index) => (
                      <motion.article
                        key={blog._id}
                        custom={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={cardVariants}
                        className="rounded-3xl border border-dashed border-white/30 bg-white/5 p-6 text-white backdrop-blur-2xl"
                      >
                        <Link to={`/edit-blog/${blog._id}`} className="block">
                          <p className="text-xs uppercase tracking-[0.4em] text-purple-200">
                            Draft
                          </p>
                          <h3 className="mt-3 text-xl font-semibold text-white">
                            {blog.title || 'Untitled Draft'}
                          </h3>
                          <p className="mt-2 text-sm text-purple-100/80">
                            Edited {formatRelativeTime(blog.updated_at)}
                          </p>
                        </Link>
                        {showDeleteButtons && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="rounded-2xl border border-red-200/70 px-4 py-2 text-sm font-semibold text-red-200 transition-colors duration-300 hover:bg-red-500/10"
                            >
                              Delete Draft
                            </button>
                          </div>
                        )}
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {publishedBlogs.length === 0 && draftBlogs.length === 0 && (
                <div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-white/5 px-6 py-16 text-center text-purple-100 backdrop-blur-2xl">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/5 text-2xl">
                    ✨
                  </div>
                  <p className="text-lg font-semibold">
                    {isMyDraftsRoute
                      ? 'No drafts yet — start writing!'
                      : isMyBlogsRoute
                        ? 'Nothing published yet.'
                        : 'No editions to show right now.'}
                  </p>
                  <p className="mt-2 text-sm text-purple-100/80">
                    Turn your next idea into a TechShare card.
                  </p>
                  <Link
                    to="/create-blog"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-6 py-3 text-sm font-semibold text-purple-900 shadow-lg shadow-purple-900/30 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Compose Edition
                    <span>→</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;