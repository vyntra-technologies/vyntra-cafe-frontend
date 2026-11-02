import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Input,
  Avatar,
  Divider,
  useColorModeValue,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiUser, FiClock, FiCalendar, FiMapPin, FiAward, FiSave } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';

export const CustomerProfilePage: React.FC = () => {
  const { user, customer, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your account information has been saved.',
        status: 'success',
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Could not update profile.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loyaltyPoints = customer?.loyaltyPoints || 120; // Active or introductory points

  return (
    <PageContainer maxW="5xl">
      <VStack spacing={2} align="flex-start" mb={8}>
        <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
          Customer Account & Profile
        </Heading>
        <Text fontSize="sm" color={textColor}>
          Manage your personal details, rewards points balance, and cafe dining preferences.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="flex-start">
        {/* Left Column: Loyalty & Stats */}
        <VStack spacing={6} align="stretch">
          {/* User Card */}
          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor} textAlign="center">
            <Avatar size="xl" name={user?.name || 'Customer'} src={user?.avatar} bg={accentColor} color="white" mx="auto" mb={3} />
            <Heading size="md" fontWeight="800" color={headingColor}>
              {user?.name}
            </Heading>
            <Text fontSize="xs" color={textColor} mb={2}>
              {user?.email}
            </Text>
            <Badge
              bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
              color={accentColor}
              variant="subtle"
              borderRadius="full"
              px={3}
              py={0.5}
            >
              Artisan Club Member
            </Badge>
          </Box>

          {/* Loyalty Points Card */}
          <Box
            bg={useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)')}
            p={6}
            borderRadius="3xl"
            borderWidth="1px"
            borderColor={accentColor}
          >
            <HStack color={accentColor} spacing={2} mb={2}>
              <FiAward />
              <Text fontWeight="800" fontSize="xs" letterSpacing="1px" textTransform="uppercase">
                LOYALTY REWARDS
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="800" color={headingColor}>
              {loyaltyPoints} <Text as="span" fontSize="sm" color={textColor} fontWeight="600">Points</Text>
            </Text>
            <Text fontSize="xs" color={textColor} mt={1}>
              Earn 1 point for every $10 spent. Redeemable for complimentary pastries, espresso upgrades, and exclusive bistro discounts.
            </Text>
          </Box>

          {/* Quick Shortcuts */}
          <VStack bg={cardBg} p={4} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} spacing={2} align="stretch">
            <Button as={RouterLink} to="/orders" variant="ghost" justifyContent="flex-start" leftIcon={<FiClock />} borderRadius="xl">
              Order History
            </Button>
            <Button as={RouterLink} to="/reservation-history" variant="ghost" justifyContent="flex-start" leftIcon={<FiCalendar />} borderRadius="xl">
              Reservations
            </Button>
            <Button as={RouterLink} to="/addresses" variant="ghost" justifyContent="flex-start" leftIcon={<FiMapPin />} borderRadius="xl">
              Saved Addresses
            </Button>
          </VStack>
        </VStack>

        {/* Right 2 Cols: Edit Profile Form */}
        <Box gridColumn={{ md: 'span 2' }}>
          <Box as="form" onSubmit={handleSaveProfile} bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Heading size="md" fontWeight="800" color={headingColor} mb={6}>
              Personal Details
            </Heading>

            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Full Name
                </Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Email Address (Primary Login)
                </Text>
                <Input
                  value={user?.email || ''}
                  isReadOnly
                  disabled
                  opacity={0.6}
                  borderRadius="xl"
                />
                <Text fontSize="10px" color={textColor} mt={1}>
                  Email cannot be changed directly for security reasons.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Phone Number
                </Text>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1-555-0199"
                  borderRadius="xl"
                />
                <Text fontSize="10px" color={textColor} mt={1}>
                  Used for order notifications and table reservation SMS alerts.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>
                  Avatar Image URL
                </Text>
                <Input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  borderRadius="xl"
                />
              </Box>

              <Divider borderColor={borderColor} my={2} />

              <Button
                type="submit"
                bg={accentColor}
                color={btnTextColor}
                _hover={{ opacity: 0.9 }}
                size="lg"
                h="12"
                borderRadius="xl"
                leftIcon={<FiSave />}
                isLoading={isSaving}
                fontWeight="700"
              >
                Save Changes
              </Button>
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </PageContainer>
  );
};
