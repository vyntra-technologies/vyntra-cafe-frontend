import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react';
import { FiCamera } from 'react-icons/fi';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    url: string;
    title: string;
    category?: string;
    caption?: string;
  } | null;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  image,
}) => {
  if (!image) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay bg="rgba(11, 11, 11, 0.92)" backdropFilter="blur(16px)" />
      <ModalContent
        bg="#151515"
        border="1px solid rgba(212, 168, 83, 0.3)"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="0 25px 60px rgba(0, 0, 0, 0.8)"
        mx={4}
      >
        <ModalCloseButton
          color="#FFFFFF"
          _hover={{ color: '#D4A853', bg: 'rgba(212, 168, 83, 0.15)' }}
          zIndex={2}
          top={4}
          right={4}
          size="lg"
        />
        <ModalBody p={0}>
          <Box position="relative" maxH="75vh" overflow="hidden" bg="#0B0B0B">
            <Image
              src={image.url}
              alt={image.title}
              w="100%"
              h="100%"
              maxH="75vh"
              objectFit="contain"
            />
          </Box>
          <VStack align="start" p={6} spacing={2} bg="#151515">
            <HStack spacing={3}>
              {image.category && (
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="rgba(212, 168, 83, 0.15)"
                  color="#D4A853"
                  fontSize="xs"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                >
                  {image.category}
                </Badge>
              )}
              <HStack spacing={1} color="#9E9EA8" fontSize="xs">
                <FiCamera />
                <Text>Haute Gastronomy Archives</Text>
              </HStack>
            </HStack>
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: 'xl', md: '2xl' }}
              color="#FFFFFF"
              fontWeight="700"
            >
              {image.title}
            </Text>
            {image.caption && (
              <Text fontSize="sm" color="#9E9EA8" lineHeight="1.6">
                {image.caption}
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

