// frontend/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Heading, Link, Button, extendTheme, Spacer } from '@chakra-ui/react';

// Importeer alle componenten, inclusief de nieuwe LandingPage
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import CoachLogin from './components/CoachLogin';
import Intake from './components/Intake';
import UserDashboard from './components/UserDashboard';
import Admin from './components/Admin';
import UserDetail from './components/UserDetail';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // *** TOEGEVOEGD: Importeer de nieuwe PublicRoute ***

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f2f2',
      100: '#b3d9d9',
      500: '#008080',
      900: '#003333',
    },
  },
});

// De Intelligente Navigatiebalk
function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.user.role);
      } catch (e) {
        console.error("Kon token niet decoderen:", e);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [location, handleLogout]);

  // Toon de navigatiebalk alleen als de gebruiker is ingelogd
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg="brand.500" color="white">
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
          NutriCoach AI
        </Heading>
      </Flex>
      <Spacer />
      <Box>
        {userRole === 'user' && (
          <Link as={RouterLink} to="/dashboard" mr={4}>
            Mijn Dashboard
          </Link>
        )}
        {userRole === 'coach' && (
          <Link as={RouterLink} to="/admin" mr={4}>
            Coach Dashboard
          </Link>
        )}
        <Button onClick={handleLogout} variant="outline" _hover={{ bg: 'brand.900', borderColor: 'white' }}>
          Uitloggen
        </Button>
      </Box>
    </Flex>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
      
        {/* --- AANGEPAST: De Navigation component is nu weer actief --- */}
        <Navigation />
        
        <Box p={8}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* --- AANGEPAST: Gebruik PublicRoute voor login pagina's --- */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/coach" element={<PublicRoute><CoachLogin /></PublicRoute>} />
            {/* --- Einde aanpassing --- */}
            <Route path="/intake" element={<Intake />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/user/:userId" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
