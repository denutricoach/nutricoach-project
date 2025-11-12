// frontend/src/components/UserDashboard.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// CORRECTE IMPORTS
import WeightChart from '../components/WeightChart';
import GoalsModal from '../components/GoalsModal';
import RecipeModal from '../components/RecipeModal';
import FeedbackModal from '../components/FeedbackModal';



import { AddIcon, CheckIcon, InfoIcon, SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Box, Button, Flex, Input, Stack, Heading, Text, useToast, Grid, GridItem, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Spinner, Image,
  Tabs, TabList, TabPanels, Tab, TabPanel, HStack,
  Badge // *** STAP 1: IMPORTEER DE BADGE ***
} from '@chakra-ui/react';

// De FoodLogModal blijft ongewijzigd
function FoodLogModal({ isOpen, onClose, onVerstuur }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const logData = {
      ontbijt: event.target.ontbijt.value,
      lunch: event.target.lunch.value,
      diner: event.target.diner.value,
      tussendoortjes: event.target.tussendoortjes.value,
    };
    onVerstuur(logData);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Log je voeding van vandaag</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <Textarea name="ontbijt" placeholder="Wat had je als ontbijt?" />
            <Textarea name="lunch" placeholder="Wat had je als lunch?" />
            <Textarea name="diner" placeholder="Wat had je als diner?" />
            <Textarea name="tussendoortjes" placeholder="Had je nog tussendoortjes?" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" mr={3} type="submit" leftIcon={<CheckIcon />}> Log Voeding </Button>
          <Button onClick={onClose}>Annuleren</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Het UserChatInterface component blijft ongewijzigd
function UserChatInterface({ user, coachId, unreadCount, onTabChange }) {
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [isAiChatLoading, setIsAiChatLoading] = useState(false);
  const [coachChatMessages, setCoachChatMessages] = useState([]);
  const [currentCoachMessage, setCurrentCoachMessage] = useState('');
  const [isCoachChatLoading, setIsCoachChatLoading] = useState(false);
  const aiChatEndRef = useRef(null);
  const coachChatEndRef = useRef(null);

  useEffect(() => {
    if (user?.chatHistory) {
      setAiChatHistory(user.chatHistory);
    }
  }, [user]);

  useEffect(() => { aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiChatHistory]);
  useEffect(() => { coachChatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [coachChatMessages]);

  const fetchCoachMessages = useCallback(async () => {
    if (!coachId || !user) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/messages/${coachId}`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Kon coachberichten niet ophalen.');
      const data = await response.json();
      setCoachChatMessages(data);
    } catch (error) {
      console.error(error);
    }
  }, [coachId, user]);

  useEffect(() => {
    if (coachId) {
      fetchCoachMessages();
      const interval = setInterval(fetchCoachMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchCoachMessages, coachId]);

  const sendToAI = async (e) => {
    e.preventDefault();
    if (!currentAiMessage.trim()) return;
    const token = localStorage.getItem('token');
    const userMessage = { role: 'user', content: currentAiMessage };
    const newHistory = [...aiChatHistory, userMessage];
    setAiChatHistory(newHistory);
    setCurrentAiMessage('');
    setIsAiChatLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ message: currentAiMessage }),
      });
      const data = await response.json();
      setAiChatHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setAiChatHistory([...newHistory, { role: 'assistant', content: 'Sorry, er is iets misgegaan.' }]);
    } finally {
      setIsAiChatLoading(false);
    }
  };

  const sendToCoach = async (e) => {
    e.preventDefault();
    if (!currentCoachMessage.trim() || !coachId) return;
    const token = localStorage.getItem('token');
    setIsCoachChatLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ receiverId: coachId, content: currentCoachMessage }),
      });
      const sentMessage = await response.json();
      setCoachChatMessages([...coachChatMessages, sentMessage]);
      setCurrentCoachMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCoachChatLoading(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" height="100%" display="flex" flexDirection="column">
      {/* *** STAP 4: ONCHANGE HANDLER TOEVOEGEN *** */}
      <Tabs isFitted variant="enclosed" colorScheme="teal" flex="1" display="flex" flexDirection="column" onChange={onTabChange}>
        <TabList>
          <Tab>Chat met AI</Tab>
          <Tab position="relative">
            Chat met Coach
            {/* *** STAP 6: DE BADGE TOEVOEGEN *** */}
            {unreadCount > 0 && (
              <Badge 
                colorScheme="red" 
                variant="solid" 
                borderRadius="full"
                position="absolute"
                top="1.5"
                right="1.5"
                fontSize="0.7em"
                px={2}
              >
                {unreadCount}
              </Badge>
            )}
          </Tab>
        </TabList>
        <TabPanels flex="1" overflowY="hidden">
          <TabPanel height="100%" display="flex" flexDirection="column">
            <Stack spacing={4} overflowY="auto" flex="1" pr={2} mb={4}>
              {aiChatHistory.map((msg, index) => (
                <Flex key={index} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
                  <Box bg={msg.role === 'user' ? 'teal.500' : 'gray.100'} color={msg.role === 'user' ? 'white' : 'black'} borderRadius="lg" p={3} maxWidth="80%">
                    <Text whiteSpace="pre-wrap">{msg.content}</Text>
                  </Box>
                </Flex>
              ))}
              {isAiChatLoading && <Spinner alignSelf="flex-start" />}
              <div ref={aiChatEndRef} />
            </Stack>
            <Box as="form" onSubmit={sendToAI}>
              <HStack>
                <Input value={currentAiMessage} onChange={(e) => setCurrentAiMessage(e.target.value)} placeholder="Vraag iets aan de AI..." disabled={isAiChatLoading} />
                <Button type="submit" colorScheme="teal" isLoading={isAiChatLoading}><ArrowForwardIcon /></Button>
              </HStack>
            </Box>
          </TabPanel>
          <TabPanel height="100%" display="flex" flexDirection="column">
            <Stack spacing={4} overflowY="auto" flex="1" pr={2} mb={4}>
              {coachChatMessages.map((msg) => {
                const isUser = String(msg.sender) === String(user._id);
                return (
                  <Flex key={msg._id} justify={isUser ? 'flex-end' : 'flex-start'}>
                    <Box
                      bg={isUser ? 'blue.500' : 'gray.100'}
                      color={isUser ? 'white' : 'black'}
                      borderRadius="lg" p={3} maxWidth="80%"
                    >
                      <Text whiteSpace="pre-wrap">{msg.content}</Text>
                    </Box>
                  </Flex>
                );
              })}
              <div ref={coachChatEndRef} />
            </Stack>
            <Box as="form" onSubmit={sendToCoach}>
              <HStack>
                <Input value={currentCoachMessage} onChange={(e) => setCurrentCoachMessage(e.target.value)} placeholder="Typ een bericht aan je coach..." disabled={isCoachChatLoading} />
                <Button type="submit" colorScheme="blue" isLoading={isCoachChatLoading}><ArrowForwardIcon /></Button>
              </HStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}


function UserDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [gewichtInput, setGewichtInput] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const toast = useToast();
  const [recipes, setRecipes] = useState('');
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [coachId, setCoachId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // *** STAP 2: STATE VOOR ONGELEZEN BERICHTEN ***

  const { isOpen: isFoodLogOpen, onOpen: onFoodLogOpen, onClose: onFoodLogClose } = useDisclosure();
  const { isOpen: isGoalsOpen, onOpen: onGoalsOpen, onClose: onGoalsClose } = useDisclosure();
  const { isOpen: isRecipeOpen, onOpen: onRecipeOpen, onClose: onRecipeClose } = useDisclosure();
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const [userResponse, weightResponse, photoResponse, coachResponse] = await Promise.all([
          fetch(`${API_URL}/api/users/me`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/logs/gewicht`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/photos`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/coach/default`, { headers: { 'x-auth-token': token } })
        ]);

        if (!userResponse.ok || !coachResponse.ok) throw new Error('Sessie verlopen of data niet gevonden');
        
        const userData = await userResponse.json();
        const weightData = await weightResponse.json();
        const photoData = await photoResponse.json();
        const coachData = await coachResponse.json();

        setUser(userData);
        setWeightLogs(weightData);
        setPhotos(photoData);
        setCoachId(coachData._id);

      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // *** STAP 3: USEEFFECT OM ONGELEZEN BERICHTEN OP TE HALEN ***
  useEffect(() => {
    if (!coachId) return; // Wacht tot de coachId bekend is

    const fetchUnread = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/messages/unread-count/${coachId}`, {
          headers: { 'x-auth-token': token },
        });
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Kon ongelezen berichten niet ophalen", error);
      }
    };

    fetchUnread(); // Haal direct op
    const interval = setInterval(fetchUnread, 5000); // En daarna elke 5 seconden

    return () => clearInterval(interval);
  }, [coachId]);

  // *** STAP 5: FUNCTIE OM BERICHTEN ALS GELEZEN TE MARKEREN ***
  const markAsRead = async () => {
    if (!coachId || unreadCount === 0) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/messages/mark-as-read/${coachId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      setUnreadCount(0); // Zet de teller direct op 0 in de UI
    } catch (error) {
      console.error("Kon berichten niet als gelezen markeren", error);
    }
  };

  const handleTabChange = (index) => {
    // Index 1 is de "Chat met Coach" tab
    if (index === 1) {
      markAsRead();
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('progressPhoto', file);
    toast({ title: 'Foto uploaden...', status: 'info', duration: null, isClosable: true });
    try {
      const response = await fetch(`${API_URL}/api/photos/upload`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      toast.closeAll();
      if (!response.ok) throw new Error('Upload mislukt');
      const newPhoto = await response.json();
      setPhotos([newPhoto, ...photos]);
      toast({ title: 'Upload Gelukt!', status: 'success' });
    } catch (error) {
      toast.closeAll();
      toast({ title: 'Fout bij uploaden', description: error.message, status: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const vindRecept = async () => {
    onRecipeOpen();
    setIsRecipeLoading(true);
    setRecipes('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/recipes/generate`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setRecipes(data.recipes);
    } catch (error) {
      setRecipes(`Kon geen recepten ophalen. Fout: ${error.message}`);
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const logGewicht = async (event) => {
    event.preventDefault();
    if (!gewichtInput) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/log/gewicht`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ gewicht: gewichtInput }),
      });
      const newLog = { gewicht: gewichtInput, datum: new Date().toISOString() };
      setWeightLogs([...weightLogs, newLog]);
      toast({ title: 'Gewicht gelogd!', status: 'success' });
    } catch (error) {
      toast({ title: 'Fout bij loggen', status: 'error' });
    } finally {
      setGewichtInput('');
    }
  };

  const logVoeding = async (logData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/log/voeding-analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(logData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Analyse mislukt');
      setFeedback(data);
      onFeedbackOpen();
    } catch (error) {
      toast({ title: 'Fout bij loggen', description: 'Kon je voeding niet analyseren.', status: 'error' });
    }
  };

  if (isLoading) {
    return <Flex justify="center" align="center" height="80vh"><Spinner size="xl" /></Flex>;
  }

  return (
    <>
      <FoodLogModal isOpen={isFoodLogOpen} onClose={onFoodLogClose} onVerstuur={logVoeding} />
      <GoalsModal isOpen={isGoalsOpen} onClose={onGoalsClose} user={user} />
      <RecipeModal isOpen={isRecipeOpen} onClose={onRecipeClose} recipes={recipes} isLoading={isRecipeLoading} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={onFeedbackClose} feedback={feedback} />

      <Flex justify="space-between" align="center" mb={8}>
        <Heading as="h1" size="lg">Welkom, {user?.algemeen_naam}!</Heading>
        <Button onClick={handleLogout}>Uitloggen</Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
        <GridItem>
          <Stack spacing={8}>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <Heading fontSize="xl" mb={4}>Mijn Voortgang</Heading>
              <WeightChart weightData={weightLogs} />
            </Box>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <Heading fontSize="xl" mb={4}>Mijn Voortgang in Beeld</Heading>
              <Stack spacing={4}>
                <Input type="file" id="photo-upload-input" accept="image/*" onChange={handlePhotoUpload} display="none" />
                <Button as="label" htmlFor="photo-upload-input" colorScheme="purple" cursor="pointer" leftIcon={<AddIcon />}>
                  Nieuwe Foto Toevoegen
                </Button>
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                  {photos.map(photo => (
                    <GridItem key={photo._id}>
                      <Box as="a" href={photo.imageUrl} target="_blank" rel="noopener noreferrer">
                        <Image src={photo.imageUrl} alt={photo.caption || 'Voortgangsfoto'} borderRadius="md" objectFit="cover" />
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
                {photos.length === 0 && <Text>Je hebt nog geen foto's geüpload.</Text>}
              </Stack>
            </Box>
          </Stack>
        </GridItem>

        <GridItem>
          <Flex direction="column" height="100%">
            <UserChatInterface user={user} coachId={coachId} unreadCount={unreadCount} onTabChange={handleTabChange} />
            
            <Box mt={4} p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <Stack spacing={4}>
                <Heading fontSize="md">Snelle Acties</Heading>
                <Flex direction={{ base: 'column', sm: 'row' }} gap={3}>
                  <Button onClick={onFoodLogOpen} flex="1" colorScheme="orange" variant="outline" leftIcon={<AddIcon />}>
                    Voeding Loggen
                  </Button>
                  <Button onClick={onGoalsOpen} flex="1" colorScheme="blue" variant="outline" leftIcon={<InfoIcon />}>
                    Mijn Doelen
                  </Button>
                  <Button onClick={vindRecept} isLoading={isRecipeLoading} flex="1" colorScheme="green" variant="solid" leftIcon={<SearchIcon />}>
                    Vind een Recept
                  </Button>
                </Flex>
                <form onSubmit={logGewicht}>
                  <Flex gap={3}>
                    <Input type="number" step="0.1" value={gewichtInput} onChange={(e) => setGewichtInput(e.target.value)} placeholder="Log je gewicht (kg)" />
                    <Button type="submit" colorScheme="teal" leftIcon={<CheckIcon />}>Log</Button>
                  </Flex>
                </form>
              </Stack>
            </Box>
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
}

export default UserDashboard;
