import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAward, FiCoffee, FiSmile, FiHeart } from 'react-icons/fi';

export const IntroSection: React.FC = () => {
  const cardBg = useColorModeValue('#FFFFFF', '#181A1D');
  const borderColor = useColorModeValue('#E8DED1', '#2B2E33');
  const textColor = useColorModeValue('#716B65', '#B5B7BC');
  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  const pillars = [
    {
      icon: FiCoffee,
      title: 'Artisan Micro-Roasts',
      desc: 'Selected beans ethically sourced directly from smallholder farms in Colombia, Ethiopia, and Sumatra.',
    },
    {
      icon: FiAward,
      title: 'Culinary Mastery',
      desc: 'Gourmet menu curated by master baristas and executive chefs, baked fresh each morning.',
    },
    {
      icon: FiSmile,
      title: 'Warm Hospitality',
      desc: 'An inspiring ambiance built for intimate conversations, remote productivity, and celebrations.',
    },
    {
      icon: FiHeart,
      title: 'Pure & Organic',
      desc: 'No artificial syrups, preservatives or shortcuts. Real churned butter, organic dairy, and non-GMO grains.',
    },
  ];

  return (
    <Box py={{ base: 12, md: 20 }} bg={useColorModeValue('#FAF5EE', '#0C0E11')}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <VStack spacing={4} textAlign="center" maxW="2xl" mx="auto" mb={12}>
          <Text
            fontSize="xs"
            fontWeight="700"
            color={accentColor}
            letterSpacing="2px"
            textTransform="uppercase"
          >
            THE VYNTRA PHILOSOPHY
          </Text>
          <Heading
            fontFamily="heading"
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="800"
            color={headingColor}
          >
            Crafting Extraordinary Experiences In Every Cup
          </Heading>
          <Text fontSize="md" color={textColor} lineHeight="tall">
            Born from an obsession with sensory excellence, Vyntra Cafe unites master roasting craftsmanship with contemporary culinary art.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
          {pillars.map((pillar, i) => (
            <Box
              key={i}
              bg={cardBg}
              p={6}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              transition="all 0.3s ease"
              _hover={{
                borderColor: accentColor,
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
              }}
            >
              <Flex
                w="12"
                h="12"
                borderRadius="xl"
                bg={useColorModeValue('orange.50', 'whiteAlpha.100')}
                color={accentColor}
                align="center"
                justify="center"
                fontSize="xl"
                mb={4}
              >
                <pillar.icon />
              </Flex>
              <Heading size="sm" fontWeight="700" color={headingColor} mb={2}>
                {pillar.title}
              </Heading>
              <Text fontSize="xs" color={textColor} lineHeight="tall">
                {pillar.desc}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

