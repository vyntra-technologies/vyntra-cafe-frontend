import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Image,
  Progress,
  useColorModeValue,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiUploadCloud, FiTrash2, FiRefreshCw, FiImage } from 'react-icons/fi';
import { uploadService, UploadedMedia } from '../../services/upload.service';
import toast from '../../utils/toast';

export interface ImageUploadProps {
  value?: string;
  publicId?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  publicId,
  onChange,
  folder = 'general',
  label = 'Upload Image',
  helperText = 'JPEG, PNG or WebP up to 5MB',
  maxSizeMB = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Palette Tokens
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.25)', 'rgba(212, 175, 55, 0.25)');
  const borderHover = useColorModeValue('#A87916', '#D4AF37');
  const gold = useColorModeValue('#A87916', '#D4AF37');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');

  const handleFileProcess = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid image type. Please select a JPEG, PNG, or WebP file.');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Maximum allowed size is ${maxSizeMB}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      // Simulate progress indicator
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 200);

      const result: UploadedMedia = await uploadService.uploadSingle(file, folder);

      clearInterval(progressTimer);
      setUploadProgress(100);

      // Clean up previous image if we had a publicId
      if (publicId && publicId !== result.publicId) {
        uploadService.deleteImage(publicId).catch(() => {});
      }

      onChange(result.secureUrl || result.url, result.publicId);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = async () => {
    if (publicId) {
      try {
        await uploadService.deleteImage(publicId);
      } catch {
        // ignore delete failure on remove
      }
    }
    onChange('', undefined);
    toast.success('Image removed');
  };

  return (
    <Box w="full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: 'none' }}
      />

      {value ? (
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          border="1px solid"
          borderColor={borderCol}
          bg={cardBg}
          maxH="240px"
        >
          <Image
            src={value}
            alt={label}
            w="full"
            maxH="240px"
            objectFit="cover"
            fallback={
              <Flex h="160px" align="center" justify="center" bg={useColorModeValue('#F4F3EF', '#18181D')}>
                <Icon as={FiImage} w={8} h={8} color={mutedCol} />
              </Flex>
            }
          />

          {/* Action Overlay */}
          <Flex
            position="absolute"
            top={2}
            right={2}
            gap={2}
            bg="rgba(0,0,0,0.6)"
            p={1.5}
            borderRadius="lg"
            backdropFilter="blur(4px)"
          >
            <IconButton
              aria-label="Change image"
              size="sm"
              icon={<FiRefreshCw />}
              color="#FFFFFF"
              bg="rgba(255,255,255,0.15)"
              _hover={{ bg: 'rgba(255,255,255,0.25)' }}
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            />
            <IconButton
              aria-label="Remove image"
              size="sm"
              icon={<FiTrash2 />}
              color="#EF4444"
              bg="rgba(239,68,68,0.2)"
              _hover={{ bg: 'rgba(239,68,68,0.35)' }}
              onClick={handleRemove}
            />
          </Flex>
        </Box>
      ) : (
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

export default ImageUpload;

