import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Spinner,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { uploadService } from '../../services/upload.service';
import toast from '../../utils/toast';

export interface AvatarUploadProps {
  value?: string;
  publicId?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  publicId,
  name,
  size = 'xl',
  onChange,
  folder = 'avatars',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.4)', 'rgba(212, 175, 55, 0.4)');
  const gold = useColorModeValue('#A87916', '#D4AF37');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid image type. Please select a JPEG, PNG, or WebP file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadService.uploadSingle(file, folder);

      if (publicId && publicId !== res.publicId) {
        uploadService.deleteImage(publicId).catch(() => {});
      }

      onChange(res.secureUrl || res.url, res.publicId);
      toast.success('Avatar updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (publicId) {
      uploadService.deleteImage(publicId).catch(() => {});
    }
    onChange('', undefined);
    toast.success('Avatar removed');
  };

  return (
    <Box position="relative" display="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style={{ display: 'none' }}
      />

      <Box
        borderRadius="full"
        p={1}
        border="2px solid"
        borderColor={borderCol}
        position="relative"
        cursor="pointer"
        onClick={() => fileInputRef.current?.click()}
        _hover={{ borderColor: gold }}
      >
        <Avatar size={size} src={value} name={name} />

        {isUploading && (
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            bg="rgba(0,0,0,0.6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="md" color={gold} />
          </Box>
        )}

        {/* Camera Overlay Icon */}
        {!isUploading && (
          <Box
            position="absolute"
            bottom={0}
            right={0}
            w={8}
            h={8}
            borderRadius="full"
            bg="linear-gradient(135deg, #A87916 0%, #D4AF37 100%)"
            color="#000000"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 2px 6px rgba(0,0,0,0.4)"
          >
            <Icon as={FiCamera} w={4} h={4} />
          </Box>
        )}
      </Box>

      {/* Remove option if avatar exists */}
      {value && !isUploading && (
        <IconButton
          aria-label="Remove avatar"
          size="xs"
          icon={<FiTrash2 />}
          colorScheme="red"
          variant="solid"
          borderRadius="full"
          position="absolute"
          top={0}
          right={0}
          onClick={handleRemove}
        />
      )}
    </Box>
  );
};

export default AvatarUpload;

