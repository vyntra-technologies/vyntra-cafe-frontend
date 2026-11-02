import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiCopy, FiCheck, FiTag } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

export const SpecialOffersBanner: React.FC = () => {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const cardBg = useColorModeValue('#FFFFFF', '#181A1D');
  const borderColor = useColorModeValue('#E8DED1', '#2B2E33');
  const textColor = useColorModeValue('#716B65', '#B5B7BC');
  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  const offers = [
    {
      code: 'WELCOME10',
      discount: '10% OFF',
      title: 'Welcome First-Time Guests',
      desc: 'Enjoy 10% discount on your order. Applicable on all coffee, beverages & food items.',
      minSpend: 'Min $10.00 spend',
    },
    {
      code: 'FLAT5OFF',
      discount: '$5.00 OFF',
      title: 'Artisan Feast Reward',
      desc: 'Save a flat $5.00 on any dine-in or takeaway basket exceeding $25.00.',
      minSpend: 'Min $25.00 spend',
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: `Coupon ${code} copied!`,
      description: 'Paste it during checkout to redeem your savings.',
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <Box py={{ base: 12, md: 16 }}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <Box
          p={{ base: 6, md: 10 }}
          borderRadius="3xl"
          bg={useColorModeValue('orange.50', 'rgba(255, 122, 26, 0.05)')}
          borderWidth="1px"
          borderColor={useColorModeValue('orange.200', 'rgba(255, 122, 26, 0.2)')}
          position="relative"
          overflow="hidden"
        >
          <VStack spacing={2} textAlign="center" mb={8}>
            <HStack color={accentColor} spacing={2}>
              <FiTag />
              <Text fontSize="xs" fontWeight="700" letterSpacing="2px" textTransform="uppercase">
                LIMITED-TIME PROMOTIONS
              </Text>
            </HStack>
            <Heading fontFamily="heading" size="lg" fontWeight="800" color={headingColor}>
              Exclusive Offers For Our Guests
            </Heading>
            <Text fontSize="sm" color={textColor} maxW="lg">
              Redeem these verified digital vouchers instantly on your next artisan coffee or gourmet brunch.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {offers.map((offer) => (
              <Box
                key={offer.code}
                bg={cardBg}
                p={6}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="sm"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <VStack align="flex-start" spacing={3} mb={4}>
                  <HStack justify="space-between" w="100%">
                    <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="lg" fontWeight="800">
                      {offer.discount}
                    </Badge>
                    <Text fontSize="xs" color={textColor} fontWeight="600">
                      {offer.minSpend}
                    </Text>
                  </HStack>
                  <Heading size="sm" fontWeight="700" color={headingColor}>
                    {offer.title}
                  </Heading>
                  <Text fontSize="xs" color={textColor} lineHeight="tall">
                    {offer.desc}
                  </Text>
                </VStack>

                <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor={borderColor}>
                  <Box>
                    <Text fontSize="10px" color={textColor} fontWeight="bold">
                      PROMO CODE
                    </Text>
                    <Text fontFamily="monospace" fontSize="md" fontWeight="800" color={accentColor} letterSpacing="1px">
                      {offer.code}
                    </Text>
                  </Box>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      borderRadius="xl"
                      leftIcon={copiedCode === offer.code ? <FiCheck /> : <FiCopy />}
                      onClick={() => handleCopy(offer.code)}
                      fontSize="xs"
                    >
                      {copiedCode === offer.code ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/menu"
                      size="sm"
                      colorScheme="brand"
                      borderRadius="xl"
                      fontSize="xs"
                    >
                      Order Now
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};

