import React, { useEffect, useState } from 'react';
import { Flex, Box, Heading, Text, useColorModeValue, Alert, AlertIcon, Spinner, Button, Stack } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Uw e-mailadres wordt geverifieerd...');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setStatus('success');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'De verificatielink is ongeldig of verlopen.';
        setMessage(errorMessage);
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Stack align={'center'} spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text fontSize={'lg'} color={'gray.600'}>{message}</Text>
          </Stack>
        );
      case 'success':
        return (
          <Stack align={'center'} spacing={4}>
            <Heading fontSize={'4xl'} color="green.500">Verificatie voltooid!</Heading>
            <Alert status="success" variant="left-accent">
              <AlertIcon />
              {message}
            </Alert>
            <Button colorScheme="teal" onClick={() => navigate('/login')}>
              Ga naar Inloggen
            </Button>
          </Stack>
        );
      case 'error':
        return (
          <Stack align={'center'} spacing={4}>
            <Heading fontSize={'4xl'} color="red.500">Verificatie mislukt</Heading>
            <Alert status="error" variant="left-accent">
              <AlertIcon />
              {message}
            </Alert>
            <Button colorScheme="teal" variant="outline" onClick={() => navigate('/login')}>
              Terug naar Inloggen
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Flex minH={'80vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={10}>
        {renderContent()}
      </Box>
    </Flex>
  );
};

export default VerifyEmail;
