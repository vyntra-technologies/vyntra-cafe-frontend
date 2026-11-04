import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  IconButton,
  Image,
  Progress,
  useColorModeValue,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiUploadCloud, FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import { uploadService, UploadedMedia } from '../../services/upload.service';
import toast from '../../utils/toast';

export interface ImageItem {
  url: string;
  publicId?: string;
}

export interface MultipleImageUploadProps {
  images: ImageItem[] | string[];
  publicIds?: string[];
  onChange: (images: string[], publicIds: string[]) => void;
  maxFiles?: number;
  folder?: string;
  label?: string;
  helperText?: string;
  maxSizeMB?: number;
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  images = [],
  publicIds = [],
  onChange,
  maxFiles = 6,
  folder = 'general',
  label = 'Upload Images',
  helperText = 'Select up to 6 images (JPEG, PNG, WebP up to 5MB each)',
  maxSizeMB = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize images to array of string URLs
  const currentUrls: string[] = images.map((item) => (typeof item === 'string' ? item : item.url));
  const currentPublicIds: string[] = [...publicIds];

  // Palette Tokens
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.25)', 'rgba(212, 175, 55, 0.25)');
  const borderHover = useColorModeValue('#A87916', '#D4AF37');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');

  const handleFilesProcess = async (files: File[]) => {
    if (files.length === 0) return;

    if (currentUrls.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const validFiles: File[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    for (const file of files) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        toast.error(`Skipped ${file.name}: invalid format (JPEG/PNG/WebP only)`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Skipped ${file.name}: exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(25);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 200);

      const uploaded: UploadedMedia[] = await uploadService.uploadMultiple(validFiles, folder);

      clearInterval(progressTimer);
      setUploadProgress(100);

      const newUrls = [...currentUrls, ...uploaded.map((u) => u.secureUrl || u.url)];
      const newPublicIds = [
        ...currentPublicIds,
        ...uploaded.map((u) => u.publicId).filter(Boolean) as string[],
      ];

      onChange(newUrls, newPublicIds);
      toast.success(`${uploaded.length} image(s) uploaded successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async (index: number) => {
    const targetPublicId = currentPublicIds[index];
    if (targetPublicId) {
      uploadService.deleteImage(targetPublicId).catch(() => {});
    }

    const updatedUrls = currentUrls.filter((_, i) => i !== index);
    const updatedPublicIds = currentPublicIds.filter((_, i) => i !== index);

    onChange(updatedUrls, updatedPublicIds);
    toast.success('Image removed');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesProcess(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesProcess(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <Box w="full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        style={{ display: 'none' }}
      />

      {/* Grid of uploaded images */}
      {currentUrls.length > 0 && (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3} mb={3}>
          {currentUrls.map((url, idx) => (
            <Box
              key={idx}
              position="relative"
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor={borderCol}
              bg={cardBg}
              h="110px"
            >
              <Image
                src={url}
                alt={`Image ${idx + 1}`}
                w="full"
                h="full"
                objectFit="cover"
                fallback={
                  <Flex h="full" align="center" justify="center" bg={useColorModeValue('#F4F3EF', '#18181D')}>
                    <Icon as={FiImage} color={mutedCol} />
                  </Flex>
                }
              />
              <IconButton
                aria-label="Delete image"
                icon={<FiTrash2 />}
                size="xs"
                color="#EF4444"
                bg="rgba(0,0,0,0.65)"
                position="absolute"
                top={1.5}
                right={1.5}
                _hover={{ bg: 'rgba(239,68,68,0.5)', color: '#FFFFFF' }}
                onClick={() => handleRemove(idx)}
              />
            </Box>
          ))}

          {/* Add more slot if under limit */}
          {currentUrls.length < maxFiles && (
            <Flex
              h="110px"
              borderRadius="lg"
              border="1px dashed"
              borderColor={borderCol}
              align="center"
              justify="center"
              direction="column"
              cursor="pointer"
              _hover={{ borderColor: borderHover, bg: useColorModeValue('rgba(168,121,22,0.04)', 'rgba(212,175,55,0.04)') }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon as={FiPlus} color={gold} w={5} h={5} mb={1} />
              <Text fontSize="xs" color={mutedCol}>
                Add More
              </Text>
            </Flex>
          )}
        </SimpleGrid>
      )}

      {/* Empty Dropzone */}
      {currentUrls.length === 0 && (
        <Box
          border="2px dashed"
          borderColor={isDragOver ? borderHover : borderCol}
          borderRadius="xl"
          p={6}
          textAlign="center"
          cursor="pointer"
          bg={isDragOver ? useColorModeValue('rgba(168, 121, 22, 0.04)', 'rgba(212, 175, 55, 0.04)') : 'transparent'}
          transition="all 0.2s"
          _hover={{ borderColor: borderHover }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <VStack spacing={3}>
            <Box
              w={12}
              h={12}
              borderRadius="full"
              bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={gold}
            >
              <Icon as={FiUploadCloud} w={6} h={6} />
            </Box>

            <VStack spacing={1}>
              <Text fontSize="sm" fontWeight="semibold" color={textCol}>
                {isUploading ? 'Uploading to Cloudinary...' : label}
              </Text>
              <Text fontSize="xs" color={mutedCol}>
                {helperText}
              </Text>
            </VStack>

            {isUploading && (
              <Box w="80%" maxW="200px">
                <Progress
                  value={uploadProgress}
                  size="xs"
                  colorScheme="yellow"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                />
              </Box>
            )}

            {!isUploading && (
              <Button
                size="xs"
                variant="outline"
                borderColor={borderCol}
                color={gold}
                _hover={{ bg: useColorModeValue('rgba(168, 121, 22, 0.08)', 'rgba(212, 175, 55, 0.08)') }}
              >
                Browse Files
              </Button>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default MultipleImageUpload;

