// frontend/src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    // Gebruiker is al ingelogd, stuur door naar het juiste dashboard
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.user.role;
      
      if (userRole === 'coach') {
        return <Navigate to="/admin" />;
      } else {
        return <Navigate to="/dashboard" />;
      }
    } catch (e) {
      // Als token corrupt is, behandel als uitgelogd
      localStorage.removeItem('token');
      return children;
    }
  }

  // Gebruiker is niet ingelogd, toon de gevraagde pagina (bv. Login)
  return children;
};

export default PublicRoute;
