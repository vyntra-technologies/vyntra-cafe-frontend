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
  Progress,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUserPlus,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../config/brand.config';

export const RegisterPage: React.FC = () => {
  const { register, executePendingAction } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputBg = useColorModeValue('#FFFFFF', '#151515');
  const borderColor = useColorModeValue('rgba(182, 138, 58, 0.22)', 'rgba(212, 168, 83, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#1C1C1C', '#FFFFFF');
  const goldAccent = useColorModeValue('#B68A3A', '#D4A853');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0D');

  // Password Strength validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;
  const progressPercent = (strengthScore / 3) * 100;
  const progressColor =
    strengthScore === 3 ? 'green.400' : strengthScore === 2 ? 'yellow.400' : 'red.400';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      toast({
        title: 'Password Security Requirements',
        description:
          'Please ensure your password has at least 8 characters, 1 uppercase letter, and 1 number.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please verify that your confirmation password matches.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to our terms of service and dining policies.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      toast({
        title: `Welcome to the ${BRAND_CONFIG.name} Family!`,
        description: 'Your account was created successfully and you are signed in.',
        status: 'success',
        duration: 4000,
        position: 'top-right',
      });

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
        navigate('/');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Registration could not be completed. The email or phone might already be in use.';
      toast({
        title: 'Registration Failed',
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
      title="Create Your Account"
      subtitle={`Join ${BRAND_CONFIG.name} to reserve tables, explore signature tastings, and earn dining privileges.`}
      image="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
      quote="Culinary art begins with reverence for the ingredient and devotion to the guest."
      quoteAuthor={`Culinary Director, ${BRAND_CONFIG.name}`}
    >
      <Box as="form" onSubmit={handleRegister}>
        <VStack spacing={3.5} align="stretch">
          {/* Full Name */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Full Name
            </Text>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiUser />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="e.g. Julian Hayes"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          {/* Email Address */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Email Address
            </Text>
            <InputGroup size="md">
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

          {/* Phone Number */}
          <Box>
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontWeight="600" fontSize="xs" color={headingColor}>
                Phone Number
              </Text>
              <Text fontSize="10px" color={textColor}>
                Optional for SMS updates
              </Text>
            </Flex>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiPhone />
              </InputLeftElement>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
                fontSize="sm"
                borderRadius="xl"
                _focus={{
                  borderColor: goldAccent,
                  boxShadow: `0 0 0 1px ${goldAccent}`,
                }}
              />
            </InputGroup>
          </Box>

          {/* Password */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Password
            </Text>
            <InputGroup size="md">
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

            {/* Password Strength Feedback */}
            {password.length > 0 && (
              <Box mt={2}>
                <Progress
                  value={progressPercent}
                  size="xs"
                  borderRadius="full"
                  colorScheme={strengthScore === 3 ? 'green' : strengthScore === 2 ? 'yellow' : 'red'}
                  bg={useColorModeValue('gray.100', 'gray.800')}
                  mb={2}
                />
                <HStack spacing={3} wrap="wrap" fontSize="11px">
                  <HStack spacing={1} color={hasMinLength ? 'green.400' : textColor}>
                    <Box>{hasMinLength ? <FiCheck size={11} /> : '•'}</Box>
                    <Text>8+ characters</Text>
                  </HStack>
                  <HStack spacing={1} color={hasUppercase ? 'green.400' : textColor}>
                    <Box>{hasUppercase ? <FiCheck size={11} /> : '•'}</Box>
                    <Text>1 uppercase</Text>
                  </HStack>
                  <HStack spacing={1} color={hasNumber ? 'green.400' : textColor}>
                    <Box>{hasNumber ? <FiCheck size={11} /> : '•'}</Box>
                    <Text>1 number</Text>
                  </HStack>
                </HStack>
              </Box>
            )}
          </Box>

          {/* Confirm Password */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Confirm Password
            </Text>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiLock />
              </InputLeftElement>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  size="sm"
                  color={textColor}
                  icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  _hover={{ bg: 'transparent', color: headingColor }}
                />
              </InputRightElement>
            </InputGroup>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <HStack spacing={1} color="red.400" mt={1} fontSize="11px">
                <FiAlertCircle size={12} />
                <Text>Passwords do not match yet.</Text>
              </HStack>
            )}
          </Box>

          {/* Terms Agreement Checkbox */}
          <Flex align="start" gap={2} pt={1}>
            <Checkbox
              isChecked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              colorScheme="yellow"
              size="sm"
              mt={0.5}
            >
              <Text fontSize="xs" color={textColor} lineHeight="1.4">
                I agree to the {BRAND_CONFIG.name} Dining Terms, Guest Etiquette, and Privacy Policy.
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
            leftIcon={<FiUserPlus />}
            isLoading={isLoading}
            loadingText="Creating account..."
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
              opacity: 0.95,
            }}
            _active={{ transform: 'translateY(0)' }}
            mt={2}
          >
            Create Your Account
          </Button>
        </VStack>

        <Divider borderColor={borderColor} my={5} />

        <Text fontSize="xs" color={textColor} textAlign="center">
          Already have an account?{' '}
          <ChakraLink
            as={RouterLink}
            to="/login"
            fontWeight="700"
            color={goldAccent}
            _hover={{ textDecoration: 'underline' }}
          >
            Sign In
          </ChakraLink>
        </Text>
      </Box>
    </AuthLayout>
  );
};
