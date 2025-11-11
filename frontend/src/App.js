// frontend/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Heading, Link, Button, extendTheme, Spacer, Spinner } from '@chakra-ui/react';

// Importeer alle componenten
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import CoachLogin from './components/CoachLogin';
import Intake from './components/Intake';
import UserDashboard from './components/UserDashboard';
import Admin from './components/Admin';
import UserDetail from './components/UserDetail';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

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

// --- AANGEPAST: De Navigatiebalk is nu een aparte, slimmere component ---
function Navigation({ isLoggedIn, userRole, onLogout }) {
  if (!isLoggedIn) {
    return null; // Toon niets als de gebruiker niet is ingelogd
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
        <Button onClick={onLogout} variant="outline" _hover={{ bg: 'brand.900', borderColor: 'white' }}>
          Uitloggen
        </Button>
      </Box>
    </Flex>
  );
}

function App() {
  // --- AANGEPAST: Centrale state voor authenticatie, inclusief 'loading' ---
  const [auth, setAuth] = useState({
    isLoading: true, // Start met laden
    isLoggedIn: false,
    userRole: null,
    token: null,
  });
  const navigate = useNavigate();

  // Effect om de token te controleren bij het laden van de app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAuth({
          isLoading: false,
          isLoggedIn: true,
          userRole: payload.user.role,
          token: token,
        });
      } catch (e) {
        localStorage.removeItem('token');
        setAuth({ isLoading: false, isLoggedIn: false, userRole: null, token: null });
      }
    } else {
      setAuth({ isLoading: false, isLoggedIn: false, userRole: null, token: null });
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setAuth({ isLoading: false, isLoggedIn: false, userRole: null, token: null });
    navigate('/login');
  }, [navigate]);

  // Toon een laadspinner zolang de authenticatie-check bezig is
  if (auth.isLoading) {
    return (
      <ChakraProvider theme={theme}>
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Navigation isLoggedIn={auth.isLoggedIn} userRole={auth.userRole} onLogout={handleLogout} />
      <Box p={8}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute isLoggedIn={auth.isLoggedIn}><Login /></PublicRoute>} />
          <Route path="/coach" element={<PublicRoute isLoggedIn={auth.isLoggedIn}><CoachLogin /></PublicRoute>} />
          <Route path="/intake" element={<Intake />} />
          
          {/* --- AANGEPAST: Geef de auth-status door aan de ProtectedRoute --- */}
          <Route path="/dashboard" element={<ProtectedRoute auth={auth}><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute auth={auth}><Admin /></ProtectedRoute>} />
          <Route path="/admin/user/:userId" element={<ProtectedRoute auth={auth}><UserDetail /></ProtectedRoute>} />
        </Routes>
      </Box>
    </ChakraProvider>
  );
}

// --- AANGEPAST: Exporteer de App gewikkeld in de Router ---
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
