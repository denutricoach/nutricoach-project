// frontend/src/components/FeedbackModal.js

import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, Text, Icon
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';

// Deze functie kiest het juiste icoon en de juiste kleur op basis van de status
const getFeedbackVisuals = (status) => {
  switch (status) {
    case 'perfect':
      return { icon: CheckCircleIcon, color: 'green.500', title: 'Goed Bezig!' };
    case 'te_veel':
      return { icon: WarningIcon, color: 'orange.500', title: 'Let Op!' };
    case 'te_weinig':
      return { icon: InfoIcon, color: 'blue.500', title: 'Een Tip voor Jou!' };
    default:
      return { icon: InfoIcon, color: 'gray.500', title: 'Feedback' };
  }
};

function FeedbackModal({ isOpen, onClose, feedback }) {
  // Als er geen feedback is, toon niets.
  if (!feedback) {
    return null;
  }

  // Haal het juiste icoon, kleur en standaard titel op
  const visuals = getFeedbackVisuals(feedback.status);
  const title = feedback.title || visuals.title;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent textAlign="center" p={4}>
        <ModalHeader>
          <Flex direction="column" align="center" justify="center">
            <Icon as={visuals.icon} w={16} h={16} color={visuals.color} mb={4} />
            <Text fontSize="2xl">{title}</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="lg" whiteSpace="pre-wrap">{feedback.message}</Text>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="teal" onClick={onClose}>
            Begrepen!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FeedbackModal;
