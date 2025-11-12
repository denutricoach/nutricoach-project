// frontend/src/utils/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, isCoach, isLoading } = useAuth();

  // 1. Als de app nog aan het laden is, toon een spinner
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // 2. Als de gebruiker NIET is ingelogd, stuur naar login
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // 3. Als een rol vereist is en de gebruiker heeft die rol niet, stuur door
  if (requiredRole === 'coach' && !isCoach) {
    return <Navigate to="/dashboard" />;
  }
  
  // 4. Toon de pagina
  return children;
};

export default ProtectedRoute;
