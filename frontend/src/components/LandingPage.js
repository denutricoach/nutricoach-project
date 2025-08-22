// frontend/src/components/LandingPage.js

import React from 'react';
import { Button, Flex, Heading, Stack, Text, Box } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function LandingPage() {
  return (
    <Flex
      align="center"
      justify="center"
      minH="80vh" // Neemt bijna de volledige hoogte
      textAlign="center"
    >
      <Stack spacing={8} maxW="2xl" mx="auto" px={6}>
        <Heading as="h1" size="2xl" fontWeight="bold">
          Jouw Reis naar een Gezonder Leven Begint Hier
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Welkom bij NutriCoach AI, de persoonlijke assistent van Nutricoach Judith Schmeltz.
          Samen werken we aan jouw doelen met persoonlijke begeleiding en slimme tools.
        </Text>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center">
          <Button
            as={RouterLink}
            to="/intake"
            colorScheme="teal"
            size="lg"
            px={8}
            py={6}
          >
            Start Intake & Registratie
          </Button>
          <Button
            as={RouterLink}
            to="/login"
            variant="outline"
            colorScheme="teal"
            size="lg"
            px={8}
            py={6}
          >
            Inloggen voor Cliënten
          </Button>
        </Stack>

        {/* --- AANGEPAST: De knop heeft nu een 'ghost' variant en een kleurschema --- */}
        <Box pt={6}>
          <Button
            as={RouterLink}
            to="/coach"
            variant="ghost" 
            colorScheme="teal"
          >
            Inloggen voor Coach
          </Button>
        </Box>
        
      </Stack>
    </Flex>
  );
}

export default LandingPage;
