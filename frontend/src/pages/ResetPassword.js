import React, { useState } from 'react';
import { Flex, Box, FormControl, FormLabel, Input, Stack, Button, Heading, Text, useColorModeValue, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      
      toast({
        title: 'Succes',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'De resetlink is ongeldig of verlopen.';
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
          <Heading fontSize={'4xl'}>Wachtwoord instellen</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>Voer uw nieuwe wachtwoord in.</Text>
        </Stack>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="newPassword" isRequired>
                <FormLabel>Nieuw Wachtwoord</FormLabel>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </FormControl>
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Bevestig Wachtwoord</FormLabel>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </FormControl>
              <Stack spacing={6} mt={4}>
                {error && <Alert status="error"><AlertIcon />{error}</Alert>}
                <Button type="submit" colorScheme="teal" isLoading={isLoading}>Wachtwoord resetten</Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default ResetPassword;
