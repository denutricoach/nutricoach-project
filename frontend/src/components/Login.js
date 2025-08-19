// frontend/src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex, Box, FormControl, FormLabel, Input, Stack, Button, Heading, Text, useColorModeValue, useToast, Alert, AlertIcon
} from '@chakra-ui/react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password } ),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Inloggen mislukt');
      }
      localStorage.setItem('token', data.token);
      toast({
        title: 'Succesvol ingelogd!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      if (payload.user.role === 'coach') {
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
    <Flex
      minH={'80vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Inloggen op uw account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            Welkom terug!
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>E-mailadres</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Wachtwoord</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </FormControl>
              <Stack spacing={6} mt={4}>
                {error && <Alert status="error"><AlertIcon />{error}</Alert>}
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isLoading}
                >
                  Inloggen
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Login;
