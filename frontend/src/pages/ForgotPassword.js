import React, { useState } from 'react';
import { Flex, Box, FormControl, FormLabel, Input, Stack, Button, Heading, Text, useColorModeValue, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { api } from './api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      toast({
        title: 'Verzoek verzonden',
        description: response.data.message,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Er is een fout opgetreden bij het verwerken van uw verzoek.';
      setError(errorMessage);
      toast({
        title: 'Fout',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH={'80vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Wachtwoord vergeten</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>Voer uw e-mailadres in om een resetlink te ontvangen.</Text>
        </Stack>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>E-mailadres</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormControl>
              <Stack spacing={6} mt={4}>
                {error && <Alert status="error"><AlertIcon />{error}</Alert>}
                {message && <Alert status="success"><AlertIcon />{message}</Alert>}
                <Button type="submit" colorScheme="teal" isLoading={isLoading}>Verzend resetlink</Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default ForgotPassword;
