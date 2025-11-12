import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '../api'; // api.js bevindt zich in de src/ map, dus we moeten een niveau omhoog

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const navigate = useNavigate();

  // Functie om de gebruiker op te halen van de backend (voor refresh)
  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setIsCoach(false);
      setIsLoading(false);
      return;
    }

    try {
      // Gebruik de nieuwe /api/auth/me route
      const response = await api.get('/auth/me', {
        headers: { 'x-auth-token': authToken }
      });
      
      const { user: userData, isCoach: coachStatus } = response.data;
      
      setUser(userData);
      setIsCoach(coachStatus);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    } catch (error) {
      console.error('Fout bij ophalen gebruiker (refresh):', error);
      // Als de token ongeldig is, uitloggen
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Probeer bij het laden van de app de gebruiker op te halen
    fetchUser(token);
  }, [token, fetchUser]);

  const login = useCallback((newToken) => {
    setToken(newToken);
    // De useEffect zal fetchUser aanroepen met de nieuwe token
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsCoach(false);
    navigate('/login');
  }, [navigate]);

  // Update de user state na een succesvolle intake of profielupdate
  const updateUser = useCallback((newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  }, []);

  const value = {
    user,
    token,
    isLoggedIn: !!user,
    isCoach,
    isLoading,
    login,
    logout,
    updateUser,
    fetchUser // Exporteer om handmatig te kunnen refreshen indien nodig
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
