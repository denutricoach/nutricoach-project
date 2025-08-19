// frontend/src/components/RecipeModal.js

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
  Spinner,
  Flex
} from '@chakra-ui/react';

function RecipeModal({ isOpen, onClose, recipes, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Jouw Persoonlijke Recepten</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" />
              <Text ml={4}>De AI-Chef is voor je aan het koken...</Text>
            </Flex>
          ) : (
            <Text whiteSpace="pre-wrap">{recipes || "Klik op 'Genereer Recepten' om te beginnen."}</Text>
          )}
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

export default RecipeModal;
