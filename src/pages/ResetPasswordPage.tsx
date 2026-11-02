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
  Progress,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiKey,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { authService } from '../services/auth.service';
import { BRAND_CONFIG } from '../config/brand.config';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const navigate = useNavigate();
  const toast = useToast();

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputBg = useColorModeValue('#FFFFFF', '#151518');
  const borderColor = useColorModeValue('#E3DFD7', '#282830');
  const textColor = useColorModeValue('#666666', '#A1A1AA');
  const headingColor = useColorModeValue('#171717', '#FFFFFF');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0D');

  // Password Strength validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;
  const progressPercent = (strengthScore / 3) * 100;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast({
        title: 'Token Missing',
        description: 'Please provide the password reset token from your email link.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      toast({
        title: 'Password Security Requirements',
        description:
          'Password must be at least 8 characters long and contain at least one uppercase letter and one number.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Mismatch',
        description: 'New password and confirm password do not match.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token: token.trim(), newPassword });
      toast({
        title: 'Password Reset Successful!',
        description: 'Your password has been securely updated. Please sign in.',
        status: 'success',
        duration: 4000,
        position: 'top-right',
      });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Password reset token is invalid or has expired.';
      toast({
        title: 'Reset Failed',
        description: msg,
        status: 'error',
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Establish a new, strong password to regain full access to your account."
      image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
      quote="Security and discretion are the quiet hallmarks of exceptional hospitality."
      quoteAuthor={`${BRAND_CONFIG.name} Security`}
    >
      <Box as="form" onSubmit={handleReset}>
        <VStack spacing={4} align="stretch">
          {/* Reset Token */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Security Reset Token
            </Text>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiKey />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Paste token or open email link"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                bg={inputBg}
                borderColor={borderColor}
                fontSize="xs"
                borderRadius="xl"
                _focus={{
                  borderColor: goldAccent,
                  boxShadow: `0 0 0 1px ${goldAccent}`,
                }}
                isRequired
              />
            </InputGroup>
          </Box>

          {/* New Password */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              New Password
            </Text>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color={textColor}>
                <FiLock />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
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

          {/* Confirm New Password */}
          <Box>
            <Text fontWeight="600" fontSize="xs" mb={1} color={headingColor}>
              Confirm New Password
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
            leftIcon={<FiCheckCircle />}
            isLoading={isLoading}
            loadingText="Updating Password..."
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
              opacity: 0.95,
            }}
            mt={2}
          >
            Update Password & Sign In
          </Button>
        </VStack>

        <Divider borderColor={borderColor} my={6} />

        <Text fontSize="xs" color={textColor} textAlign="center">
          Remembered your password?{' '}
          <ChakraLink
            as={RouterLink}
            to="/login"
            fontWeight="700"
            color={goldAccent}
            _hover={{ textDecoration: 'underline' }}
          >
            Back to Sign In
          </ChakraLink>
        </Text>
      </Box>
    </AuthLayout>
  );
};
