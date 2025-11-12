// frontend/src/utils/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isLoggedIn, isCoach } = useAuth();

  if (isLoggedIn) {
    // Als de gebruiker al is ingelogd, stuur direct door naar het juiste dashboard
    return <Navigate to={isCoach ? "/admin" : "/dashboard"} />;
  }

  // Als de gebruiker niet is ingelogd, toon de publieke pagina (bv. Login)
  return children;
};

export default PublicRoute;
