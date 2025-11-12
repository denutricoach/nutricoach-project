// frontend/src/components/Admin.js

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';


import {
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter, Button, Text, Spinner, Flex, Alert, AlertIcon, Tag, HStack,
  Badge // *** STAP 1: IMPORTEER DE BADGE ***
} from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';

// Hulpfunctie om het juiste icoon en de juiste kleur te kiezen
const getStatusTag = (status) => {
  switch (status) {
    case 'perfect':
      return { icon: CheckCircleIcon, color: 'green.500', text: 'Goed Bezig' };
    case 'te_veel':
      return { icon: WarningIcon, color: 'orange.500', text: 'Let Op' };
    case 'te_weinig':
      return { icon: InfoIcon, color: 'blue.500', text: 'Tip' };
    default:
      return null;
  }
};

function Admin() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // *** STAP 2: PAS DE USEEFFECT AAN VOOR POLLING ***
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        // De backend route stuurt nu ook de 'unreadCount' mee
        const response = await fetch(`${API_URL}/api/admin/users`, {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) {
          throw new Error('Kon gebruikers niet ophalen of geen toegang.');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        // Zorg ervoor dat de laadspinner alleen de eerste keer wordt uitgezet
        if (isLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers(); // Haal direct op bij het laden

    // Stel een interval in om elke 5 seconden te checken op updates
    const interval = setInterval(fetchUsers, 5000);

    // Ruim het interval op als de component wordt unmount
    return () => clearInterval(interval);
  }, [isLoading]); // We voegen isLoading toe zodat de finally block correct werkt

  if (isLoading) {
    return <Flex justify="center" align="center" height="80vh"><Spinner size="xl" /></Flex>;
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={8}>Admin Dashboard - Cliëntenoverzicht</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {users.map(user => {
          const statusTag = getStatusTag(user.lastLogStatus);
          return (
            <Card key={user._id} borderWidth="1px" borderRadius="lg" shadow="md">
              <CardHeader>
                <HStack justify="space-between">
                  <Box>
                    <Heading size='md'>{user.algemeen_naam || 'Naam onbekend'}</Heading>
                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                  </Box>
                  {statusTag && (
                    <Tag size="lg" variant="subtle" colorScheme={statusTag.color.split('.')[0]}>
                      <statusTag.icon mr={2} />
                      {statusTag.text}
                    </Tag>
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <Text><strong>Doel:</strong> {user.hulpvraag_doel || 'Niet opgegeven'}</Text>
              </CardBody>
              <CardFooter>
                {/* *** STAP 3: VOEG DE BADGE TOE AAN DE KNOP *** */}
                <Button as={RouterLink} to={`/admin/user/${user._id}`} colorScheme="teal" position="relative">
                  Bekijk Details
                  {user.unreadCount > 0 && (
                    <Badge 
                      colorScheme="red" 
                      variant="solid" 
                      borderRadius="full"
                      position="absolute"
                      top="-1"
                      right="-1"
                      fontSize="0.7em"
                      px={2}
                    >
                      {user.unreadCount}
                    </Badge>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

export default Admin;
