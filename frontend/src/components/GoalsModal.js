// frontend/src/components/GoalsModal.js

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Heading,
  Stack,
  StackDivider
} from '@chakra-ui/react';

function GoalsModal({ isOpen, onClose, user }) {
  // Toon niets als er geen gebruiker is
  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Jouw Doelen & Motivatie</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack divider={<StackDivider />} spacing='4'>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                Jouw Hoofddoel
              </Heading>
              <Text pt='2' fontSize='sm'>
                {user.hulpvraag_doel || 'Niet opgegeven'}
              </Text>
            </Box>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                Reden voor coaching
              </Heading>
              <Text pt='2' fontSize='sm'>
                {user.hulpvraag_reden || 'Niet opgegeven'}
              </Text>
            </Box>
            <Box>
              <Heading size='xs' textTransform='uppercase'>
                Jouw motivatie (score 1-10)
              </Heading>
              <Text pt='2' fontSize='sm'>
                {user.motivatie_score || 'Niet opgegeven'}
              </Text>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='teal' onClick={onClose}>
            Sluiten
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default GoalsModal;
