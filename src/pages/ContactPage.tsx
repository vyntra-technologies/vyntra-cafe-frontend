import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Flex,
  useColorModeValue,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';

export const ContactPage: React.FC = () => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({
        title: 'Fields Missing',
        description: 'Please fill in your name, email and message.',
        status: 'warning',
      });
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: 'Message Dispatched!',
        description: 'Thank you for reaching out. Our cafe host will get back to you within 24 hours.',
        status: 'success',
        duration: 4000,
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <PageContainer>
      <VStack spacing={3} textAlign="center" mb={12}>
        <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          Get in Touch With Us
        </Heading>
        <Text fontSize="md" color={textColor} maxW="xl">
          Have an inquiry regarding private catering, events, roasting subscriptions, or general feedback? We'd love to hear from you.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="flex-start">
        {/* Contact Form */}
        <Box as="form" onSubmit={handleSubmit} bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
          <Heading size="md" fontWeight="800" color={headingColor} mb={6}>
            Send a Direct Message
          </Heading>

          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Your Name *
                </Text>
                <Input
                  placeholder="e.g. Liam Parker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Email Address *
                </Text>
                <Input
                  type="email"
                  placeholder="liam@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  borderRadius="xl"
                  isRequired
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                Subject / Inquiry Type
              </Text>
              <Input
                placeholder="e.g. Table Reservation, Private Event, Feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                borderRadius="xl"
              />
            </Box>

            <Box>
              <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                Your Message *
              </Text>
              <Textarea
                placeholder="How can our cafe hosts assist you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                borderRadius="xl"
                rows={4}
                isRequired
              />
            </Box>

            <Button
              type="submit"
              size="lg"
              h="12"
              bg={accentColor}
              color={btnTextColor}
              _hover={{ opacity: 0.9 }}
              borderRadius="xl"
              leftIcon={<FiSend />}
              isLoading={isSending}
              fontWeight="700"
            >
              Send Message
            </Button>
          </VStack>
        </Box>

        {/* Contact Info & Hours */}
        <VStack spacing={6} align="stretch">
          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Heading size="md" fontWeight="800" color={headingColor} mb={4}>
              Direct Cafe Contact
            </Heading>
            <VStack spacing={4} align="stretch" fontSize="sm">
              <HStack spacing={3} align="flex-start">
                <Box color={accentColor} fontSize="lg" mt={1}>
                  <FiMapPin />
                </Box>
                <Box>
                  <Text fontWeight="700" color={headingColor}>
                    Location Address
                  </Text>
                  <Text color={textColor}>450 Lexington Avenue, New York, NY 10017</Text>
                </Box>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Box color={accentColor} fontSize="lg" mt={1}>
                  <FiPhone />
                </Box>
                <Box>
                  <Text fontWeight="700" color={headingColor}>
                    Phone Support & Takeaway Counter
                  </Text>
                  <Text color={textColor}>+1-555-0199</Text>
                </Box>
              </HStack>

              <HStack spacing={3} align="flex-start">
                <Box color={accentColor} fontSize="lg" mt={1}>
                  <FiMail />
                </Box>
                <Box>
                  <Text fontWeight="700" color={headingColor}>
                    Customer Inquiries & Feedback
                  </Text>
                  <Text color={textColor}>contact@vyntracafe.com</Text>
                </Box>
              </HStack>
            </VStack>
          </Box>

          <Box bg={cardBg} p={6} borderRadius="3xl" borderWidth="1px" borderColor={borderColor}>
            <Heading size="md" fontWeight="800" color={headingColor} mb={3}>
              Daily Hours
            </Heading>
            <VStack spacing={1.5} align="stretch" fontSize="xs" color={textColor}>
              <Flex justify="space-between">
                <Text fontWeight="600" color={headingColor}>Monday – Thursday:</Text>
                <Text>07:30 AM – 10:00 PM</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="600" color={headingColor}>Friday – Saturday:</Text>
                <Text>07:30 AM – 11:00 PM</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="600" color={headingColor}>Sunday:</Text>
                <Text>08:00 AM – 09:30 PM</Text>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </PageContainer>
  );
};
