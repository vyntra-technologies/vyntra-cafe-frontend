import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Input,
  Button,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
  Flex,
  Divider,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Checkbox,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  const [isLoading, setIsLoading] = useState(false);

  const inputBg = useColorModeValue('#FFFFFF', '#151515');
  const borderColor = useColorModeValue('rgba(182, 138, 58, 0.22)', 'rgba(212, 168, 83, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#1C1C1C', '#FFFFFF');
  const goldAccent = useColorModeValue('#B68A3A', '#D4A853');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0D');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Fields Required',
        description: 'Please enter both your email address and password.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });

      toast({
        title: `Welcome to ${BRAND_CONFIG.name}!`,
        description: 'You have signed in successfully.',
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      // Check if there was a pending action (e.g. add to cart or order now)
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
      } else {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
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
    <AuthLayout
      title={`Welcome Back`}
      subtitle={`Sign in to enjoy reservations, exclusive seasonal tasting previews, and swift table ordering.`}
      image="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
      quote="Dining is an intimacy, coffee is a ritual. We honor both with meticulous precision."
      quoteAuthor={`Master Barista, ${BRAND_CONFIG.name}`}
    >
      <Box as="form" onSubmit={handleLogin}>
        {pendingAction && (
          <Flex
            p={3.5}
            mb={5}
            borderRadius="xl"
            bg={useColorModeValue('rgba(168, 121, 22, 0.08)', 'rgba(212, 175, 55, 0.1)')}
            border="1px solid"
            borderColor={goldAccent}
            align="center"
            gap={3}
          >
            <Box color={goldAccent} flexShrink={0}>
              <FiAlertCircle size={18} />
            </Box>
            <Text fontSize="xs" color={headingColor} fontWeight="600">
              Please sign in to complete your pending order or reservation.
            </Text>
          </Flex>
        )}

        <VStack spacing={4} align="stretch">
          {/* Email Address */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1.5} color={headingColor}>
              Email Address
            </Text>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiMail />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
                fontSize="sm"
                borderRadius="xl"
                _focus={{
                  borderColor: goldAccent,
                  boxShadow: `0 0 0 1px ${goldAccent}`,
                }}
                isRequired
              />
            </InputGroup>
          </Box>

          {/* Password */}
          <Box>
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontWeight="600" fontSize="xs" color={headingColor}>
                Password
              </Text>
              <ChakraLink
                as={RouterLink}
                to="/forgot-password"
                fontSize="xs"
                color={goldAccent}
                fontWeight="600"
                _hover={{ textDecoration: 'underline' }}
              >
                Forgot password?
              </ChakraLink>
            </Flex>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiLock />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
                fontSize="sm"
                borderRadius="xl"
                _focus={{
                  borderColor: goldAccent,
                  boxShadow: `0 0 0 1px ${goldAccent}`,
                }}
                isRequired
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  size="sm"
                  color={textColor}
                  icon={showPassword ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowPassword(!showPassword)}
                  _hover={{ bg: 'transparent', color: headingColor }}
                />
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Remember me Checkbox */}
          <Flex justify="space-between" align="center" pt={1}>
            <Checkbox
              isChecked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              colorScheme="yellow"
              size="sm"
            >
              <Text fontSize="xs" color={textColor}>
                Remember my session
              </Text>
            </Checkbox>
          </Flex>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            h="52px"
            bgGradient={useColorModeValue(
              'linear(to-r, #A87916, #D4AF37)',
              'linear(to-r, #D4AF37, #F5D76E)'
            )}
            color={btnTextColor}
            fontSize="sm"
            fontWeight="700"
            borderRadius="xl"
            leftIcon={<FiLogIn />}
            isLoading={isLoading}
            loadingText="Verifying..."
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
              opacity: 0.95,
            }}
            _active={{ transform: 'translateY(0)' }}
            mt={2}
          >
            Sign In to {BRAND_CONFIG.name}
          </Button>
        </VStack>

        <Divider borderColor={borderColor} my={6} />

        <Text fontSize="xs" color={textColor} textAlign="center">
          Don't have an account yet?{' '}
          <ChakraLink
            as={RouterLink}
            to="/register"
            fontWeight="700"
            color={goldAccent}
            _hover={{ textDecoration: 'underline' }}
          >
            Create an Account
          </ChakraLink>
        </Text>
      </Box>
    </AuthLayout>
  );
};
