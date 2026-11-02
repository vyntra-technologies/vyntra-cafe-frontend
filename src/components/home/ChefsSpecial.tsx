import React, { useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Badge,
  Image,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAward, FiStar, FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../common/MagneticButton';
import { BRAND_CONFIG } from '../../config/brand.config';

gsap.registerPlugin(ScrollTrigger);

export const ChefsSpecial: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dishImageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isDark = useColorModeValue(false, true);
  const bg = useColorModeValue('#FFFFFF', '#171717');
  const cardBg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const tagBg = useColorModeValue('#FAF6EE', '#18181C');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // ScrollTrigger reveal
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        x: -40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from(dishImageRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        scale: 0.88,
        opacity: 0,
        rotation: 4,
        duration: 1.2,
        ease: 'expo.out',
      });

      // Floating dish continuous animation
      gsap.to(dishImageRef.current, {
        y: -12,
        rotation: -2,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleBookSpecial = () => {
    const resEl = document.getElementById('reservation');
    resEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      ref={sectionRef}
      py={{ base: 20, md: 32 }}
      bg={bg}
      position="relative"
      overflow="hidden"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      {/* Ambient Spotlight Background */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="800px"
        h="800px"
        borderRadius="full"
        bg={
          isDark
            ? 'radial-gradient(circle, rgba(212, 168, 83, 0.12) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(182, 138, 58, 0.1) 0%, transparent 65%)'
        }
        pointerEvents="none"
        filter="blur(50px)"
      />

      <Container maxW="7xl" px={{ base: 6, md: 10 }} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 12, lg: 8 }} alignItems="center">
          {/* Left Column: Presentation & Description */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 6' }} ref={contentRef}>
            <VStack align="start" spacing={6}>
              <HStack spacing={2}>
                <Badge
                  px={4}
                  py={1.5}
                  borderRadius="full"
                  bg={isDark ? 'rgba(212, 168, 83, 0.15)' : 'rgba(182, 138, 58, 0.15)'}
                  border="1px solid"
                  borderColor={borderColor}
                  color={goldAccent}
                  fontSize="xs"
                  letterSpacing="0.2em"
                  textTransform="uppercase"
                  fontWeight="700"
                >
                  LIMITED SEATING TASTING
                </Badge>
                <HStack spacing={1} color={goldAccent} fontSize="xs">
                  <FiStar />
                  <Text color={headingColor} fontWeight="700">
                    Grand Reserve
                  </Text>
                </HStack>
              </HStack>

              <Heading
                as="h2"
                fontFamily="'Playfair Display', serif"
                fontSize={{ base: '34px', sm: '46px', md: '56px' }}
                fontWeight="800"
                lineHeight="1.1"
                color={headingColor}
              >
                Pan-Seared Glacier Toothfish & Saffron Dashi
              </Heading>

              <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor} lineHeight="1.8">
                Wild-caught Patagonian toothfish basted in cultured French butter, resting upon a
                clarified dashi infused with organic Persian saffron, charred baby leeks, and
                crisped seaweed coral. Finished table-side with 24k edible gold dust.
              </Text>

              {/* Ingredients Badges */}
              <HStack wrap="wrap" spacing={3} pt={1}>
                {['Patagonian Glacier Cut', 'Persian Saffron', 'Wild Morel Puree', '24K Edible Gold'].map(
                  (ing, i) => (
                    <Box
                      key={i}
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={tagBg}
                      border="1px solid"
                      borderColor={borderColor}
                      fontSize="xs"
                      color={headingColor}
                    >
                      {ing}
                    </Box>
                  )
                )}
              </HStack>

              {/* Price & Sommelier Pairing */}
              <Box
                p={5}
                w="100%"
                borderRadius="2xl"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                boxShadow={useColorModeValue('0 10px 30px rgba(0,0,0,0.06)', '0 15px 35px rgba(0,0,0,0.6)')}
              >
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                      A La Carte Tasting
                    </Text>
                    <HStack spacing={1} align="baseline">
                      <Text fontFamily="'Playfair Display', serif" fontSize="3xl" fontWeight="800" color={goldAccent}>
                        ₹680
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        / per guest
                      </Text>
                    </HStack>
                  </VStack>

                  <VStack align="start" spacing={0} maxW="240px">
                    <Text fontSize="10px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                      Sommelier Pairing
                    </Text>
                    <Text fontSize="xs" color={headingColor} fontWeight="600">
                      2018 Domaine Leflaive Puligny-Montrachet
                    </Text>
                  </VStack>
                </Flex>
              </Box>

              {/* Action Button */}
              <MagneticButton strength={20}>
                <Button
                  onClick={handleBookSpecial}
                  size="lg"
                  h="56px"
                  px={8}
                  bg={goldAccent}
                  color="#0B0B0B"
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  borderRadius="full"
                  rightIcon={<FiArrowRight />}
                  _hover={{
                    bg: isDark ? '#E5CC78' : '#9E7428',
                    color: isDark ? '#0B0B0B' : '#FFFFFF',
                    transform: 'scale(1.03)',
                    boxShadow: `0 12px 30px ${goldAccent}45`,
                  }}
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  RESERVE FOR THIS EVENING
                </Button>
              </MagneticButton>
            </VStack>
          </Box>

          {/* Right Column: Floating Plating Photography with Spotlight */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 6' }} position="relative">
            <Box
              ref={dishImageRef}
              position="relative"
              maxW={{ base: '380px', sm: '480px', lg: '520px' }}
              mx="auto"
            >
              {/* Radial glow around plate */}
              <Box
                position="absolute"
                inset={-10}
                borderRadius="full"
                bg={
                  isDark
                    ? 'radial-gradient(circle, rgba(212, 168, 83, 0.25) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(182, 138, 58, 0.2) 0%, transparent 70%)'
                }
                filter="blur(30px)"
              />

              <Box
                position="relative"
                borderRadius="3xl"
                overflow="hidden"
                border="2px solid"
                borderColor={isDark ? 'rgba(212, 168, 83, 0.4)' : 'rgba(182, 138, 58, 0.4)'}
                boxShadow={useColorModeValue('0 25px 60px rgba(0,0,0,0.15)', '0 35px 80px rgba(0, 0, 0, 0.85)')}
                bg={cardBg}
                aspectRatio={1}
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRd5Dk18n5lXq3itl6o7aaUT159-txY2uRSf0HfBtJgw&s=10"
                  alt="Glacier Toothfish Plating"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  filter="contrast(110%)"
                  transition="transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{ transform: 'scale(1.07)' }}
                />
              </Box>

              {/* Floating Badge on dish image */}
              <Flex
                position="absolute"
                bottom="-15px"
                left="8%"
                bg={cardBg}
                border="1px solid"
                borderColor={goldAccent}
                px={4}
                py={2.5}
                borderRadius="2xl"
                align="center"
                gap={3}
                boxShadow="0 15px 35px rgba(0,0,0,0.4)"
              >
                <Box color={goldAccent} fontSize="lg">
                  <FiAward />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="10px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                    CHEF DE CUISINE
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color={headingColor}>
                    Limited to 20 Servings Nightly
                  </Text>
                </VStack>
              </Flex>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};
