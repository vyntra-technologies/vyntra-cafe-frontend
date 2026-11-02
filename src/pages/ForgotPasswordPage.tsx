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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiMail, FiSend, FiArrowLeft, FiKey } from 'react-icons/fi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { authService } from '../services/auth.service';
import { BRAND_CONFIG } from '../config/brand.config';

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const inputBg = useColorModeValue('#FFFFFF', '#151518');
  const borderColor = useColorModeValue('#E3DFD7', '#282830');
  const textColor = useColorModeValue('#666666', '#A1A1AA');
  const headingColor = useColorModeValue('#171717', '#FFFFFF');
  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0D');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your registered email address.',
        status: 'warning',
        position: 'top-right',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setIsSent(true);
      setServerMessage(res.message || 'If an account exists with this email, password reset instructions have been sent.');
      if (res.resetToken) {
        setDemoToken(res.resetToken);
      }
      toast({
        title: 'Instructions Sent',
        description: res.message || 'Check your inbox for password reset instructions.',
        status: 'info',
        duration: 5000,
        position: 'top-right',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not process request. Please try again.';
      toast({
        title: 'Request Failed',
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
      title="Reset Password"
      subtitle={`Enter your account email and we'll dispatch password recovery instructions right to your inbox.`}
      image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
      quote="Simplicity is the keynote of all true elegance."
      quoteAuthor={`The ${BRAND_CONFIG.name} Team`}
    >
      {isSent ? (
        <VStack spacing={5} align="stretch">
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="xl"
            py={6}
            px={4}
            bg={useColorModeValue('rgba(72, 187, 120, 0.1)', 'rgba(72, 187, 120, 0.15)')}
            border="1px solid"
            borderColor="green.400"
          >
            <AlertIcon boxSize="32px" mr={0} color="green.400" />
            <AlertTitle mt={4} mb={1} fontSize="md" fontWeight="bold" color={headingColor}>
              Check Your Inbox
            </AlertTitle>
            <AlertDescription fontSize="xs" color={textColor} maxW="360px">
              {serverMessage}
            </AlertDescription>
          </Alert>

          {demoToken && (
            <Box
              p={4}
              borderRadius="xl"
              bg={useColorModeValue('yellow.50', 'rgba(212, 175, 55, 0.1)')}
              border="1px dashed"
              borderColor={goldAccent}
            >
              <Text fontSize="xs" fontWeight="700" color={goldAccent} mb={1}>
                Developer Preview Reset Token:
              </Text>
              <Text fontSize="11px" fontFamily="monospace" color={headingColor} wordBreak="break-all" mb={3}>
                {demoToken}
              </Text>
              <Button
                as={RouterLink}
                to={`/reset-password?token=${demoToken}`}
                size="sm"
                colorScheme="yellow"
                variant="outline"
                w="100%"
                leftIcon={<FiKey />}
              >
                Proceed to Reset with Token
              </Button>
            </Box>
          )}

          <Button
            as={RouterLink}
            to="/login"
            variant="outline"
            size="lg"
            borderColor={borderColor}
            color={headingColor}
            leftIcon={<FiArrowLeft />}
            borderRadius="xl"
            _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
          >
            Return to Sign In
          </Button>
        </VStack>
      ) : (
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="600" fontSize="xs" mb={1.5} color={headingColor}>
                Registered Email Address
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
              leftIcon={<FiSend />}
              isLoading={isLoading}
              loadingText="Sending..."
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
                opacity: 0.95,
              }}
              mt={2}
            >
              Send Reset Instructions
            </Button>
          </VStack>

          <Divider borderColor={borderColor} my={6} />

          <Flex justify="center">
            <ChakraLink
              as={RouterLink}
              to="/login"
              display="inline-flex"
              alignItems="center"
              gap={2}
              fontSize="xs"
              fontWeight="700"
              color={goldAccent}
              _hover={{ textDecoration: 'underline' }}
            >
              <FiArrowLeft /> Back to Sign In
            </ChakraLink>
          </Flex>
        </Box>
      )}
    </AuthLayout>
  );
};
