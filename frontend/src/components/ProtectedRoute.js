// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';

// --- AANGEPAST: De component ontvangt nu de 'auth' prop ---
const ProtectedRoute = ({ children, auth }) => {
  
  // 1. Als de app nog aan het laden is, toon een spinner
  if (auth.isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // 2. Als het laden klaar is en de gebruiker NIET is ingelogd, stuur naar login
  if (!auth.isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // 3. Als het laden klaar is en de gebruiker WEL is ingelogd, toon de pagina
  return children;
};

export default ProtectedRoute;
