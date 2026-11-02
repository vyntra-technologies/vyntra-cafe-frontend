import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Icon,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiLock, FiMail, FiArrowLeft, FiShield } from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { BRAND_CONFIG } from '../../config/brand.config';

const ADMIN_MANAGEMENT_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'SUPER_ADMIN',
  'MANAGER',
];

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Palette tokens
  const bg = useColorModeValue('#FAF9F6', '#0B0B0D');
  const cardBg = useColorModeValue('#FFFFFF', '#151518');
  const inputBg = useColorModeValue('#F1EFEA', '#1D1D22');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#171717', '#FFFFFF');
  const mutedColor = useColorModeValue('#71717A', '#A1A1AA');
  const borderColor = useColorModeValue('rgba(168, 121, 22, 0.2)', 'rgba(212, 175, 55, 0.2)');

  // Redirect if already authenticated as Admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (ADMIN_MANAGEMENT_ROLES.includes(user.role)) {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedUser = await login({
        email: email.trim(),
        password,
        role: 'ADMIN',
        selectedRole: 'ADMIN',
      });

      // Verify user has an admin / management role
      if (!ADMIN_MANAGEMENT_ROLES.includes(authenticatedUser.role)) {
        await logout();
        setErrorMessage(
          `Access Denied: Your account (${authenticatedUser.email}) is registered as a "${authenticatedUser.role}". The Operations Portal is strictly reserved for verified Restaurant Managers and Administrators.`
        );
        toast({
          title: 'Access Restricted',
          description: 'Customer accounts cannot access the management dashboard.',
          status: 'error',
          duration: 4000,
        });
        return;
      }

      toast({
        title: 'Authentication Successful',
        description: `Welcome to the Operations Portal, ${authenticatedUser.name}`,
        status: 'success',
        duration: 3000,
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Invalid administrator credentials. Please check your email and password.';
      setErrorMessage(msg);
      toast({
        title: 'Login Failed',
        description: msg,
        status: 'error',
        duration: 3500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" bg={bg} direction={{ base: 'column', md: 'row' }}>
      {/* Left Visual Cinematic Hero (Desktop only) */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="50%"
        position="relative"
        bgImage="url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1600&auto=format&fit=crop')"
        bgSize="cover"
        bgPosition="center"
        flexDirection="column"
        justifyContent="space-between"
        p={12}
      >
        {/* Dark gold luxury overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, rgba(11, 11, 13, 0.94) 0%, rgba(21, 21, 24, 0.88) 60%, rgba(168, 121, 22, 0.3) 100%)"
          backdropFilter="blur(2px)"
        />

        {/* Top Branding */}
        <Box position="relative" zIndex={2}>
          <HStack spacing={3} align="center">
            <Flex
              w="42px"
              h="42px"
              borderRadius="full"
              border="2px solid"
              borderColor={goldAccent}
              color={goldAccent}
              align="center"
              justify="center"
              fontSize="lg"
              fontWeight="bold"
            >
              V
            </Flex>
            <Box>
              <Text
                fontFamily="heading"
                fontSize="2xl"
                fontWeight="800"
                color="#FFFFFF"
                letterSpacing="0.1em"
              >
                VYNTRA CAFE
              </Text>
              <Text fontSize="10px" color={goldAccent} letterSpacing="0.25em" textTransform="uppercase">
                MILO RESTAURANT MANAGEMENT SYSTEM
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Middle Visual Catchphrase */}
        <Box position="relative" zIndex={2} maxW="500px">
          <Badge
            bg={goldAccent}
            color="black"
            px={3}
            py={1}
            borderRadius="sm"
            fontSize="10px"
            fontWeight="bold"
            letterSpacing="0.1em"
            mb={4}
          >
            ENTERPRISE RESTAURANT SUITE
          </Badge>
          <Heading
            fontSize="4xl"
            fontFamily="heading"
            color="#FFFFFF"
            lineHeight="1.2"
            letterSpacing="-0.02em"
            mb={4}
          >
            Orchestrating Gastronomy with Precision.
          </Heading>
          <Text fontSize="sm" color="#D4D4D8" lineHeight="relaxed">
            Centralized operations engine for floor seating, dynamic menu publishing, live kitchen order tickets, and institutional audit reporting.
          </Text>
        </Box>

        {/* Bottom Metadata */}
        <Box position="relative" zIndex={2}>
          <Text fontSize="11px" color="#A1A1AA" letterSpacing="0.05em">
            &copy; {new Date().getFullYear()} Vyntra Solutions. All rights reserved.
          </Text>
        </Box>
      </Box>

      {/* Right Login Container */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        p={{ base: 6, sm: 10, md: 12 }}
        position="relative"
      >
        {/* Top Controls */}
        {/* Top Control Bar with Theme Toggle */}
        <Flex
          position="absolute"
          top={{ base: 4, md: 8 }}
          right={{ base: 4, md: 8 }}
          justify="flex-end"
          align="center"
        >
          <ThemeToggle />
        </Flex>

        {/* Login Card */}
        <Box
          w="100%"
          maxW="440px"
          bg={cardBg}
          p={{ base: 6, sm: 8 }}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="2xl"
          mt={{ base: 12, md: 0 }}
        >
          {/* Card Header */}
          <Box mb={6} textAlign="center">
            <Flex
              w={12}
              h={12}
              borderRadius="xl"
              bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
              color={goldAccent}
              align="center"
              justify="center"
              mx="auto"
              mb={4}
              border="1px solid"
              borderColor={borderColor}
            >
              <Icon as={FiShield} boxSize={6} />
            </Flex>

            <Heading
              fontSize="2xl"
              fontFamily="heading"
              color={textColor}
              fontWeight="700"
              letterSpacing="-0.02em"
            >
              Operations Portal
            </Heading>
            <Text fontSize="xs" color={mutedColor} mt={1}>
              Sign in with your verified management credentials
            </Text>
          </Box>

          {/* Error Banner */}
          {errorMessage && (
            <Alert
              status="error"
              borderRadius="lg"
              mb={6}
              fontSize="xs"
              bg={useColorModeValue('red.50', 'rgba(229, 62, 62, 0.15)')}
              borderColor="red.400"
              borderWidth="1px"
              color={useColorModeValue('red.800', 'red.200')}
            >
              <AlertIcon color="red.400" />
              <Box>
                <AlertTitle fontWeight="700">Authentication Error</AlertTitle>
                <AlertDescription display="block">{errorMessage}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
                  Admin Email Address
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    type="email"
                    placeholder="manager@vyntracafe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    borderColor={borderColor}
                    color={textColor}
                    fontSize="sm"
                    _hover={{ borderColor: goldAccent }}
                    _focus={{ borderColor: goldAccent, boxShadow: `0 0 0 1px ${goldAccent}` }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color={mutedColor} textTransform="uppercase">
                  Password
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter security key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    borderColor={borderColor}
                    color={textColor}
                    fontSize="sm"
                    _hover={{ borderColor: goldAccent }}
                    _focus={{ borderColor: goldAccent, boxShadow: `0 0 0 1px ${goldAccent}` }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      size="sm"
                      variant="ghost"
                      color={mutedColor}
                      _hover={{ color: goldAccent }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                w="100%"
                h="46px"
                bg={goldAccent}
                color="black"
                fontWeight="700"
                fontSize="sm"
                letterSpacing="0.05em"
                mt={2}
                isLoading={isSubmitting}
                loadingText="Verifying Session..."
                _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                transition="all 0.2s ease"
              >
                ACCESS DASHBOARD
              </Button>

              <Button
                type="button"
                variant="outline"
                size="xs"
                w="100%"
                borderColor={borderColor}
                color={goldAccent}
                _hover={{ bg: inputBg }}
                onClick={() => {
                  setEmail('owner@vyntra.com');
                  setPassword('VyntraOwner2026');
                }}
              >
                Auto-fill Owner Credentials
              </Button>
            </VStack>
          </form>

          {/* Footer Note */}
          <Box mt={6} pt={4} borderTop="1px solid" borderColor={borderColor} textAlign="center">
            <Text fontSize="11px" color={mutedColor}>
              Are you a restaurant customer?{' '}
              <ChakraLink as={RouterLink} to="/login" color={goldAccent} fontWeight="600">
                Customer Sign In &rarr;
              </ChakraLink>
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

