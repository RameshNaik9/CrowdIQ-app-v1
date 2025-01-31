import React from 'react';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import { loginSuccess } from '../redux/actions/authActions';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // 🔹 Replace with your Google OAuth Client ID

const LoginComponent = () => {
  const dispatch = useDispatch();

  const onSuccess = (response) => {
    console.log('Login Success:', response.profileObj);
    dispatch(loginSuccess(response.profileObj));
  };

  const onFailure = (response) => {
    console.log('Login Failed:', response);
  };

  return (
    <div className="login-container">
      <h2>Welcome to the Admin Panel</h2>
      <GoogleLogin
        clientId={CLIENT_ID}
        buttonText="Sign in with Google"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
};

export default LoginComponent;
