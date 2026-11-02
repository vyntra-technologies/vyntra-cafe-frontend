import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
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
  Checkbox,
  Link as ChakraLink,
  Divider,
  Container,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiShield,
  FiCoffee,
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { BRAND_CONFIG } from '../config/brand.config';

export const LoginPage: React.FC = () => {
  const { login, pendingAction, executePendingAction } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Palette Tokens - Luxury Black & Gold Theme
  const pageBg = useColorModeValue('#FAF9F6', '#08080A');
  const cardBg = useColorModeValue('#FFFFFF', '#121215');
  const inputBg = useColorModeValue('#F4F3EF', '#18181D');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.22)', 'rgba(212, 175, 55, 0.22)');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const gold = useColorModeValue('#A87916', '#D4AF37');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your registered email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const authenticatedUser = await login({
        email: email.trim(),
        password,
      });

      toast({
        title: `Welcome back, ${authenticatedUser.name}!`,
        description: `Successfully signed in to ${BRAND_CONFIG.name}.`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      // Check if user came from a specific redirect or pending cart action
      const action = executePendingAction();
      if (action) {
        if (action.itemPayload?.item) {
          addItem(
            action.itemPayload.item,
            action.itemPayload.quantity || 1,
            action.itemPayload.selectedVariant,
            action.itemPayload.selectedAddOns,
            action.itemPayload.notes
          );
        }
        navigate(action.redirectTo || '/checkout');
        return;
      }

      const fromState = (location.state as any)?.from?.pathname;
      if (fromState && fromState !== '/login') {
        navigate(fromState);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your email and password.';
      setErrorMessage(msg);
      toast({
        title: 'Sign In Failed',
        description: msg,
        status: 'error',
        duration: 4500,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg} color={textCol} position="relative" py={{ base: 6, md: 12 }}>
      {/* Ambient background glow */}
      <Box
        position="absolute"
        top="-10%"
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '400px', md: '750px' }}
        h={{ base: '300px', md: '450px' }}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)"
        filter="blur(60px)"
        pointerEvents="none"
      />

      {/* Top Header */}
      <Container maxW="5xl" mb={8}>
        <Flex justify="space-between" align="center">
          <HStack as={RouterLink} to="/" spacing={3} _hover={{ textDecoration: 'none' }}>
            <Box
              w={10}
              h={10}
              borderRadius="xl"
              bg="linear-gradient(135deg, #D4AF37 0%, #A87916 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 15px rgba(212, 175, 55, 0.35)"
            >
              <Text fontWeight="black" fontSize="sm" color="black">
                VC
              </Text>
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontFamily="heading" fontWeight="extrabold" fontSize="md" letterSpacing="0.08em" color={textCol}>
                {BRAND_CONFIG.name}
              </Text>
              <Text fontSize="10px" color={gold} letterSpacing="0.12em" textTransform="uppercase" fontWeight="bold">
                Guest Portal
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/"
              variant="ghost"
              size="sm"
              leftIcon={<FiArrowLeft />}
              color={mutedCol}
              _hover={{ color: textCol, bg: 'whiteAlpha.100' }}
            >
              Storefront
            </Button>
            <ThemeToggle />
          </HStack>
        </Flex>
      </Container>

      {/* Main Container */}
      <Container maxW="md" position="relative" zIndex={2}>
        <Box
          bg={cardBg}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderCol}
          p={{ base: 6, md: 10 }}
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.45)"
          position="relative"
          overflow="hidden"
        >
          {/* Top Decorative Border */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="4px"
            bgGradient="linear(to-r, #D4AF37, #A87916)"
          />

          {/* Form Header */}
          <VStack align="start" spacing={1} mb={6}>
            <HStack spacing={2}>
              <Badge
                colorScheme="yellow"
                variant="subtle"
                fontSize="11px"
                px={2.5}
                py={0.5}
                borderRadius="md"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Patron Sign In
              </Badge>
            </HStack>

            <Heading
              fontSize={{ base: '2xl', md: '3xl' }}
              fontFamily="heading"
              fontWeight="extrabold"
              color={textCol}
              letterSpacing="-0.02em"
            >
              Welcome Back
            </Heading>

            <Text fontSize="sm" color={mutedCol}>
              Sign in to manage dining reservations, track orders, and view reward points.
            </Text>
          </VStack>

          {/* Error Message Alert */}
          {errorMessage && (
            <Alert
              status="error"
              borderRadius="xl"
              mb={6}
              bg="rgba(229, 62, 62, 0.12)"
              border="1px solid"
              borderColor="red.400"
            >
              <AlertIcon as={FiAlertCircle} color="red.400" />
              <Box flex="1">
                <AlertTitle fontSize="sm" fontWeight="bold" color="red.300">
                  Authentication Failed
                </AlertTitle>
                <AlertDescription fontSize="xs" color={textCol} lineHeight="short">
                  {errorMessage}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Pending Action Banner */}
          {pendingAction && (
            <Alert
              status="info"
              borderRadius="xl"
              mb={6}
              bg="rgba(168, 121, 22, 0.12)"
              border="1px solid"
              borderColor={gold}
            >
              <AlertIcon as={FiAlertCircle} color={gold} />
              <Box flex="1">
                <AlertTitle fontSize="sm" fontWeight="bold" color={gold}>
                  Pending Order / Reservation
                </AlertTitle>
                <AlertDescription fontSize="xs" color={textCol}>
                  Please sign in to complete your selected dining order or reservation.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Authentication Form */}
          <Box as="form" onSubmit={handleLogin}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" fontSize="xs" mb={1.5} color={textCol}>
                  Email Address
                </Text>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color={mutedCol}>
                    <FiMail />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    borderColor={borderCol}
                    fontSize="sm"
                    borderRadius="xl"
                    _focus={{
                      borderColor: gold,
                      boxShadow: `0 0 0 1px ${gold}`,
                    }}
                    isRequired
                  />
                </InputGroup>
              </Box>

              <Box>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <Text fontWeight="semibold" fontSize="xs" color={textCol}>
                    Password
                  </Text>
                  <ChakraLink
                    as={RouterLink}
                    to="/forgot-password"
                    fontSize="xs"
                    color={gold}
                    fontWeight="semibold"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </ChakraLink>
                </Flex>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color={mutedCol}>
                    <FiLock />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    borderColor={borderCol}
                    fontSize="sm"
                    borderRadius="xl"
                    _focus={{
                      borderColor: gold,
                      boxShadow: `0 0 0 1px ${gold}`,
                    }}
                    isRequired
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      variant="ghost"
                      size="sm"
                      color={mutedCol}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      _hover={{ bg: 'transparent', color: textCol }}
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>

              <Flex justify="space-between" align="center" pt={1}>
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="yellow"
                  size="sm"
                >
                  <Text fontSize="xs" color={mutedCol}>
                    Keep me signed in
                  </Text>
                </Checkbox>

                <HStack spacing={1}>
                  <Icon as={FiShield} boxSize={3.5} color={gold} />
                  <Text fontSize="xs" color={mutedCol}>
                    Secure
                  </Text>
                </HStack>
              </Flex>

              <Button
                type="submit"
                size="lg"
                h="52px"
                bgGradient="linear(to-r, #D4AF37, #A87916)"
                color="black"
                fontSize="md"
                fontWeight="extrabold"
                borderRadius="xl"
                rightIcon={<FiArrowRight />}
                isLoading={isLoading}
                loadingText="Signing in..."
                boxShadow="0 8px 24px rgba(212, 175, 55, 0.25)"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(212, 175, 55, 0.4)',
                  opacity: 0.95,
                }}
                mt={2}
              >
                Sign In to Dining Account
              </Button>
            </VStack>
          </Box>

          <Divider borderColor={borderCol} my={6} />

          <VStack spacing={3} textAlign="center" fontSize="xs" color={mutedCol}>
            <Text>
              New patron to {BRAND_CONFIG.name}?{' '}
              <ChakraLink
                as={RouterLink}
                to="/register"
                fontWeight="bold"
                color={gold}
                _hover={{ textDecoration: 'underline' }}
              >
                Create an Account
              </ChakraLink>
            </Text>

            <Text fontSize="11px" color={mutedCol} pt={2}>
              Staff Portal:{' '}
              <ChakraLink as={RouterLink} to="/waiter/login" color={gold} mr={2}>
                Waiter
              </ChakraLink>
              &bull;{' '}
              <ChakraLink as={RouterLink} to="/chef/login" color={gold} mx={2}>
                Chef
              </ChakraLink>
              &bull;{' '}
              <ChakraLink as={RouterLink} to="/cashier/login" color={gold} mx={2}>
                Cashier
              </ChakraLink>
              &bull;{' '}
              <ChakraLink as={RouterLink} to="/admin/login" color={gold} ml={2}>
                Admin
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
