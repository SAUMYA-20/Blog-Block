import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import { Blog } from '../types';
import 'react-quill-new/dist/quill.snow.css';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBlog = async (): Promise<void> => {
      try {
        if (!id) return;
        const response = await api.get<Blog>(`/api/blogs/${id}`);
        setBlog(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
        console.error('Error fetching blog post:', err);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>Error loading blog post: {error.message}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120,119,198,0.1) 0%, transparent 50%)`,
      }} />

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight mb-4">
            {blog.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
            <span>Published on: {new Date(blog.updated_at).toLocaleDateString()}</span>
            {blog.tags && blog.tags.length > 0 && (
              <span>
                Tags: {blog.tags.map(tag => tag.trim()).filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {blog.imageUrl && (
            <div className="mb-8">
              <img
                src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                alt={blog.title}
                className="w-full h-auto rounded-xl shadow-md object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
        
      </div>
    </div>
  );
};

export default BlogPostDetail;

