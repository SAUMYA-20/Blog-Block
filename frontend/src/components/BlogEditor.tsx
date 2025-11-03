import React, { useState, useEffect, useRef, useContext, ChangeEvent, FormEvent } from 'react';
import api from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { Blog } from '../types';

interface UploadImageResponse {
  imageUrl: string;
}

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { user, loading: authLoading }: AuthContextType = context;

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [blogOwnerId, setBlogOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [blog, setBlog] = useState<Blog | null>(null);

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchBlog = async (): Promise<void> => {
      if (id) {
        try {
          const response = await api.get<Blog>(`/api/blogs/${id}`);
          setBlog(response.data);
          setIsEditing(true);
          setTitle(response.data.title);
          setContent(response.data.content);
          setTags(response.data.tags ? response.data.tags.join(', ') : '');
          setImageUrl(response.data.imageUrl || '');
          setImagePreview(response.data.imageUrl ? `${import.meta.env.VITE_API_URL}${response.data.imageUrl}` : null);
          setBlogId(response.data._id);
          setBlogOwnerId(response.data.user._id);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching blog:', err.response?.data);
          setError(err);
          setLoading(false);
          alert('Error fetching blog or you are not authorized to edit this blog.');
          if (err.response && (err.response.status === 401 || err.response.status === 404)) {
            navigate('/');
          }
        }
      } else {
        setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [id, navigate]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [title, content, tags, blogId, user, loading, authLoading, blogOwnerId, id]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [title, tags, user, loading, authLoading, blogOwnerId, id]);

  useEffect(() => {
    if (loading || authLoading || !user) return;
    if (id && blogOwnerId && user._id !== blogOwnerId) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [content, user, loading, authLoading, blogOwnerId, id]);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await api.post<UploadImageResponse>('/api/blogs/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedImageUrl = uploadResponse.data.imageUrl;
      setImageUrl(uploadedImageUrl);
      setImagePreview(`${import.meta.env.VITE_API_URL}${uploadedImageUrl}`);
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handleRemoveImage = (): void => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const saveDraft = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to save this blog.');
      return;
    }
    if (!title || title.trim() === '') {
      console.log('Title is required to save a draft.');
      return;
    }
    const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
    if (!contentWithoutTags) {
      console.log('Content is empty after removing HTML tags.');
      return;
    }

    try {
      const blogData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        status: 'draft' as const,
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch<Blog>(`/api/blogs/${blogId}`, blogData);
        console.log('Draft updated:', response.data);
      } else {
        response = await api.post<Blog>('/api/blogs', blogData);
        setBlogId(response.data._id);
        console.log('Draft saved:', response.data);
        if (!isEditing) {
          navigate(`/edit-blog/${response.data._id}`);
        }
        setIsEditing(true);
        setBlog(response.data);
      }
      console.log('Auto-save successful.');
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to save this blog.');
      return;
    }
    if (!title) {
      alert('Title is required to save a draft manually.');
      return;
    }
    await saveDraft();
    alert('Draft saved manually!');
  };

  const handlePublish = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to publish this blog.');
      return;
    }
    if (!title || title.trim() === '') {
      alert('Please add a title before publishing.');
      return;
    }
    const contentWithoutTags = content.replace(/<[^>]*>/g, '').trim();
    if (!contentWithoutTags) {
      alert('Please add content before publishing.');
      return;
    }

    try {
      const blogData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        status: 'published' as const,
        imageUrl: imageUrl || undefined,
      };
      let response;
      if (blogId) {
        response = await api.patch<Blog>(`/api/blogs/${blogId}`, blogData);
        console.log('Blog updated and published:', response.data);
      } else {
        response = await api.post<Blog>('/api/blogs', blogData);
        console.log('Blog published:', response.data);
      }
      alert('Blog published successfully!');
      navigate(`/blogs/${response.data._id}`);
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Failed to publish blog. See console for details.');
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!user || (id && blogOwnerId && user._id !== blogOwnerId)) {
      alert('You are not authorized to delete this blog.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog?') && blogId) {
      try {
        await api.delete(`/api/blogs/${blogId}`);
        alert('Blog deleted successfully!');
        navigate('/my-blogs');
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete blog. See console for details.');
      }
    }
  };

  if (loading || authLoading) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>Loading editor...</p></div>;
  }

  if (id && blogOwnerId && user && user._id !== blogOwnerId) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600"><p>You are not authorized to edit this blog.</p></div>;
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120,119,198,0.1) 0%, transparent 50%)`,
      }} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {id ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-colors duration-200 bg-white text-gray-900"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  disabled={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content
                </label>

                {/* Outer wrapper handles border + focus */}
                <div
                  className="rounded-lg border border-gray-300 bg-white 
               focus-within:ring-2 focus-within:ring-blue-100 
               focus-within:border-blue-500 transition-colors duration-200"
                >
                  <div className="[&_.ql-toolbar]:!border-0 [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-gray-300 
                    [&_.ql-toolbar]:!rounded-t-lg [&_.ql-toolbar]:!bg-gray-50
                    [&_.ql-container]:!border-0 [&_.ql-container]:!rounded-b-lg">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      readOnly={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
                      className="h-64 sm:h-80 rounded-lg"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['link', 'image'],
                          ['code-block'],
                          [{ color: [] }, { background: [] }],
                          [{ align: [] }],
                          ['clean'],
                        ],
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike',
                        'list', 'bullet',
                        'link', 'image',
                        'code-block',
                        'color', 'background',
                        'align',
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-blue-100 focus:border-blue-500 
               outline-none transition-colors duration-200 bg-white text-gray-900"
                  value={tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
                  disabled={!!(id && blogOwnerId && user && user._id !== blogOwnerId)}
                  placeholder="e.g., react, webdev, tutorial"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image (Optional)
                </label>

                {imagePreview && (
                  <div className="relative mb-4 max-w-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
                    {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
                  <label
                    className={`flex flex-col items-center justify-center w-full max-w-md p-5 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${uploadingImage
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                      }`}
                  >
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto text-gray-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {uploadingImage ? 'Uploading image...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadingImage && (
                  <div className="flex justify-center mt-3">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!(id && blogOwnerId && user && user._id !== blogOwnerId) && (
                <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-100">
                  <button
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    type="button"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </button>
                  <button
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    type="button"
                    onClick={handlePublish}
                  >
                    {id ? 'Update & Publish' : 'Publish'}
                  </button>
                  {id && (
                    <button
                      className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      type="button"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;

