// frontend/src/App.js

import React, { useCallback } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Heading, Link, Button, extendTheme, Spacer, Spinner } from '@chakra-ui/react';

// Importeer alle componenten
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CoachLogin from './pages/CoachLogin';
import Intake from './components/Intake';
import UserDashboard from './pages/UserDashboard';
import Admin from './pages/Admin';
import UserDetail from './pages/UserDetail';
import ProtectedRoute from './utils/ProtectedRoute';
import PublicRoute from './utils/PublicRoute';
import { useAuth } from './context/AuthContext';

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

function Navigation({ isLoggedIn, userRole, onLogout }) {
  if (!isLoggedIn) return null;
  return (
    <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg="brand.500" color="white">
      <Flex align="center" mr={5}><Heading as="h1" size="lg" letterSpacing={'-.1rem'}>NutriCoach AI</Heading></Flex>
      <Spacer />
      <Box>
        {userRole === 'user' && <Link as={RouterLink} to="/dashboard" mr={4}>Mijn Dashboard</Link>}
        {userRole === 'coach' && <Link as={RouterLink} to="/admin" mr={4}>Coach Dashboard</Link>}
        <Button onClick={onLogout} variant="outline" _hover={{ bg: 'brand.900', borderColor: 'white' }}>Uitloggen</Button>
      </Box>
    </Flex>
  );
}

function App() {
  const { isLoggedIn, isCoach, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  if (isLoading) {
    return (
      <ChakraProvider theme={theme}><Flex justify="center" align="center" height="100vh"><Spinner size="xl" /></Flex></ChakraProvider>
    );
  }

  const userRole = isCoach ? 'coach' : 'user';

  return (
    <ChakraProvider theme={theme}>
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />
      <Box p={8}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* --- AANGEPAST: Gebruik de AuthContext voor login/logout --- */}
          <Route path="/login" element={<PublicRoute isLoggedIn={isLoggedIn}><Login /></PublicRoute>} />
          <Route path="/coach" element={<PublicRoute isLoggedIn={isLoggedIn}><CoachLogin /></PublicRoute>} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} isCoach={isCoach}><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute isLoggedIn={isLoggedIn} isCoach={isCoach}><Admin /></ProtectedRoute>} />
          <Route path="/admin/user/:userId" element={<ProtectedRoute isLoggedIn={isLoggedIn} isCoach={isCoach}><UserDetail /></ProtectedRoute>} />
        </Routes>
      </Box>
    </ChakraProvider>
  );
}

export default App;
