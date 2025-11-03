import React, { useState, useContext, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import AuthContext, { AuthContextType } from '../context/AuthContext';

interface LoginResponse {
  token: string;
  message?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext must be used within AuthProvider');
  }

  const { login }: AuthContextType = context;

  const { username, password } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { username, password });
      await login(res.data.token);
      navigate('/all-blogs');
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert('Login failed.');
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to share your thoughts, publish ideas, and connect through words.
            </p>
          </div>

          <form
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 transition-all duration-300 hover:shadow-xl"
            onSubmit={onSubmit}
          >
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                id="username"
                type="text"
                placeholder="your_username"
                name="username"
                value={username}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                id="password"
                type="password"
                placeholder="••••••••"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                type="submit"
              >
                Sign In & Start Writing
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Your voice matters. Log in to publish, edit, and inspire.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;