// frontend/src/components/UserDetail.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';
import WeightChart from '../components/WeightChart'; // CORRECT

import {
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, Text, Spinner, Flex, Alert, AlertIcon, Grid, GridItem, Textarea, Button, Stack, Tag, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Input, HStack
} from '@chakra-ui/react';

import { CheckCircleIcon, WarningIcon, InfoIcon, ArrowForwardIcon } from '@chakra-ui/icons';

// Hulpfunctie getStatusTag
const getStatusTag = (status) => {
  switch (status) {
    case 'perfect':
      return { icon: CheckCircleIcon, colorScheme: 'green', text: 'Goed Bezig' };
    case 'te_veel':
      return { icon: WarningIcon, colorScheme: 'orange', text: 'Let Op' };
    case 'te_weinig':
      return { icon: InfoIcon, colorScheme: 'blue', text: 'Tip' };
    default:
      return null;
  }
};

// --- HET DIRECT CHAT COMPONENT ---
function DirectChat({ clientUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachId, setCoachId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setCoachId(decodedToken.user.id);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!clientUserId) return;
    const token = localStorage.getItem('token');
    try {
      // --- FIX: Gebruik process.env.REACT_APP_API_URL ---
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${clientUserId}`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Kon berichten niet ophalen.');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [clientUserId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !clientUserId) return;
    const token = localStorage.getItem('token');
    try {
      // --- FIX: Gebruik process.env.REACT_APP_API_URL ---
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ receiverId: clientUserId, content: newMessage }),
      });
      if (!response.ok) throw new Error('Kon bericht niet versturen.');
      const sentMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading && messages.length === 0) {
    return <Flex justify="center" align="center" height="100%"><Spinner /></Flex>;
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }

  return (
    <Card borderWidth="1px" borderRadius="lg" shadow="sm" height="100%" display="flex" flexDirection="column">
      <CardHeader><Heading size="md">Chat met Cliënt</Heading></CardHeader>
      <CardBody flex="1" overflowY="auto" p={4}>
        <Stack spacing={4}>
          {messages.map((msg) => {
            const isSentByCoach = String(msg.sender) === String(coachId);
            return (
              <Flex key={msg._id} justify={isSentByCoach ? 'flex-end' : 'flex-start'}>
                <Box
                  bg={isSentByCoach ? 'teal.500' : 'gray.100'}
                  color={isSentByCoach ? 'white' : 'black'}
                  borderRadius="lg" p={3} maxWidth="80%"
                >
                  <Text whiteSpace="pre-wrap">{msg.content}</Text>
                </Box>
              </Flex>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </CardBody>
      <Box p={4} borderTopWidth="1px">
        <form onSubmit={handleSendMessage}>
          <HStack>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ uw bericht..."
            />
            <Button type="submit" colorScheme="teal" aria-label="Verstuur bericht">
              <ArrowForwardIcon />
            </Button>
          </HStack>
        </form>
      </Box>
    </Card>
  );
}

// Component FoodLogHistory
function FoodLogHistory({ userId }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      try {
        // --- FIX: Gebruik process.env.REACT_APP_API_URL ---
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/foodlogs/${userId}`, {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) throw new Error('Kon voedingslogs niet ophalen.');
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;
  if (logs.length === 0) return <Text>Deze cliënt heeft nog geen voeding gelogd.</Text>;

  return (
    <Card borderWidth="1px" borderRadius="lg" shadow="sm">
      <CardHeader><Heading size="md">Voedingslog Geschiedenis</Heading></CardHeader>
      <CardBody>
        <Accordion allowToggle>
          {logs.map(log => {
            const statusTag = getStatusTag(log.feedbackStatus);
            return (
              <AccordionItem key={log._id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {new Date(log.datum).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Box>
                    {statusTag && (
                      <Tag colorScheme={statusTag.colorScheme} size="sm">
                        <statusTag.icon mr={2} />
                        {statusTag.text}
                      </Tag>
                    )}
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Stack spacing={3}>
                    {log.ontbijt && <Text><strong>Ontbijt:</strong> {log.ontbijt}</Text>}
                    {log.lunch && <Text><strong>Lunch:</strong> {log.lunch}</Text>}
                    {log.diner && <Text><strong>Diner:</strong> {log.diner}</Text>}
                    {log.tussendoortjes && <Text><strong>Tussendoortjes:</strong> {log.tussendoortjes}</Text>}
                    {log.feedbackMessage && (
                      <Box bg="gray.50" p={3} borderRadius="md" mt={2}>
                        <Text fontWeight="bold">AI Feedback:</Text>
                        <Text fontSize="sm" whiteSpace="pre-wrap">{log.feedbackMessage}</Text>
                      </Box>
                    )}
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardBody>
    </Card>
  );
}

// De detailgroepen
const detailGroups = {
  'Algemene Gegevens': ['algemeen_naam', 'algemeen_leeftijd', 'algemeen_lengte', 'algemeen_gewicht', 'algemeen_beroep', 'algemeen_leefsituatie'],
  'Hulpvraag & Doelstellingen': ['hulpvraag_reden', 'hulpvraag_doel', 'hulpvraag_eerdere_hulp', 'hulpvraag_termijn_doelen'],
  'Medische Voorgeschiedenis': ['medisch_aandoeningen', 'medisch_medicatie', 'medisch_allergieen_intoleranties', 'medisch_psychische_klachten'],
  'Voedingspatroon': ['voeding_gemiddelde_dag', 'voeding_aantal_maaltijden', 'voeding_maaltijden_overslaan', 'voeding_eetbuien_emotie_eten', 'voeding_waterinname', 'voeding_alcohol_cafeine'],
  'Beweegpatroon': ['beweeg_hoe_vaak', 'beweeg_welke_vormen', 'beweeg_conditie_ervaring'],
  'Slaap en Stress': ['slaap_kwaliteit', 'slaap_stress_ervaring', 'slaap_stress_invloed_eetgedrag'],
  'Motivatie & Omgeving': ['motivatie_score', 'motivatie_hulp', 'motivatie_ondersteuning_omgeving', 'motivatie_obstakels'],
  'Voedingsvoorkeuren & Leefstijl': ['voorkeur_producten_niet', 'voorkeur_kookt_zelf', 'voorkeur_eetstijl', 'voorkeur_tijd_maaltijdbereiding'],
  'Metingen': ['metingen_vetpercentage', 'metingen_spiermassa', 'metingen_middelomtrek'],
  'Afspraken & Verwachtingen': ['afspraak_verwachting_coach', 'afspraak_contactmomenten', 'afspraak_manier_coaching']
};

// De CoachAssistant component
function CoachAssistant({ userId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async (prompt) => {
    setIsLoading(true);
    setAnswer('');
    const token = localStorage.getItem('token');
    try {
      // --- FIX: Gebruik process.env.REACT_APP_API_URL ---
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ userId, question: prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAnswer(data.reply);
    } catch (error) {
      setAnswer(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepAnalysis = () => {
    const analysisPrompt = "Analyseer de volledige data van deze cliënt (intake, alle gewichtslogs, alle fotobeschrijvingen, en alle voedingslogs). Identificeer de belangrijkste successen, de grootste uitdagingen en de meest opvallende patronen. Geef drie concrete, positieve en actiegerichte adviezen die ik als coach aan deze cliënt kan geven.";
    handleAskAI(analysisPrompt);
  };

  const handleClientSummary = () => {
    const summaryPrompt = "Schrijf een kort, motiverend en positief bericht voor deze cliënt dat ik direct kan kopiëren en plakken. Begin met het benoemen van een specifiek, positief resultaat uit de data (bv. 'Ik zie dat je consistent je gewicht hebt gelogd, super!'). Geef vervolgens één simpele, aanmoedigende tip voor de komende week. Sluit af met een persoonlijke en motiverende zin.";
    handleAskAI(summaryPrompt);
  };

  return (
    <Card height="100%">
      <CardHeader><Heading size="md">AI Coach Assistent</Heading></CardHeader>
      <CardBody>
        <Stack spacing={4}>
          <Textarea
            placeholder="Stel een specifieke vraag over deze cliënt..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Button colorScheme="teal" onClick={() => handleAskAI(question)} isLoading={isLoading} flex="1">Vraag de AI</Button>
            <Button colorScheme="purple" onClick={handleDeepAnalysis} isLoading={isLoading} flex="1">Analyseer Voortgang</Button>
            <Button colorScheme="orange" onClick={handleClientSummary} isLoading={isLoading} flex="1">Genereer Samenvatting</Button>
          </Flex>
          {isLoading && <Spinner />}
          {answer && (
            <Box p={4} bg="gray.50" borderRadius="md" mt={4}>
              <Text whiteSpace="pre-wrap">{answer}</Text>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

// De UserDetail component
function UserDetail() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        // --- FIX: Gebruik process.env.REACT_APP_API_URL ---
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/user/${userId}`, {
          headers: { 'x-auth-token': token },
        });
        if (!response.ok) {
          throw new Error('Kon gebruiker details niet ophalen.');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  if (isLoading) {
    return <Flex justify="center" align="center" height="80vh"><Spinner size="xl" /></Flex>;
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }

  if (!user) {
    return <Alert status="warning"><AlertIcon />Gebruiker niet gevonden.</Alert>;
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={8}>Details voor: {user.algemeen_naam}</Heading>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <GridItem>
          <Stack spacing={6}>
            
            {user.weightLogs && user.weightLogs.length > 0 && (
              <Card borderWidth="1px" borderRadius="lg" shadow="sm">
                <CardHeader><Heading size="md">Gewichtsverloop</Heading></CardHeader>
                <CardBody>
                  <WeightChart weightData={user.weightLogs} />
                </CardBody>
              </Card>
            )}

            <FoodLogHistory userId={userId} />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {Object.entries(detailGroups).map(([groupName, keys]) => {
                const groupHasData = keys.some(key => user[key]);
                if (!groupHasData) return null;
                return (
                  <Card key={groupName} borderWidth="1px" borderRadius="lg" shadow="sm">
                    <CardHeader><Heading size="md">{groupName}</Heading></CardHeader>
                    <CardBody>
                      <Stack spacing={3}>
                        {keys.map(key => {
                          if (user[key]) {
                            const formattedKey = key.split('_').slice(1).join(' ');
                            return (
                              <Box key={key}>
                                <Text fontWeight="bold" textTransform="capitalize">{formattedKey}:</Text>
                                <Text>{String(user[key])}</Text>
                              </Box>
                            );
                          }
                          return null;
                        })}
                      </Stack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        </GridItem>
        <GridItem>
          <Stack spacing={8} height="calc(100vh - 200px)">
            <DirectChat clientUserId={userId} />
            <CoachAssistant userId={userId} />
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default UserDetail;
