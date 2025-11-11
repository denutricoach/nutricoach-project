// frontend/src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// --- AANGEPAST: De component ontvangt nu de 'isLoggedIn' prop ---
const PublicRoute = ({ children, isLoggedIn }) => {
  if (isLoggedIn) {
    // Als de gebruiker al is ingelogd, stuur direct door naar het dashboard
    return <Navigate to="/dashboard" />;
  }

  // Als de gebruiker niet is ingelogd, toon de publieke pagina (bv. Login)
  return children;
};

export default PublicRoute;
