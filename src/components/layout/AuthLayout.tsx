import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Link as ChakraLink,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiCoffee, FiAward } from 'react-icons/fi';
import { BRAND_CONFIG } from '../../config/brand.config';
import { ThemeToggle } from '../common/ThemeToggle';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  quote?: string;
  quoteAuthor?: string;
  image?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  quote = 'Where flavor meets craftsmanship. Every dish is a dialogue between tradition and imagination.',
  quoteAuthor = 'Executive Chef, ' + BRAND_CONFIG.name,
  image = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
}) => {
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const surfaceBg = useColorModeValue('#FFFFFF', '#151515');
  const cardBg = useColorModeValue('#FFFFFF', '#151515');
  const borderColor = useColorModeValue('rgba(182, 138, 58, 0.22)', 'rgba(212, 168, 83, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#1C1C1C', '#FFFFFF');
  const goldAccent = useColorModeValue('#B68A3A', '#D4A853');

  return (
    <Flex minH="100vh" bg={bg} direction={{ base: 'column', lg: 'row' }}>
      {/* Left Editorial Culinary Panel (Desktop & Tablet) */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w={{ lg: '45%', xl: '50%' }}
        position="relative"
        bg="#0B0B0D"
        overflow="hidden"
        flexDirection="column"
        justifyContent="space-between"
        p={{ lg: 10, xl: 14 }}
      >
        {/* Background Image with Ambient Overlays */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage={`url('${image}')`}
          backgroundSize="cover"
          backgroundPosition="center"
          opacity={0.35}
          filter="grayscale(20%) contrast(110%)"
          transform="scale(1.05)"
          transition="transform 10s ease"
          _hover={{ transform: 'scale(1)' }}
        />

        {/* Ambient Dark Gradient & Warm Gold Radial Glow */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(11,11,13,0.45) 0%, rgba(11,11,13,0.85) 60%, rgba(11,11,13,0.98) 100%)"
        />
        <Box
          position="absolute"
          top="-20%"
          left="-10%"
          w="600px"
          h="600px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)"
          filter="blur(40px)"
          pointerEvents="none"
        />

        {/* Brand Header */}
        <HStack position="relative" zIndex={1} spacing={3}>
          <Flex
            w="44px"
            h="44px"
            borderRadius="xl"
            bg="rgba(212, 175, 55, 0.15)"
            border="1px solid rgba(212, 175, 55, 0.35)"
            align="center"
            justify="center"
            color="#D4AF37"
            fontSize="xl"
            fontWeight="bold"
          >
            {BRAND_CONFIG.logoIcon}
          </Flex>
          <VStack align="start" spacing={0}>
            <Heading
              fontFamily="heading"
              size="md"
              letterSpacing="0.1em"
              color="#FFFFFF"
              fontWeight="800"
            >
              {BRAND_CONFIG.name}
            </Heading>
            <Text fontSize="10px" letterSpacing="0.2em" textTransform="uppercase" color="#A1A1AA">
              {BRAND_CONFIG.tagline}
            </Text>
          </VStack>
        </HStack>

        {/* Middle / Bottom Quote & Highlights */}
        <VStack position="relative" zIndex={1} align="start" spacing={6} maxW="520px" my="auto">
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(212, 175, 55, 0.15)"
            border="1px solid rgba(212, 175, 55, 0.3)"
            color="#F5D76E"
            fontSize="xs"
            letterSpacing="0.1em"
            textTransform="uppercase"
            fontWeight="600"
          >
            Gastronomic Excellence
          </Badge>

          <Text
            fontFamily="heading"
            fontSize={{ lg: '2xl', xl: '3xl' }}
            lineHeight="1.35"
            color="#FFFFFF"
            fontStyle="italic"
            fontWeight="400"
          >
            "{quote}"
          </Text>

          <Text fontSize="sm" color="#D4AF37" letterSpacing="0.15em" textTransform="uppercase" fontWeight="700">
            — {quoteAuthor}
          </Text>

          {/* Social Proof Pills */}
          <HStack spacing={4} pt={4}>
            <HStack
              bg="rgba(29, 29, 34, 0.75)"
              backdropFilter="blur(10px)"
              px={3.5}
              py={2}
              borderRadius="xl"
              border="1px solid rgba(255, 255, 255, 0.08)"
            >
              <Box color="#D4AF37"><FiStar size={14} /></Box>
              <Text fontSize="xs" color="#FFFFFF" fontWeight="600">
                4.9/5 Dining Rating
              </Text>
            </HStack>
            <HStack
              bg="rgba(29, 29, 34, 0.75)"
              backdropFilter="blur(10px)"
              px={3.5}
              py={2}
              borderRadius="xl"
              border="1px solid rgba(255, 255, 255, 0.08)"
            >
              <Box color="#D4AF37"><FiAward size={14} /></Box>
              <Text fontSize="xs" color="#FFFFFF" fontWeight="600">
                Artisanal Kitchen
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Footer info on left panel */}
        <HStack position="relative" zIndex={1} justify="space-between" pt={8} borderTop="1px solid rgba(255,255,255,0.08)">
          <Text fontSize="xs" color="#71717A">
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. {BRAND_CONFIG.company}.
          </Text>
          <HStack spacing={2} color="#A1A1AA" fontSize="xs">
            <FiCoffee />
            <Text>Curated with passion</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Right Form Panel */}
      <Flex
        w={{ base: '100%', lg: '55%', xl: '50%' }}
        direction="column"
        justify="space-between"
        p={{ base: 6, sm: 8, md: 12, lg: 10, xl: 14 }}
      >
        {/* Top Bar: Back to Home + Brand on mobile + ThemeToggle */}
        <Flex justify="space-between" align="center" mb={{ base: 8, lg: 6 }}>
          <ChakraLink
            as={RouterLink}
            to="/"
            display="inline-flex"
            alignItems="center"
            gap={2}
            fontSize="sm"
            fontWeight="600"
            color={textColor}
            _hover={{ color: goldAccent, transform: 'translateX(-3px)' }}
            transition="all 0.2s ease"
          >
            <FiArrowLeft /> Return to {BRAND_CONFIG.name}
          </ChakraLink>

          {/* Mobile Brand Mark */}
          <HStack display={{ base: 'flex', lg: 'none' }} spacing={2}>
            <Flex
              w="32px"
              h="32px"
              borderRadius="lg"
              bg={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.15)')}
              border="1px solid"
              borderColor={borderColor}
              align="center"
              justify="center"
              color={goldAccent}
              fontSize="sm"
              fontWeight="bold"
            >
              {BRAND_CONFIG.logoIcon}
            </Flex>
            <Text fontFamily="heading" fontWeight="800" color={headingColor} fontSize="md">
              {BRAND_CONFIG.name}
            </Text>
          </HStack>

          <ThemeToggle />
        </Flex>

        {/* Form Container */}
        <Box w="100%" maxW="460px" mx="auto" my="auto">
          {/* Header */}
          <VStack align="start" spacing={2} mb={8}>
            <Heading
              as="h1"
              fontFamily="heading"
              size={{ base: 'lg', md: 'xl' }}
              fontWeight="800"
              color={headingColor}
              letterSpacing="-0.02em"
            >
              {title}
            </Heading>
            <Text fontSize="sm" color={textColor} lineHeight="1.6">
              {subtitle}
            </Text>
          </VStack>

          {/* Actual Form Content */}
          <Box
            bg={cardBg}
            p={{ base: 6, sm: 8 }}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow={useColorModeValue('0 10px 30px rgba(0,0,0,0.04)', '0 10px 30px rgba(0,0,0,0.4)')}
            position="relative"
          >
            {children}
          </Box>
        </Box>

        {/* Minimal Right Footer */}
        <Box pt={8} textAlign="center">
          <Text fontSize="xs" color={textColor}>
            Protected by enterprise encryption & privacy safeguards.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

