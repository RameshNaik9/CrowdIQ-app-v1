import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginComponent from '../components/LoginComponent';
import '../Style/LoginPage.css';  // Style file


const LoginPage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/'); // ✅ Redirect to dashboard after login
    return null;
  }

  return (
    <div className="login-page">
      <LoginComponent />
    </div>
  );
};

export default LoginPage;
