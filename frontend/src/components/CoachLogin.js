// frontend/src/components/CoachLogin.js
import React, { useState } from 'react';
import API_URL from '../api';
import { Flex, Box, FormControl, FormLabel, Input, Stack, Button, Heading, Text, useColorModeValue, useToast } from '@chakra-ui/react';

// --- AANGEPAST: Ontvang de onLoginSuccess prop ---
function CoachLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event) => {
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
      
      toast({ title: 'Succesvol ingelogd!', description: 'Welkom terug, Judith!', status: 'success', duration: 2000, isClosable: true });
      
      // --- AANGEPAST: Roep de centrale login functie aan ---
      onLoginSuccess(data.token);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}><Heading fontSize={'4xl'}>Inloggen voor Coach</Heading><Text fontSize={'lg'} color={'gray.600'}>Welkom terug, Judith! ✌️</Text></Stack>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email"><FormLabel>E-mailadres</FormLabel><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></FormControl>
              <FormControl id="password"><FormLabel>Wachtwoord</FormLabel><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></FormControl>
              <Stack spacing={10}>
                {error && <Text color="red.500">{error}</Text>}
                <Button type="submit" bg={'teal.400'} color={'white'} _hover={{ bg: 'teal.500' }} isLoading={isLoading}>Inloggen</Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default CoachLogin;
