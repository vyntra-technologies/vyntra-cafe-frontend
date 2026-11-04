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
  InputLeftElement,
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
  Checkbox,
  Container,
} from '@chakra-ui/react';
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiShield,
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { BRAND_CONFIG } from '../../config/brand.config';

const MANAGER_AUTHORIZED_ROLES = [
  'OWNER',
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER',
];

export const ManagerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/manager/dashboard';

  // Palette tokens - Royal Indigo & Luxury Gold Executive Theme
  const bg = useColorModeValue('#FAF9F6', '#090A0E');
  const cardBg = useColorModeValue('#FFFFFF', '#12131A');
  const inputBg = useColorModeValue('#F4F3EF', '#181A22');
  const indigoAccent = useColorModeValue('#6366F1', '#818CF8');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const borderCol = useColorModeValue('rgba(99, 102, 241, 0.25)', 'rgba(129, 140, 248, 0.25)');

  // Redirect if already authenticated as Manager / Admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (MANAGER_AUTHORIZED_ROLES.includes((user.role || '').toUpperCase())) {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your management staff email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedUser = await login({
        email: email.trim(),
        password,
        role: 'MANAGER',
        selectedRole: 'MANAGER',
      });

      // Role authorization verification
      const userRoleUpper = (authenticatedUser.role || '').toUpperCase();
      if (!MANAGER_AUTHORIZED_ROLES.includes(userRoleUpper)) {
        await logout();
        setErrorMessage(
          `Access Denied: Your account (${authenticatedUser.email}) has the role "${authenticatedUser.role}". The Manager Console is strictly reserved for authorized management personnel.`
        );
        toast({
          title: 'Access Restricted',
          description: 'Account role is not authorized for the Manager Command Console.',
          status: 'error',
          duration: 4500,
          position: 'top-right',
        });
        return;
      }

      toast({
        title: 'Authentication Successful',
        description: `Welcome to Management Operations, ${authenticatedUser.name}!`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Authentication failed. Please verify your management credentials.';
      setErrorMessage(msg);
      toast({
        title: 'Login Failed',
        description: msg,
        status: 'error',
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg} py={{ base: 6, md: 10 }} px={4}>
      {/* Top Header */}
      <Flex maxW="1200px" mx="auto" justify="space-between" align="center" mb={6}>
        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          size="sm"
          color={mutedCol}
          leftIcon={<FiArrowLeft />}
          _hover={{ color: textCol }}
        >
          Return to Guest Storefront
        </Button>
        <HStack spacing={3}>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={useColorModeValue('rgba(99, 102, 241, 0.1)', 'rgba(129, 140, 248, 0.15)')}
            color={indigoAccent}
            border="1px solid"
            borderColor={borderCol}
            fontSize="xs"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            gap={1.5}
          >
            <Icon as={FiShield} /> Manager Portal
          </Badge>
          <ThemeToggle />
        </HStack>
      </Flex>

      <Container maxW="md">
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.35)"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle Accent Bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg={`linear-gradient(90deg, ${indigoAccent} 0%, ${goldAccent} 100%)`}
          />

          <VStack spacing={6} align="stretch">
            {/* Header / Emblem */}
            <VStack spacing={2} textAlign="center">
              <Box
                w={14}
                h={14}
                borderRadius="xl"
                bg={useColorModeValue('rgba(99, 102, 241, 0.1)', 'rgba(129, 140, 248, 0.15)')}
                border="1px solid"
                borderColor={borderCol}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                color={indigoAccent}
              >
                <Icon as={FiBriefcase} w={7} h={7} />
              </Box>

              <Heading as="h1" size="lg" color={textCol} fontWeight="bold" letterSpacing="-0.02em">
                Manager Console
              </Heading>
              <Text fontSize="sm" color={mutedCol}>
                Operations Oversight & Floor Management Terminal
              </Text>
            </VStack>

            {/* Error Message */}
            {errorMessage && (
              <Alert
                status="error"
                variant="subtle"
                borderRadius="xl"
                bg="rgba(239, 68, 68, 0.1)"
                border="1px solid rgba(239, 68, 68, 0.3)"
                color="#EF4444"
              >
                <AlertIcon color="#EF4444" />
                <Box fontSize="xs">
                  <AlertTitle fontWeight="bold">Access Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="semibold" color={textCol}>
                    Manager Email
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color={mutedCol}>
                      <FiMail />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@vyntra.com"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)')}
                      _focus={{
                        borderColor: indigoAccent,
                        boxShadow: `0 0 0 1px ${indigoAccent}`,
                      }}
                      color={textCol}
                      fontSize="sm"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="semibold" color={textCol}>
                    Secure Password
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color={mutedCol}>
                      <FiLock />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)')}
                      _focus={{
                        borderColor: indigoAccent,
                        boxShadow: `0 0 0 1px ${indigoAccent}`,
                      }}
                      color={textCol}
                      fontSize="sm"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Toggle password visibility"
                        variant="ghost"
                        size="sm"
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        color={mutedCol}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Flex justify="space-between" align="center" fontSize="xs">
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="purple"
                    color={mutedCol}
                  >
                    Remember terminal
                  </Checkbox>
                  <ChakraLink as={RouterLink} to="/forgot-password" color={indigoAccent}>
                    Forgot password?
                  </ChakraLink>
                </Flex>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Authenticating..."
                  w="full"
                  h="44px"
                  bg={`linear-gradient(135deg, ${indigoAccent} 0%, #4F46E5 100%)`}
                  color="#FFFFFF"
                  fontWeight="bold"
                  fontSize="sm"
                  letterSpacing="0.03em"
                  _hover={{
                    opacity: 0.92,
                    transform: 'translateY(-1px)',
                  }}
                  rightIcon={<FiArrowRight />}
                  mt={2}
                >
                  Enter Manager Console
                </Button>
              </VStack>
            </form>

            {/* Other Portals Switcher */}
            <Box
              pt={4}
              borderTop="1px solid"
              borderColor={useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)')}
            >
              <Text fontSize="xs" color={mutedCol} textAlign="center" mb={2}>
                Staff Switch:
              </Text>
              <HStack justify="center" spacing={4} fontSize="xs">
                <ChakraLink as={RouterLink} to="/waiter/login" color={goldAccent}>
                  Waiter
                </ChakraLink>
                <Text color={mutedCol}>•</Text>
                <ChakraLink as={RouterLink} to="/chef/login" color={goldAccent}>
                  Kitchen
                </ChakraLink>
                <Text color={mutedCol}>•</Text>
                <ChakraLink as={RouterLink} to="/cashier/login" color={goldAccent}>
                  Cashier
                </ChakraLink>
                <Text color={mutedCol}>•</Text>
                <ChakraLink as={RouterLink} to="/admin/login" color={goldAccent}>
                  Admin
                </ChakraLink>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
export default ManagerLoginPage;

