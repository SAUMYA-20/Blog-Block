import React, { useEffect, useState, useContext } from 'react';
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
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-5 space-y-4">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </div>
    </div>
  </div>
);

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
    if (isMyBlogsRoute) return 'My Published Blogs';
    if (isMyDraftsRoute) return 'My Drafts';
    return 'All Blogs Posts';
  };

  const getPageTagline = (): string => {
    if (isMyBlogsRoute)
      return 'Your published work is live! Keep sharing your voice.';
    if (isMyDraftsRoute)
      return 'Unfinished ideas with potential. Finish one today!';
    return 'Discover stories, insights, and perspectives from our community.';
  };

  // Check if blog was updated in the last 24 hours
  const isNew = (updatedAt: string): boolean => {
    const now = new Date();
    const updated = new Date(updatedAt);
    return (now.getTime() - updated.getTime()) < 24 * 60 * 60 * 1000;
  };

  if (error) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)" }} />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <p className="text-red-600 text-lg">Error loading blogs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120,119,198,0.1) 0%, transparent 50%)`,
      }} />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast.message}
        </div>
      )}

      <div className="relative z-10 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{getPageTagline()}</p>
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
                <section className="mb-14">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-6 px-2 flex items-center gap-2">
                    Published Posts
                    {isAllBlogs && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {publishedBlogs.length} live
                      </span>
                    )}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {publishedBlogs.map(blog => (
                      <article
                        key={blog._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
                      >
                        <Link to={`/blogs/${blog._id}`} className="block">
                          {blog.imageUrl ? (
                            <div className="h-48 overflow-hidden relative">
                              <img
                                src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              {isNew(blog.updated_at) && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  New
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                              <span className="text-4xl font-bold text-gray-500">
                                {getInitials(blog.title || 'Blog')}
                              </span>
                              {isNew(blog.updated_at) && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  New
                                </div>
                              )}
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatRelativeTime(blog.updated_at)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Published By: {blog?.user?.username || "Unknown Author"}
                            </p>

                            {blog.tags && blog.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {blog.tags.slice(0, 3).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-default"
                                    title={`Tag: ${tag}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Action Buttons (only for owner) */}
                        {showDeleteButtons && (
                          <div className="px-5 pb-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Link
                              to={`/edit-blog/${blog._id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex-1 text-center py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(blog._id);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors flex-1 text-center py-1.5 bg-red-50 rounded-lg hover:bg-red-100"
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
                            className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Copy link"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Drafts */}
              {draftBlogs.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-6 px-2">
                    Drafts
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full ml-2">
                      {draftBlogs.length}
                    </span>
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {draftBlogs.map(blog => (
                      <article
                        key={blog._id}
                        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors group"
                      >
                        <Link to={`/edit-blog/${blog._id}`} className="block p-5">
                          <h3 className="text-lg font-bold text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-2">
                            {blog.title || 'Untitled Draft'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Edited {formatRelativeTime(blog.updated_at)}
                          </p>
                        </Link>
                        {showDeleteButtons && (
                          <div className="px-5 pb-4 flex justify-center">
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors py-1.5 px-3 bg-red-50 rounded-lg hover:bg-red-100"
                            >
                              Delete Draft
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {publishedBlogs.length === 0 && draftBlogs.length === 0 && (
                <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl max-w-2xl mx-auto px-6 border border-gray-200">
                  {/* Optional: Inline SVG Illustration */}
                  <div className="mx-auto w-24 h-24 mb-6 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <div className="text-gray-600 text-lg mb-4">
                    {isMyDraftsRoute
                      ? 'No drafts yet — start writing!'
                      : isMyBlogsRoute
                        ? 'Nothing published yet.'
                        : 'No blogs to show right now.'}
                  </div>
                  {(!isMyDraftsRoute && !isMyBlogsRoute) && (
                    <Link
                      to="/create-blog"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Write Your First Post
                    </Link>
                  )}
                  {isMyDraftsRoute && (
                    <Link
                      to="/create-blog"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Draft
                    </Link>
                  )}
                  {isMyBlogsRoute && (
                    <p className="text-gray-500 mt-2">Finish and publish a draft to see it here.</p>
                  )}
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