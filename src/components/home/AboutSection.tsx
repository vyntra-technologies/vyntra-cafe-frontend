import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Image,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BRAND_CONFIG } from '../../config/brand.config';

gsap.registerPlugin(ScrollTrigger);

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const imageGridRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);

  // Counter refs
  const counter1Ref = useRef<HTMLSpanElement>(null);
  const counter2Ref = useRef<HTMLSpanElement>(null);
  const counter3Ref = useRef<HTMLSpanElement>(null);
  const counter4Ref = useRef<HTMLSpanElement>(null);

  const bg = useColorModeValue('#FFFFFF', '#171717');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const quoteColor = useColorModeValue('#202020', '#F8F5EF');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const stampBg = useColorModeValue('#F8F5EF', '#0B0B0B');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // ScrollTrigger text entrance
      gsap.from(textColRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      // ScrollTrigger image reveal with parallax
      gsap.from(img1Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
        scale: 1.08,
        duration: 1.4,
        ease: 'expo.out',
      });

      gsap.from(img2Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      // Animated counters
      const counters = [
        { ref: counter1Ref, end: 18, suffix: '+' },
        { ref: counter2Ref, end: 24, suffix: ' Master' },
        { ref: counter3Ref, end: 100, suffix: '%' },
        { ref: counter4Ref, end: 45, suffix: 'k+' },
      ];

      counters.forEach(({ ref, end }) => {
        if (!ref.current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
          },
          val: end,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (ref.current) {
              ref.current.innerText = Math.floor(obj.val).toString();
            }
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box
      id="about"
      ref={sectionRef}
      py={{ base: 20, md: 32 }}
      bg={bg}
      position="relative"
      overflow="hidden"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      {/* Decorative ambient background text */}
      <Text
        position="absolute"
        top="5%"
        left="-3%"
        fontSize={{ base: '120px', md: '200px', lg: '280px' }}
        fontFamily="'Playfair Display', serif"
        fontWeight="900"
        color={useColorModeValue('rgba(0, 0, 0, 0.02)', 'rgba(255, 255, 255, 0.015)')}
        userSelect="none"
        pointerEvents="none"
        lineHeight="1"
      >
        ATELIER
      </Text>

      <Container maxW="7xl" px={{ base: 6, md: 10 }} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 16, lg: 12 }} alignItems="center">
          {/* Left Column: Asymmetrical Image Composition */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 6' }} ref={imageGridRef}>
            <Box position="relative" minH={{ base: '400px', sm: '500px', md: '560px' }}>
              {/* Primary Large Image */}
              <Box
                ref={img1Ref}
                position="absolute"
                top={0}
                left={0}
                w={{ base: '82%', sm: '76%' }}
                h={{ base: '360px', sm: '460px' }}
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                boxShadow={useColorModeValue('0 20px 40px rgba(0,0,0,0.08)', '0 25px 50px rgba(0,0,0,0.6)')}
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwmfOp3YJePsTUZ0mrRwOo6PsNfi_uwArwqv0z85uLWw&s=10"
                  alt="Atmospheric Restaurant Interior"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  transition="transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{ transform: 'scale(1.05)' }}
                />
              </Box>

              {/* Secondary Overlapping Image */}
              <Box
                ref={img2Ref}
                position="absolute"
                bottom={0}
                right={0}
                w={{ base: '65%', sm: '58%' }}
                h={{ base: '260px', sm: '320px' }}
                borderRadius="2xl"
                overflow="hidden"
                border="2px solid"
                borderColor={bg}
                boxShadow={useColorModeValue('0 25px 50px rgba(0,0,0,0.12)', '0 30px 60px rgba(0,0,0,0.8)')}
                zIndex={2}
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUOgJt4ryNpOF0SgMCn-9fuqe3r_ewubP69RmKwl1NMA&s=10"
                  alt="Executive Chef Plating"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  transition="transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{ transform: 'scale(1.05)' }}
                />
                <Box
                  position="absolute"
                  inset={0}
                  bgGradient="linear(to-t, rgba(0,0,0,0.65) 0%, transparent 60%)"
                />
                <Text
                  position="absolute"
                  bottom={4}
                  left={5}
                  fontSize="xs"
                  fontWeight="700"
                  color="#FFFFFF"
                  letterSpacing="0.08em"
                >
                  HAND-CRAFTED AT THE PASS
                </Text>
              </Box>

              {/* Floating Decorative Gold Stamp */}
              <Flex
                position="absolute"
                top="38%"
                left={{ base: '60%', sm: '65%' }}
                w="90px"
                h="90px"
                borderRadius="full"
                bg={stampBg}
                border="1px dashed"
                borderColor={goldAccent}
                align="center"
                justify="center"
                direction="column"
                zIndex={3}
                boxShadow={useColorModeValue('0 10px 25px rgba(0,0,0,0.1)', '0 15px 30px rgba(0,0,0,0.6)')}
              >
                <Text fontSize="10px" color={goldAccent} fontWeight="800" letterSpacing="0.1em">
                  EST.
                </Text>
                <Text fontFamily="'Playfair Display', serif" fontSize="lg" fontWeight="800" color={headingColor}>
                  2026
                </Text>
                <Text fontSize="8px" color={textColor} letterSpacing="0.1em">
                  ATELIER
                </Text>
              </Flex>
            </Box>
          </Box>

          {/* Right Column: Editorial Storytelling & Animated Counters */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 6' }} ref={textColRef}>
            <VStack align="start" spacing={6}>
              <Badge
                px={3.5}
                py={1}
                borderRadius="full"
                bg={useColorModeValue('rgba(182, 138, 58, 0.12)', 'rgba(212, 168, 83, 0.12)')}
                border="1px solid"
                borderColor={borderColor}
                color={goldAccent}
                fontSize="xs"
                letterSpacing="0.18em"
                textTransform="uppercase"
                fontWeight="700"
              >
                OUR HERITAGE & PHILOSOPHY
              </Badge>

              <Heading
                as="h2"
                fontFamily="'Playfair Display', serif"
                fontSize={{ base: '32px', sm: '42px', md: '50px' }}
                fontWeight="800"
                lineHeight="1.15"
                color={headingColor}
                letterSpacing="-0.02em"
              >
                Where Culinary Artistry Meets Soulful Hospitality.
              </Heading>

              <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor} lineHeight="1.8">
                At {BRAND_CONFIG.name}, we believe dining is more than sustenance—it is an intimate
                dialogue between heritage technique, seasonal terroir, and contemporary flair. Every
                morning begins with micro-lot roasts hand-ground to micron precision, paired with
                produce cultivated exclusively for our larder by local organic growers.
              </Text>

              <Text
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize={{ base: 'lg', md: 'xl' }}
                color={quoteColor}
                fontStyle="italic"
                borderLeft="2px solid"
                borderColor={goldAccent}
                pl={4}
                py={1}
              >
                "We do not simply prepare food; we curate moments that linger long after the final espresso."
              </Text>

              {/* Animated Numbers Grid */}
              <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={6} pt={6} w="100%">
                <Box>
                  <HStack spacing={0} align="baseline">
                    <Text
                      as="span"
                      ref={counter1Ref}
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '3xl', md: '4xl' }}
                      fontWeight="800"
                      color={goldAccent}
                    >
                      18
                    </Text>
                    <Text as="span" fontSize="xl" fontWeight="700" color={goldAccent}>
                      +
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={textColor} letterSpacing="0.05em" textTransform="uppercase" mt={1}>
                    Culinary Accolades
                  </Text>
                </Box>

                <Box>
                  <HStack spacing={0} align="baseline">
                    <Text
                      as="span"
                      ref={counter2Ref}
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '3xl', md: '4xl' }}
                      fontWeight="800"
                      color={goldAccent}
                    >
                      24
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={textColor} letterSpacing="0.05em" textTransform="uppercase" mt={1}>
                    Artisanal Chefs
                  </Text>
                </Box>

                <Box>
                  <HStack spacing={0} align="baseline">
                    <Text
                      as="span"
                      ref={counter3Ref}
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '3xl', md: '4xl' }}
                      fontWeight="800"
                      color={goldAccent}
                    >
                      100
                    </Text>
                    <Text as="span" fontSize="xl" fontWeight="700" color={goldAccent}>
                      %
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={textColor} letterSpacing="0.05em" textTransform="uppercase" mt={1}>
                    Organic Origins
                  </Text>
                </Box>

                <Box>
                  <HStack spacing={0} align="baseline">
                    <Text
                      as="span"
                      ref={counter4Ref}
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '3xl', md: '4xl' }}
                      fontWeight="800"
                      color={goldAccent}
                    >
                      45
                    </Text>
                    <Text as="span" fontSize="xl" fontWeight="700" color={goldAccent}>
                      k+
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={textColor} letterSpacing="0.05em" textTransform="uppercase" mt={1}>
                    Patrons Delighted
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};
