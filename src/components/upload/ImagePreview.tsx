import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

export interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  caption?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
}) => {
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');

  if (!imageUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(5px)" />
      <ModalContent bg={cardBg} borderRadius="2xl" overflow="hidden" p={0}>
        <ModalCloseButton color="#FFFFFF" bg="rgba(0,0,0,0.5)" borderRadius="full" zIndex={2} />
        <ModalBody p={0}>
          <Image src={imageUrl} alt={title || 'Preview'} w="full" maxH="75vh" objectFit="contain" />
          {(title || caption) && (
            <VStack p={4} align="start" spacing={1}>
              {title && (
                <Text fontWeight="bold" fontSize="md" color={textCol}>
                  {title}
                </Text>
              )}
              {caption && (
                <Text fontSize="sm" color={mutedCol}>
                  {caption}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImagePreview;

