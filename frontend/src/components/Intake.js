// frontend/src/components/Intake.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api'; // Importeer de centrale URL

import {
  Box, Button, Flex, Input, Stack, Heading, Text, useToast, Progress, FormControl, FormLabel, Textarea, Alert, AlertIcon
} from '@chakra-ui/react';

// De lijst met alle stappen
const intakeSteps = [
  { id: 'algemeen', title: '1. Algemene gegevens' },
  { id: 'hulpvraag', title: '2. Hulpvraag & Doelstellingen' },
  { id: 'medisch', title: '3. Medische voorgeschiedenis' },
  { id: 'voeding', title: '4. Voedingspatroon' },
  { id: 'beweeg', title: '5. Beweegpatroon' },
  { id: 'slaap', title: '6. Slaap en stress' },
  { id: 'motivatie', title: '7. Motivatie & omgeving' },
  { id: 'voorkeur', title: '8. Voedingsvoorkeuren & leefstijl' },
  { id: 'metingen', title: '9. (Optioneel) Metingen' },
  { id: 'afspraak', title: '10. Afspraken & verwachtingen' },
  { id: 'registratie', title: '11. Account Aanmaken' },
];

function Intake() {
  const [currentStep, setCurrentStep] = useState(0);
  const [intakeData, setIntakeData] = useState({});
  const [registrationData, setRegistrationData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleNext = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const currentStepData = Object.fromEntries(formData.entries());
    setIntakeData({ ...intakeData, ...currentStepData });
    setCurrentStep(currentStep + 1);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const finalPayload = {
      email: registrationData.email,
      password: registrationData.password,
      intakeData: intakeData
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registratie mislukt');
      }

      localStorage.setItem('token', data.token);
      toast({
        title: 'Registratie succesvol!',
        description: "U wordt nu naar uw persoonlijke dashboard gebracht.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Deze functie bevat nu ALLE stappen
  const renderStep = () => {
    const step = intakeSteps[currentStep];
    switch (step.id) {
      case 'algemeen':
        return (
          <Stack spacing={4}>
            <FormControl isRequired><FormLabel>Naam</FormLabel><Input name="algemeen_naam" /></FormControl>
            <FormControl isRequired><FormLabel>Leeftijd</FormLabel><Input name="algemeen_leeftijd" type="number" /></FormControl>
            <FormControl isRequired><FormLabel>Lengte (cm)</FormLabel><Input name="algemeen_lengte" type="number" /></FormControl>
            <FormControl isRequired><FormLabel>Gewicht (kg)</FormLabel><Input name="algemeen_gewicht" type="number" step="0.1" /></FormControl>
            <FormControl><FormLabel>Beroep</FormLabel><Input name="algemeen_beroep" /></FormControl>
            <FormControl><FormLabel>Leefsituatie</FormLabel><Input name="algemeen_leefsituatie" placeholder="bv. alleenstaand, gezin" /></FormControl>
          </Stack>
        );
      case 'hulpvraag':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Reden voor coaching</FormLabel><Textarea name="hulpvraag_reden" /></FormControl>
            <FormControl isRequired><FormLabel>Wat is je belangrijkste doel?</FormLabel><Textarea name="hulpvraag_doel" /></FormControl>
            <FormControl><FormLabel>Eerdere ervaringen met coaching/diëten?</FormLabel><Textarea name="hulpvraag_eerdere_hulp" /></FormControl>
            <FormControl><FormLabel>Doelen op korte en lange termijn?</FormLabel><Textarea name="hulpvraag_termijn_doelen" /></FormControl>
          </Stack>
        );
      case 'medisch':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Medische aandoeningen (bv. diabetes, PDS)</FormLabel><Textarea name="medisch_aandoeningen" /></FormControl>
            <FormControl><FormLabel>Gebruik je medicatie of supplementen?</FormLabel><Textarea name="medisch_medicatie" /></FormControl>
            <FormControl isRequired><FormLabel>Allergieën of intoleranties?</FormLabel><Textarea name="medisch_allergieen_intoleranties" defaultValue="Geen" /></FormControl>
            <FormControl><FormLabel>Psychische klachten die invloed hebben?</FormLabel><Textarea name="medisch_psychische_klachten" /></FormControl>
          </Stack>
        );
      case 'voeding':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Beschrijf een gemiddelde dag qua voeding</FormLabel><Textarea name="voeding_gemiddelde_dag" /></FormControl>
            <FormControl><FormLabel>Hoeveel maaltijden per dag?</FormLabel><Input name="voeding_aantal_maaltijden" /></FormControl>
            <FormControl><FormLabel>Sla je maaltijden over?</FormLabel><Input name="voeding_maaltijden_overslaan" /></FormControl>
            <FormControl><FormLabel>Last van eetbuien of emotie-eten?</FormLabel><Input name="voeding_eetbuien_emotie_eten" /></FormControl>
            <FormControl><FormLabel>Waterinname per dag</FormLabel><Input name="voeding_waterinname" /></FormControl>
            <FormControl><FormLabel>Gebruik van alcohol/cafeïne</FormLabel><Input name="voeding_alcohol_cafeine" /></FormControl>
          </Stack>
        );
      case 'beweeg':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Hoe vaak sport of beweeg je?</FormLabel><Input name="beweeg_hoe_vaak" /></FormControl>
            <FormControl><FormLabel>Welke vormen van beweging?</FormLabel><Input name="beweeg_welke_vormen" /></FormControl>
            <FormControl><FormLabel>Hoe ervaar je je conditie?</FormLabel><Input name="beweeg_conditie_ervaring" /></FormControl>
          </Stack>
        );
      case 'slaap':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Gemiddelde slaapduur en -kwaliteit</FormLabel><Input name="slaap_kwaliteit" /></FormControl>
            <FormControl><FormLabel>Ervaar je stress? Waar komt dit vandaan?</FormLabel><Input name="slaap_stress_ervaring" /></FormControl>
            <FormControl><FormLabel>Invloed van stress op eetgedrag?</FormLabel><Input name="slaap_stress_invloed_eetgedrag" /></FormControl>
          </Stack>
        );
      case 'motivatie':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Hoe gemotiveerd ben je? (1-10)</FormLabel><Input name="motivatie_score" type="number" min="1" max="10" /></FormControl>
            <FormControl><FormLabel>Wat helpt jou gemotiveerd te blijven?</FormLabel><Textarea name="motivatie_hulp" /></FormControl>
            <FormControl><FormLabel>Word je ondersteund door je omgeving?</FormLabel><Textarea name="motivatie_ondersteuning_omgeving" /></FormControl>
            <FormControl><FormLabel>Wat zijn mogelijke obstakels?</FormLabel><Textarea name="motivatie_obstakels" /></FormControl>
          </Stack>
        );
      case 'voorkeur':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Producten die je absoluut niet eet?</FormLabel><Textarea name="voorkeur_producten_niet" /></FormControl>
            <FormControl><FormLabel>Kook je zelf? Hoe vaak?</FormLabel><Input name="voorkeur_kookt_zelf" /></FormControl>
            <FormControl><FormLabel>Voorkeur voor eetstijlen (bv. vegetarisch)?</FormLabel><Input name="voorkeur_eetstijl" /></FormControl>
            <FormControl><FormLabel>Hoeveel tijd heb je voor maaltijdbereiding?</FormLabel><Input name="voorkeur_tijd_maaltijdbereiding" /></FormControl>
          </Stack>
        );
      case 'metingen':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Vetpercentage (%)</FormLabel><Input name="metingen_vetpercentage" /></FormControl>
            <FormControl><FormLabel>Spiermassa (kg)</FormLabel><Input name="metingen_spiermassa" /></FormControl>
            <FormControl><FormLabel>Middelomtrek (cm)</FormLabel><Input name="metingen_middelomtrek" /></FormControl>
          </Stack>
        );
      case 'afspraak':
        return (
          <Stack spacing={4}>
            <FormControl><FormLabel>Wat verwacht je van mij als coach?</FormLabel><Textarea name="afspraak_verwachting_coach" /></FormControl>
            <FormControl><FormLabel>Hoe vaak wil je contactmomenten?</FormLabel><Textarea name="afspraak_contactmomenten" /></FormControl>
            <FormControl><FormLabel>Op welke manier wil je gecoacht worden?</FormLabel><Textarea name="afspraak_manier_coaching" /></FormControl>
          </Stack>
        );
      case 'registratie':
        return (
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>E-mailadres</FormLabel>
              <Input type="email" value={registrationData.email} onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Wachtwoord</FormLabel>
              <Input type="password" value={registrationData.password} onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })} />
            </FormControl>
          </Stack>
        );
      default:
        return <Text>Onbekende stap.</Text>;
    }
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={'gray.50'}>
      <Stack spacing={8} mx={'auto'} maxW={'2xl'} w={'full'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Intake & Registratie</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            Doorloop de stappen om uw account aan te maken.
          </Text>
        </Stack>
        <Box rounded={'lg'} bg={'white'} boxShadow={'lg'} p={8}>
          <Stack spacing={6}>
            <Progress value={((currentStep + 1) / intakeSteps.length) * 100} size="sm" colorScheme="teal" />
            <Heading fontSize="2xl" fontWeight="md" textAlign="center">{intakeSteps[currentStep].title}</Heading>
            <form onSubmit={currentStep < intakeSteps.length - 1 ? handleNext : handleRegister}>
              {renderStep()}
              {error && <Alert status="error" mt={4}><AlertIcon />{error}</Alert>}
              <Button
                mt={8}
                w="full"
                type="submit"
                colorScheme="teal"
                isLoading={isLoading}
              >
                {currentStep < intakeSteps.length - 1 ? 'Volgende Stap' : 'Account Aanmaken'}
              </Button>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Intake;
