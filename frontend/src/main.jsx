import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import './care.css';
import './dark-theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
