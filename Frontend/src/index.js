import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// Configure axios base URL
// Priority: REACT_APP_API_URL, then REACT_APP_BACKEND_URL (fallback), then development default
// In production (Vercel), set REACT_APP_API_URL or REACT_APP_BACKEND_URL in environment variables
const getApiBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL;
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  // Production fallback (should not happen if env var is set)
  return '';
};

axios.defaults.baseURL = getApiBaseURL();

// Warn in production if API URL is not set
if (
  process.env.NODE_ENV === 'production' &&
  !process.env.REACT_APP_API_URL &&
  !process.env.REACT_APP_BACKEND_URL
) {
  console.error('⚠️ API base URL is not set! Set REACT_APP_API_URL or REACT_APP_BACKEND_URL in Vercel environment variables.');
}

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 