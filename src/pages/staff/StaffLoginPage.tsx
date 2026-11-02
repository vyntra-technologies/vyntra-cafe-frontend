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
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Icon,
  Divider,
  SimpleGrid,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCoffee,
  FiShoppingBag,
  FiDollarSign,
  FiShield,
  FiArrowRight,
  FiKey,
} from 'react-icons/fi';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import toast from '../../utils/toast';

export const StaffLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Colors
  const bg = useColorModeValue('#FAF9F6', '#0B0B0D');
  const cardBg = useColorModeValue('#FFFFFF', '#141418');
  const borderCol = useColorModeValue('rgba(168, 121, 22, 0.2)', 'rgba(212, 175, 55, 0.2)');
  const textCol = useColorModeValue('#171717', '#F4F4F6');
  const mutedCol = useColorModeValue('#71717A', '#A1A1AA');
  const gold = useColorModeValue('#A87916', '#D4AF37');

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) {
      errs.email = 'Staff email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const redirectByRole = (role: string) => {
    const upper = (role || '').toUpperCase();
    if (upper.includes('CHEF') || upper.includes('KITCHEN')) {
      return '/chef/dashboard';
    }
    if (upper.includes('CASHIER')) {
      return '/cashier/dashboard';
    }
    if (upper.includes('WAITER') || upper.includes('SERVICE')) {
      return '/waiter/dashboard';
    }
    // Management, Manager, Admin, Owner
    return '/manager/dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${user.name || 'Staff member'}!`);

      // Check if user came from a specific page
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && fromPath !== '/staff/login') {
        navigate(fromPath, { replace: true });
      } else {
        const dest = redirectByRole(user.role);
        navigate(dest, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Staff authentication failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (staffEmail: string, pass: string) => {
    setEmail(staffEmail);
    setPassword(pass);
    setErrors({});
  };

  return (
    <Box minH="100vh" bg={bg} color={textCol} position="relative" overflow="hidden">
      {/* Top Bar */}
      <Flex justify="space-between" align="center" px={{ base: 4, md: 8 }} py={4}>
        <HStack as={RouterLink} to="/" spacing={2} textDecoration="none">
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg="linear-gradient(135deg, #D4AF37 0%, #A87916 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(212, 175, 55, 0.3)"
          >
            <Text fontWeight="black" fontSize="sm" color="black">
              VC
            </Text>
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontFamily="heading" fontWeight="bold" fontSize="md" letterSpacing="0.08em">
              VYNTRA CAFE
            </Text>
            <Text fontSize="10px" color={mutedCol} textTransform="uppercase" letterSpacing="0.1em">
              Staff Portal
            </Text>
          </VStack>
        </HStack>
        <ThemeToggle />
      </Flex>

      {/* Main Container */}
      <Flex minH="calc(100vh - 80px)" align="center" justify="center" px={4} py={8}>
        <Box
          bg={cardBg}
          w="full"
          maxW="480px"
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderCol}
          p={{ base: 6, md: 8 }}
          boxShadow="0 20px 40px rgba(0, 0, 0, 0.25)"
        >
          {/* Header */}
          <VStack spacing={2} textAlign="center" mb={6}>
            <Badge
              bg="rgba(212, 175, 55, 0.15)"
              color={gold}
              border="1px solid"
              borderColor={gold}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Terminal Access
            </Badge>
            <Heading fontSize={{ base: '2xl', md: '3xl' }} fontFamily="heading">
              Staff Workstation
            </Heading>
            <Text fontSize="sm" color={mutedCol}>
              Sign in with your staff credentials to enter POS, Kitchen, Waiter, or Operations terminals.
            </Text>
          </VStack>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="xs" fontWeight="semibold" textTransform="uppercase">
                  Staff Email
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMail} color={mutedCol} />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="e.g. cashier@vyntra.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    focusBorderColor={gold}
                    bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="xs" fontWeight="semibold" textTransform="uppercase">
                  Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiLock} color={mutedCol} />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter workstation password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    focusBorderColor={gold}
                    bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                w="full"
                h="46px"
                bg="linear-gradient(135deg, #D4AF37 0%, #A87916 100%)"
                color="black"
                fontWeight="bold"
                fontSize="sm"
                letterSpacing="0.05em"
                isLoading={isLoading}
                loadingText="Verifying..."
                rightIcon={<FiArrowRight />}
                _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                _active={{ transform: 'translateY(0)' }}
                boxShadow="0 4px 15px rgba(212, 175, 55, 0.3)"
                mt={2}
              >
                ACCESS WORKSTATION
              </Button>
            </VStack>
          </form>

          {/* Quick Demo Staff Logins */}
          <Box mt={6} pt={6} borderTop="1px solid" borderColor={borderCol}>
            <HStack justify="space-between" mb={3}>
              <HStack spacing={1.5}>
                <Icon as={FiKey} color={gold} />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.05em">
                  Demo Staff Roles
                </Text>
              </HStack>
              <Text fontSize="10px" color={mutedCol}>
                1-click auto fill
              </Text>
            </HStack>

            <SimpleGrid columns={2} spacing={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor={borderCol}
                leftIcon={<FiCoffee />}
                justifyContent="flex-start"
                onClick={() => fillCredentials('owner@vyntra.com', 'VyntraOwner2026')}
                _hover={{ borderColor: gold, color: gold }}
              >
                <VStack align="start" spacing={0} fontSize="xs">
                  <Text fontWeight="bold">Waiter Terminal</Text>
                  <Text fontSize="10px" color={mutedCol}>
                    owner@vyntra.com
                  </Text>
                </VStack>
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor={borderCol}
                leftIcon={<FiShoppingBag />}
                justifyContent="flex-start"
                onClick={() => fillCredentials('chef@vyntra.com', 'CafeStaff2026!')}
                _hover={{ borderColor: gold, color: gold }}
              >
                <VStack align="start" spacing={0} fontSize="xs">
                  <Text fontWeight="bold">Kitchen Display</Text>
                  <Text fontSize="10px" color={mutedCol}>
                    chef@vyntra.com
                  </Text>
                </VStack>
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor={borderCol}
                leftIcon={<FiDollarSign />}
                justifyContent="flex-start"
                onClick={() => fillCredentials('cashier@vyntra.com', 'CafeStaff2026!')}
                _hover={{ borderColor: gold, color: gold }}
              >
                <VStack align="start" spacing={0} fontSize="xs">
                  <Text fontWeight="bold">Cashier POS</Text>
                  <Text fontSize="10px" color={mutedCol}>
                    cashier@vyntra.com
                  </Text>
                </VStack>
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor={borderCol}
                leftIcon={<FiShield />}
                justifyContent="flex-start"
                onClick={() => fillCredentials('admin@vyntra.com', 'CafeStaff2026!')}
                _hover={{ borderColor: gold, color: gold }}
              >
                <VStack align="start" spacing={0} fontSize="xs">
                  <Text fontWeight="bold">Manager Portal</Text>
                  <Text fontSize="10px" color={mutedCol}>
                    admin@vyntra.com
                  </Text>
                </VStack>
              </Button>
            </SimpleGrid>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

