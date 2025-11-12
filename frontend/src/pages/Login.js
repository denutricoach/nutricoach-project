// frontend/src/components/Login.js
import API_URL from '../api';
import React, { useState, useEffect } from 'react';\nimport { useAuth } from '../context/AuthContext';\nimport { useNavigate, useLocation } from 'react-router-dom';
import { Flex, Box, FormControl, FormLabel, Input, Stack, Button, Heading, Text, useColorModeValue, useToast, Alert, AlertIcon, Divider } from '@chakra-ui/react';


function Login() {\n  const { login } = useAuth();\n  const navigate = useNavigate();\n  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {\n    const query = new URLSearchParams(location.search);\n    const token = query.get('token');\n    const authError = query.get('error');\n\n    if (token) {\n      login(token);\n      // Verwijder de token uit de URL\n      navigate(location.pathname, { replace: true });\n    } else if (authError) {\n      setError('Inloggen met Google mislukt. Probeer het opnieuw.');\n      navigate(location.pathname, { replace: true });\n    }\n  }, [location, login, navigate]);\n\n  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Inloggen mislukt');
      }
      
      toast({ title: 'Succesvol ingelogd!', status: 'success', duration: 2000, isClosable: true });

      // Gebruik de centrale login functie
      login(data.token);
      
      // Navigeer op basis van de rol
      if (data.role === 'coach') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH={'80vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}><Heading fontSize={'4xl'}>Inloggen op uw account</Heading><Text fontSize={'lg'} color={'gray.600'}>Welkom terug!</Text></Stack>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired><FormLabel>E-mailadres</FormLabel><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormControl>
              <FormControl id="password" isRequired><FormLabel>Wachtwoord</FormLabel><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormControl>
              <Stack spacing={6} mt={4}>
                {error && <Alert status="error"><AlertIcon />{error}</Alert>}
                <Button type="submit" colorScheme="teal" isLoading={isLoading}>Inloggen</Button>\n                <Divider my={4} />\n                <Button colorScheme="red" onClick={() => window.location.href = `${API_URL}/api/auth/google`}>Inloggen met Google</Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Login;
