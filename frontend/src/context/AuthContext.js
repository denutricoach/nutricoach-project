import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// De foute 'import api' is hier permanent verwijderd.

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
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
      // Gebruik fetch en de omgevingsvariabele
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { 'x-auth-token': authToken },
      });

      if (!response.ok) {
        throw new Error('Sessie ongeldig');
      }

      // Correcte manier om de JSON data te verwerken
      const data = await response.json();
      
      setUser(data.user);
      setIsCoach(data.isCoach);

    } catch (error) {
      console.error("Sessie validatie mislukt:", error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsCoach(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Lege dependency array, want fetchUser zelf verandert niet

  // Effect om de gebruiker te valideren bij het laden van de app
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false); // Geen token, dus niet laden
    }
  }, [token, fetchUser]);

  // Login functie
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // De useEffect hierboven zal de gebruiker automatisch ophalen
  };

  // Logout functie
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsCoach(false);
    navigate('/login');
  };

  const value = { user, token, isLoading, isCoach, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
