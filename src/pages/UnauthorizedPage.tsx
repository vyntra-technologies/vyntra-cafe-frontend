import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock, FiHome, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleUtils';
import { BRAND_CONFIG } from '../config/brand.config';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || (location.state as any)?.userRole || 'Guest';
  const attemptedPath = (location.state as any)?.attemptedPath || location.pathname;
  const dashboardPath = getRoleDashboardPath(user?.role);

  // Styling Tokens
  const pageBg = useColorModeValue('#FAF9F6', '#08080A');
  const cardBg = useColorModeValue('#FFFFFF', '#121215');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.25)', 'rgba(212, 175, 55, 0.25)');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const gold = useColorModeValue('#A87916', '#D4AF37');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={pageBg} py={16} px={4} display="flex" alignItems="center">
      <Container maxW="lg">
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="2xl"
          p={{ base: 8, md: 10 }}
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle top gold accent bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg="linear-gradient(90deg, #A87916 0%, #D4AF37 50%, #A87916 100%)"
          />

          <VStack spacing={6}>
            {/* Lock Icon Emblem */}
            <Box
              w={20}
              h={20}
              borderRadius="full"
              bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
              border="1px solid"
              borderColor={borderCol}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <Icon as={FiLock} w={9} h={9} color={gold} />
            </Box>

            <VStack spacing={2}>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                bg="rgba(239, 68, 68, 0.15)"
                color="#EF4444"
                border="1px solid rgba(239, 68, 68, 0.3)"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                HTTP 403 — Restricted Area
              </Badge>
              <Heading as="h1" size="xl" color={textCol} fontWeight="bold" letterSpacing="-0.02em">
                Access Denied
              </Heading>
              <Text color={mutedCol} fontSize="sm" maxW="md">
                You do not have administrative or staff privileges to view this specific section of{' '}
                <Text as="span" color={gold} fontWeight="medium">
                  {BRAND_CONFIG.name}
                </Text>
                .
              </Text>
            </VStack>

            {/* Role Context Box */}
            <Box
              w="full"
              p={4}
              bg={useColorModeValue('#F4F3EF', '#18181D')}
              border="1px solid"
              borderColor={borderCol}
              borderRadius="xl"
              textAlign="left"
            >
              <VStack align="stretch" spacing={2} fontSize="xs">
                <HStack justify="space-between">
                  <Text color={mutedCol}>Current Authenticated Role:</Text>
                  <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md">
                    {userRole}
                  </Badge>
                </HStack>
                {attemptedPath && (
                  <HStack justify="space-between">
                    <Text color={mutedCol}>Requested Resource:</Text>
                    <Text color={textCol} fontFamily="mono">
                      {attemptedPath}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Action Buttons */}
            <VStack spacing={3} w="full">
              <Button
                w="full"
                h="46px"
                bg="linear-gradient(135deg, #A87916 0%, #D4AF37 100%)"
                color="#000000"
                fontWeight="bold"
                fontSize="sm"
                letterSpacing="0.04em"
                _hover={{
                  bg: 'linear-gradient(135deg, #B5841A 0%, #E5BD40 100%)',
                  transform: 'translateY(-1px)',
                }}
                leftIcon={<FiHome />}
                onClick={() => navigate(dashboardPath)}
              >
                Go to My Role Dashboard
              </Button>

              <Button
                w="full"
                h="44px"
                variant="outline"
                borderColor={borderCol}
                color={textCol}
                fontSize="sm"
                fontWeight="medium"
                _hover={{
                  bg: useColorModeValue('rgba(0, 0, 0, 0.04)', 'rgba(255, 255, 255, 0.04)'),
                }}
                leftIcon={<FiLogOut />}
                onClick={handleLogout}
              >
                Sign In with Different Account
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
export default UnauthorizedPage;

