// frontend/src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Als er GEEN token is, stuur de gebruiker naar de login-pagina
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Als er WEL een token is, toon de pagina die de gebruiker wilde zien
  return children;
}

export default ProtectedRoute;

