import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Flex,
  Image,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const experienceScenes = [
  {
    tag: 'ATMOSPHERE & ARCHITECTURE',
    title: 'The Velvet Dining Room',
    desc: 'An ambient sanctuary of acoustically softened stone, warm brass accents, and custom velvet banquettes. Conceived to make intimate dinners, celebratory galas, and quiet reflections equally profound.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Curated vinyl listening lounge & sommelier pairings',
    reverse: false,
  },
  {
    tag: 'THE ARTISAN ROASTERY',
    title: 'Single-Origin Roastery Atelier',
    desc: 'Dedicated to the pure art of extraction. We source micro-lots directly from ethical smallholder cooperatives in Ethiopia, Colombia, and Yemen, slow-roasted in micro-batches to amplify notes of wild jasmine and stone fruit.',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Geisha varietals, pour-overs & custom nitro cold drafts',
    reverse: true,
  },
  {
    tag: 'CULINARY THEATRE',
    title: "The Chef's Pass & Live Fire Pass",
    desc: 'Witness our brigade in full culinary flow. Heated by white oak coals, our open kitchen transforms seasonal harvests into modern multi-sensory masterpieces right before your eyes.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    highlight: 'Chef-led interactive counter with 7-course seasonal menu',
    reverse: false,
  },
];

export const ExperienceSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxBannerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  const isDark = useColorModeValue(false, true);
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const highlightBg = useColorModeValue('#FAF6EE', '#18181C');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Parallax scroll on banner
      gsap.to(parallaxBannerRef.current, {
        scrollTrigger: {
          trigger: parallaxBannerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        yPercent: -20,
        ease: 'none',
      });

      // Stagger entrance for alternating scenes
      rowsRef.current.forEach((row) => {
        if (!row) return;
        gsap.from(row, {
          scrollTrigger: {
            trigger: row,
            start: 'top 75%',
          },
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box ref={sectionRef} bg={bg} py={{ base: 20, md: 32 }} position="relative" overflow="hidden">
      {/* Full-width Parallax Photography Banner */}
      <Box
        position="relative"
        h={{ base: '320px', md: '440px' }}
        overflow="hidden"
        mb={{ base: 16, md: 24 }}
      >
        <Box
          ref={parallaxBannerRef}
          position="absolute"
          top="-20%"
          left={0}
          right={0}
          h="140%"
          backgroundImage="url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80')"
          backgroundSize="cover"
          backgroundPosition="center"
          filter={isDark ? 'brightness(65%) contrast(110%)' : 'brightness(85%) contrast(100%)'}
        />
        <Box
          position="absolute"
          inset={0}
          bgGradient={
            isDark
              ? 'linear(to-b, #0B0B0B 0%, rgba(11,11,11,0.4) 50%, #0B0B0B 100%)'
              : 'linear(to-b, #F8F5EF 0%, rgba(248,245,239,0.3) 50%, #F8F5EF 100%)'
          }
        />
        <Flex
          position="relative"
          zIndex={1}
          h="100%"
          align="center"
          justify="center"
          direction="column"
          textAlign="center"
          px={6}
        >
          <Badge
            px={4}
            py={1}
            borderRadius="full"
            bg={isDark ? 'rgba(212, 168, 83, 0.2)' : 'rgba(182, 138, 58, 0.2)'}
            border="1px solid"
            borderColor={borderColor}
            color={goldAccent}
            fontSize="xs"
            letterSpacing="0.25em"
            textTransform="uppercase"
            mb={4}
          >
            THE RESTAURANT EXPERIENCE
          </Badge>
          <Heading
            fontFamily="'Playfair Display', serif"
            fontSize={{ base: '32px', sm: '46px', md: '64px' }}
            fontWeight="800"
            color={headingColor}
            maxW="800px"
          >
            Immersive Hospitality in Every Detail.
          </Heading>
        </Flex>
      </Box>

      {/* Split-Screen Image & Content Layouts */}
      <Container maxW="7xl" px={{ base: 6, md: 10 }}>
        <VStack spacing={{ base: 16, md: 24 }} align="stretch">
          {experienceScenes.map((scene, idx) => (
            <Box
              key={idx}
              ref={(el) => (rowsRef.current[idx] = el)}
              bg={cardBg}
              borderRadius="3xl"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
              boxShadow={useColorModeValue('0 20px 45px rgba(0, 0, 0, 0.08)', '0 25px 60px rgba(0, 0, 0, 0.5)')}
            >
              <SimpleGrid
                columns={{ base: 1, lg: 12 }}
                alignItems="center"
              >
                {/* Image Col */}
                <Box
                  gridColumn={{ base: 'span 1', lg: scene.reverse ? '7 / span 6' : '1 / span 6' }}
                  order={{ base: 1, lg: scene.reverse ? 2 : 1 }}
                  position="relative"
                  h={{ base: '280px', sm: '360px', md: '440px' }}
                  overflow="hidden"
                >
                  <Image
                    src={scene.image}
                    alt={scene.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
                    _hover={{ transform: 'scale(1.06)' }}
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient={
                      isDark
                        ? 'linear(to-t, rgba(21,21,21,0.5) 0%, transparent 60%)'
                        : 'linear(to-t, rgba(255,255,255,0.4) 0%, transparent 60%)'
                    }
                  />
                </Box>

                {/* Content Col */}
                <Box
                  gridColumn={{ base: 'span 1', lg: scene.reverse ? '1 / span 6' : '7 / span 6' }}
                  order={{ base: 2, lg: scene.reverse ? 1 : 2 }}
                  p={{ base: 8, md: 12, xl: 16 }}
                >
                  <VStack align="start" spacing={5}>
                    <Text
                      fontSize="xs"
                      letterSpacing="0.2em"
                      textTransform="uppercase"
                      color={goldAccent}
                      fontWeight="700"
                    >
                      {scene.tag}
                    </Text>

                    <Heading
                      as="h3"
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '26px', sm: '34px', md: '42px' }}
                      fontWeight="800"
                      color={headingColor}
                      lineHeight="1.2"
                    >
                      {scene.title}
                    </Heading>

                    <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor} lineHeight="1.8">
                      {scene.desc}
                    </Text>

                    <HStack
                      spacing={3}
                      pt={2}
                      px={4}
                      py={2.5}
                      borderRadius="xl"
                      bg={highlightBg}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Box color={goldAccent}>
                        <FiCheckCircle />
                      </Box>
                      <Text fontSize="xs" fontWeight="600" color={headingColor}>
                        {scene.highlight}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  );
};
