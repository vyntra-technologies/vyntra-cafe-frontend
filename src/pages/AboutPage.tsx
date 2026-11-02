import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Image,
  Badge,
  Flex,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FiCheck, FiCoffee, FiHeart, FiAward, FiGlobe } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';

export const AboutPage: React.FC = () => {
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  return (
    <PageContainer>
      {/* Hero Header */}
      <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto" mb={16}>
        <Badge
          bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
          color={accentColor}
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="700"
          letterSpacing="1px"
        >
          OUR STORY & PASSION
        </Badge>
        <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
          The Soul of Vyntra Cafe
        </Heading>
        <Text fontSize="md" color={textColor} lineHeight="tall">
          Crafted under the visionary ecosystem of Vyntra Solutions, Vyntra Cafe is an homage to timeless culinary traditions, modern design, and the purest single-origin roasts.
        </Text>
      </VStack>

      {/* Story Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center" mb={20}>
        <Box>
          <Text fontSize="xs" fontWeight="700" color={accentColor} letterSpacing="2px" textTransform="uppercase" mb={2}>
            HUMBLE BEGINNINGS, BOLD VISIONS
          </Text>
          <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor} mb={4}>
            Roasting Without Compromise
          </Heading>
          <Text fontSize="sm" color={textColor} lineHeight="tall" mb={4}>
            We started with a simple belief: a cafe should not just be a pit stop for caffeine, but a sanctuary of taste. We partnered directly with generational farmers across Huila, Colombia and Yirgacheffe, Ethiopia to bring unadulterated micro-lot coffee beans to our roastery.
          </Text>
          <Text fontSize="sm" color={textColor} lineHeight="tall">
            Every batch of coffee is meticulously profiled and drum-roasted on-site. Paired with Parisian bakery techniques and slow-fermented sourdough paninis, we bring you an unforgettable culinary haven.
          </Text>
        </Box>

        <Box borderRadius="3xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
          <Image
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80"
            alt="Coffee Roasting Process"
            w="100%"
            h="400px"
            objectFit="cover"
          />
        </Box>
      </SimpleGrid>

      {/* Pillars Section */}
      <Box p={{ base: 6, md: 12 }} bg={cardBg} borderRadius="3xl" borderWidth="1px" borderColor={borderColor} mb={20}>
        <Heading size="lg" fontWeight="800" color={headingColor} textAlign="center" mb={10}>
          Our Guiding Principles
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <VStack align="flex-start" spacing={3}>
            <Flex w="12" h="12" borderRadius="2xl" bg={useColorModeValue('rgba(164, 122, 60, 0.1)', 'rgba(212, 175, 114, 0.15)')} color={accentColor} align="center" justify="center" fontSize="xl">
              <FiGlobe />
            </Flex>
            <Heading size="sm" fontWeight="700" color={headingColor}>
              100% Direct Fair Trade
            </Heading>
            <Text fontSize="xs" color={textColor} lineHeight="tall">
              We eliminate unnecessary middlemen, ensuring our partner coffee farmers receive up to 40% above fair market rates for their artisan yields.
            </Text>
          </VStack>

          <VStack align="flex-start" spacing={3}>
            <Flex w="12" h="12" borderRadius="2xl" bg={useColorModeValue('rgba(164, 122, 60, 0.1)', 'rgba(212, 175, 114, 0.15)')} color={accentColor} align="center" justify="center" fontSize="xl">
              <FiAward />
            </Flex>
            <Heading size="sm" fontWeight="700" color={headingColor}>
              Artisan Mastery
            </Heading>
            <Text fontSize="xs" color={textColor} lineHeight="tall">
              Every barista undergoes extensive sensory training, water mineral calibration, and precision dial-in for every roast profile.
            </Text>
          </VStack>

          <VStack align="flex-start" spacing={3}>
            <Flex w="12" h="12" borderRadius="2xl" bg={useColorModeValue('rgba(164, 122, 60, 0.1)', 'rgba(212, 175, 114, 0.15)')} color={accentColor} align="center" justify="center" fontSize="xl">
              <FiHeart />
            </Flex>
            <Heading size="sm" fontWeight="700" color={headingColor}>
              Sustainable Future
            </Heading>
            <Text fontSize="xs" color={textColor} lineHeight="tall">
              100% compostable takeaway cups, zero single-use plastics, and spent coffee grounds recycled into organic urban agriculture compost.
            </Text>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* Vyntra Solutions Attribution */}
      <Box textAlign="center" p={8} bg={useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)')} borderRadius="3xl" borderWidth="1px" borderColor={accentColor}>
        <Text fontSize="xs" fontWeight="700" color={accentColor} letterSpacing="2px" textTransform="uppercase" mb={1}>
          CORPORATE FOUNDATION
        </Text>
        <Heading size="md" fontWeight="800" color={headingColor} mb={2}>
          A Premium Venture of Vyntra Solutions
        </Heading>
        <Text fontSize="sm" color={textColor} maxW="lg" mx="auto">
          Vyntra Cafe embodies Vyntra Solutions' mission to merge modern digital precision, effortless ordering technology, and high-touch hospitality.
        </Text>
      </Box>
    </PageContainer>
  );
};
