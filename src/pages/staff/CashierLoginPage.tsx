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
  FiCreditCard,
  FiArrowRight,
  FiAlertCircle,
  FiShield,
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { BRAND_CONFIG } from '../../config/brand.config';

const CASHIER_AUTHORIZED_ROLES = [
  'CASHIER',
  'OWNER',
  'ADMIN',
  'MANAGER',
  'SUPER_ADMIN',
];

export const CashierLoginPage: React.FC = () => {
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

  const from = (location.state as any)?.from?.pathname || '/cashier/dashboard';

  // Palette tokens - Emerald Green & Gold POS Palette
  const bg = useColorModeValue('#FAF9F6', '#080A08');
  const cardBg = useColorModeValue('#FFFFFF', '#101411');
  const inputBg = useColorModeValue('#F4F3EF', '#161B17');
  const greenAccent = useColorModeValue('#28A745', '#48BB78');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const borderCol = useColorModeValue('rgba(40, 167, 69, 0.25)', 'rgba(72, 187, 120, 0.25)');

  // Redirect if already authenticated as Cashier / Manager
  useEffect(() => {
    if (isAuthenticated && user) {
      if (CASHIER_AUTHORIZED_ROLES.includes((user.role || '').toUpperCase())) {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both your registered cashier email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedUser = await login({
        email: email.trim(),
        password,
        role: 'CASHIER',
        selectedRole: 'CASHIER',
      });

      // Role authorization verification
      const userRoleUpper = (authenticatedUser.role || '').toUpperCase();
      if (!CASHIER_AUTHORIZED_ROLES.includes(userRoleUpper)) {
        await logout();
        setErrorMessage(
          `Access Denied: Your account (${authenticatedUser.email}) has the role "${authenticatedUser.role}". The POS Billing Terminal is strictly reserved for authorized cashier personnel.`
        );
        toast({
          title: 'Access Restricted',
          description: 'Account role is not authorized for the Cashier POS Terminal.',
          status: 'error',
          duration: 4500,
          position: 'top-right',
        });
        return;
      }

      toast({
        title: 'Authentication Successful',
        description: `Welcome to POS Register, ${authenticatedUser.name}!`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Authentication failed. Please verify your cashier credentials.';
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
    <Box minH="100vh" bg={bg} color={textCol} position="relative" py={{ base: 6, md: 12 }}>
      {/* Ambient background glow */}
      <Box
        position="absolute"
        top="-10%"
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '350px', md: '650px' }}
        h={{ base: '250px', md: '350px' }}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(72,187,120,0.12) 0%, transparent 70%)"
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
              bg="linear-gradient(135deg, #48BB78 0%, #2F855A 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 15px rgba(72, 187, 120, 0.35)"
            >
              <Icon as={FiCreditCard} boxSize={5} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontFamily="heading" fontWeight="extrabold" fontSize="md" letterSpacing="0.08em" color={textCol}>
                {BRAND_CONFIG.name}
              </Text>
              <Text fontSize="10px" color={greenAccent} letterSpacing="0.12em" textTransform="uppercase" fontWeight="bold">
                Point of Sale & Billing Terminal
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

      {/* Main Form Container */}
      <Container maxW="md" position="relative" zIndex={2}>
        <Box
          bg={cardBg}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderCol}
          p={{ base: 6, md: 8 }}
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
            bgGradient="linear(to-r, #48BB78, #28A745)"
          />

          {/* Form Header */}
          <VStack align="start" spacing={1} mb={6}>
            <HStack spacing={2}>
              <Badge
                colorScheme="green"
                variant="subtle"
                fontSize="11px"
                px={2.5}
                py={0.5}
                borderRadius="md"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                POS Register
              </Badge>
              <Text fontSize="xs" color={mutedCol}>
                Role Verified Access
              </Text>
            </HStack>

            <Heading
              fontSize={{ base: '2xl', md: '3xl' }}
              fontFamily="heading"
              fontWeight="extrabold"
              color={textCol}
              letterSpacing="-0.02em"
            >
              CASHIER LOGIN
            </Heading>

            <Text fontSize="sm" color={mutedCol}>
              Sign in to manage register billing, unsettled table bills, payments and receipts.
            </Text>
          </VStack>

          {/* Error Alert */}
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

          {/* Form */}
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="semibold" color={textCol}>
                  Cashier Email Address
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" color={mutedCol}>
                    <FiMail />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="cashier@vyntra.cafe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    borderColor={borderCol}
                    fontSize="sm"
                    borderRadius="xl"
                    _focus={{
                      borderColor: greenAccent,
                      boxShadow: `0 0 0 1px ${greenAccent}`,
                    }}
                    isRequired
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <Flex justify="space-between" align="center" mb={1}>
                  <FormLabel fontSize="xs" fontWeight="semibold" color={textCol} mb={0}>
                    Password
                  </FormLabel>
                  <ChakraLink
                    as={RouterLink}
                    to="/forgot-password"
                    fontSize="xs"
                    color={greenAccent}
                    fontWeight="semibold"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Forgot?
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
                      borderColor: greenAccent,
                      boxShadow: `0 0 0 1px ${greenAccent}`,
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
              </FormControl>

              <Flex justify="space-between" align="center" pt={1}>
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="green"
                  size="sm"
                >
                  <Text fontSize="xs" color={mutedCol}>
                    Keep register signed in
                  </Text>
                </Checkbox>
                <HStack spacing={1}>
                  <Icon as={FiShield} boxSize={3.5} color={greenAccent} />
                  <Text fontSize="xs" color={mutedCol}>
                    Encrypted
                  </Text>
                </HStack>
              </Flex>

              <Button
                type="submit"
                size="lg"
                h="52px"
                bgGradient="linear(to-r, #48BB78, #28A745)"
                color="white"
                fontSize="md"
                fontWeight="extrabold"
                borderRadius="xl"
                rightIcon={<FiArrowRight />}
                isLoading={isSubmitting}
                loadingText="Verifying register..."
                boxShadow="0 8px 20px rgba(40, 167, 69, 0.3)"
                _hover={{
                  opacity: 0.95,
                  transform: 'translateY(-2px)',
                }}
                mt={2}
              >
                Sign In to POS Register
              </Button>
            </VStack>
          </Box>

          <Box mt={6} pt={4} borderTop="1px solid" borderColor={borderCol} textAlign="center">
            <Text fontSize="xs" color={mutedCol}>
              Need cashier access? Managed by{' '}
              <ChakraLink as={RouterLink} to="/admin/login" color={goldAccent} fontWeight="bold">
                Restaurant Administration
              </ChakraLink>
              .
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

