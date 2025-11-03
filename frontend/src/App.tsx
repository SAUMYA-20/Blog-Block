import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import Register from './components/Register';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import BlogPostDetail from './components/BlogPostDetail';

import Navbar from './components/Navbar';

const App: React.FC = () => {
  // const context = useContext(AuthContext);

  // if (!context) {
  //   throw new Error('AuthContext must be used within AuthProvider');
  // }

  // const { isAuthenticated, logout }: AuthContextType = context;

  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blogs/:id" element={<BlogPostDetail />} />
          <Route path="/all-blogs" element={<BlogList />} />
          <Route path="/my-blogs" element={<PrivateRoute element={BlogList} />} />
          <Route path="/my-drafts" element={<PrivateRoute element={BlogList} />} />
          <Route path="/create-blog" element={<PrivateRoute element={BlogEditor} />} />
          <Route path="/edit-blog/:id" element={<PrivateRoute element={BlogEditor} />} />
          <Route path="/" element={<Link to="/all-blogs" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

