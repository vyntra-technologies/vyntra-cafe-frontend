import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Flex,
  Badge,
  SimpleGrid,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowRight, FiCalendar, FiChevronDown, FiAward, FiStar } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BRAND_CONFIG } from '../../config/brand.config';
import { MagneticButton } from '../common/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onReserveClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onReserveClick }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // Floating Food Animation Refs
  const foodCompositionRef = useRef<HTMLDivElement>(null);
  const mainDishRef = useRef<HTMLDivElement>(null);
  const rotatingRingRef = useRef<HTMLDivElement>(null);
  const ingredient1Ref = useRef<HTMLDivElement>(null); // Basil / mint
  const ingredient2Ref = useRef<HTMLDivElement>(null); // Cherry tomato
  const ingredient3Ref = useRef<HTMLDivElement>(null); // Herb sprig
  const ingredient4Ref = useRef<HTMLDivElement>(null); // Star anise / spice
  const particle1Ref = useRef<HTMLDivElement>(null);
  const particle2Ref = useRef<HTMLDivElement>(null);
  const particle3Ref = useRef<HTMLDivElement>(null);

  // Theme values
  const isDark = useColorModeValue(false, true);
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const textColor = useColorModeValue('#202020', '#F8F5EF');
  const mutedText = useColorModeValue('#666666', '#9E9EA8');
  const heroBg = useColorModeValue('#F8F5EF', '#0B0B0B');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Text entrance sequence
      tl.from(badgeRef.current, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
      })
        .from(
          [titleLine1Ref.current, titleLine2Ref.current],
          {
            y: 70,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            skewY: 2,
            ease: 'power4.out',
          },
          '-=0.4'
        )
        .from(
          textRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.5'
        )
        .from(
          buttonsRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.5'
        );

      // 2. Main Food Entrance: Scale + Rotation + Soft Glow Reveal
      tl.from(
        mainDishRef.current,
        {
          scale: 0.7,
          rotation: -12,
          opacity: 0,
          duration: 1.4,
          ease: 'expo.out',
        },
        '-=1.2'
      );

      // 3. Staggered Ingredients Entrance
      const ingredients = [
        ingredient1Ref.current,
        ingredient2Ref.current,
        ingredient3Ref.current,
        ingredient4Ref.current,
      ];

      tl.from(
        ingredients,
        {
          scale: 0.3,
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'back.out(1.8)',
        },
        '-=0.8'
      );

      // Particles entrance
      tl.from(
        [particle1Ref.current, particle2Ref.current, particle3Ref.current],
        {
          scale: 0,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
        },
        '-=0.6'
      );

      // 4. Continuous Animations:
      // Rotating Decorative Ring
      gsap.to(rotatingRingRef.current, {
        rotation: 360,
        duration: 32,
        repeat: -1,
        ease: 'none',
      });

      // Main Food Gentle Floating + 3D Tilt
      gsap.to(mainDishRef.current, {
        y: -18,
        rotation: 1.5,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Independent Floating Ingredients with varied intervals
      gsap.to(ingredient1Ref.current, {
        y: -14,
        x: 6,
        rotation: 12,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(ingredient2Ref.current, {
        y: -20,
        x: -8,
        rotation: -10,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(ingredient3Ref.current, {
        y: -12,
        x: -6,
        rotation: 15,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(ingredient4Ref.current, {
        y: -16,
        x: 10,
        rotation: -20,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Drifting Particles
      [particle1Ref.current, particle2Ref.current, particle3Ref.current].forEach((pt, i) => {
        if (!pt) return;
        gsap.to(pt, {
          y: -24 - i * 6,
          opacity: 0.8,
          duration: 2 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      });

      // 5. Interactive Mouse Parallax (Multi-Depth)
      const handleMouseMove = (e: MouseEvent) => {
        if (!heroRef.current) return;
        const { clientX, clientY } = e;
        const normX = (clientX / window.innerWidth - 0.5) * 2;
        const normY = (clientY / window.innerHeight - 0.5) * 2;

        gsap.to(mainDishRef.current, {
          x: normX * 18,
          y: normY * 18,
          duration: 1,
          ease: 'power2.out',
        });

        gsap.to(ingredient1Ref.current, {
          x: normX * 36,
          y: normY * 36,
          duration: 0.8,
          ease: 'power2.out',
        });

        gsap.to(ingredient2Ref.current, {
          x: normX * -30,
          y: normY * -30,
          duration: 0.9,
          ease: 'power2.out',
        });

        gsap.to(ingredient3Ref.current, {
          x: normX * 24,
          y: normY * 24,
          duration: 1.1,
          ease: 'power2.out',
        });

        gsap.to(ingredient4Ref.current, {
          x: normX * -22,
          y: normY * -22,
          duration: 0.85,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      // 6. ScrollTrigger Scrub: Smooth exit on scroll
      gsap.to(foodCompositionRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: 120,
        scale: 0.88,
        opacity: 0.3,
        ease: 'none',
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, heroRef);

    return () => ctx.revert();
  }, [isDark]);

  const scrollToMenu = () => {
    const el = document.getElementById('signature-menu');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToReservation = () => {
    if (onReserveClick) {
      onReserveClick();
    } else {
      const el = document.getElementById('reservation');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      ref={heroRef}
      position="relative"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      bg={heroBg}
      pt={{ base: '110px', md: '130px' }}
      pb={{ base: '80px', md: '100px' }}
    >
      {/* Background Cinematic Atmosphere */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        overflow="hidden"
        pointerEvents="none"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz0yB-id8EzERWuFxwde40ETYCOdfhPajMJ7frW4g1wA&s=10"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isDark ? 0.32 : 0.12,
            filter: isDark ? 'contrast(115%) brightness(75%)' : 'grayscale(30%) brightness(110%)',
          }}
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-chef-serving-a-plate-with-french-fries-and-meat-42407-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Theme-Adaptive Ambient Gradients */}
        <Box
          position="absolute"
          inset={0}
          bgGradient={
            isDark
              ? 'linear(to-b, rgba(11,11,11,0.6) 0%, rgba(11,11,11,0.85) 60%, #0B0B0B 100%)'
              : 'linear(to-b, rgba(248,245,239,0.7) 0%, rgba(248,245,239,0.9) 60%, #F8F5EF 100%)'
          }
        />
        <Box
          position="absolute"
          top="-10%"
          left="25%"
          w="650px"
          h="650px"
          borderRadius="full"
          bg={
            isDark
              ? 'radial-gradient(circle, rgba(212,168,83,0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(182,138,58,0.1) 0%, transparent 70%)'
          }
          filter="blur(60px)"
        />
      </Box>

      {/* Main Grid: Left Text + Right Floating Food Animation */}
      <Container maxW="7xl" position="relative" zIndex={2} px={{ base: 6, md: 10 }}>
        <SimpleGrid
          columns={{ base: 1, lg: 12 }}
          spacing={{ base: 14, lg: 8 }}
          alignItems="center"
        >
          {/* Left Column: Heading, Tagline, Description & Magnetic CTAs */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 7' }}>
            <VStack align="start" spacing={{ base: 6, md: 8 }}>
              {/* Badge */}
              <Box ref={badgeRef}>
                <HStack
                  spacing={2.5}
                  px={4}
                  py={1.5}
                  borderRadius="full"
                  bg={isDark ? 'rgba(212, 168, 83, 0.12)' : 'rgba(182, 138, 58, 0.12)'}
                  border="1px solid"
                  borderColor={isDark ? 'rgba(212, 168, 83, 0.35)' : 'rgba(182, 138, 58, 0.35)'}
                  backdropFilter="blur(10px)"
                >
                  <Text color={goldAccent} fontSize="xs" fontWeight="bold">
                    ✦
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={goldAccent}
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                  >
                    AWARD-WINNING HAUTE CUISINE
                  </Text>
                </HStack>
              </Box>

              {/* Oversized Cinematic Heading */}
              <Heading
                as="h1"
                fontFamily="'Playfair Display', serif"
                fontSize={{ base: '42px', sm: '56px', md: '70px', xl: '84px' }}
                fontWeight="800"
                lineHeight="1.06"
                color={textColor}
                letterSpacing="-0.03em"
              >
                <Box as="span" display="block" overflow="hidden">
                  <span ref={titleLine1Ref} style={{ display: 'inline-block' }}>
                    Taste the Moment.
                  </span>
                </Box>
                <Box as="span" display="block" overflow="hidden">
                  <span
                    ref={titleLine2Ref}
                    style={{
                      display: 'inline-block',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      color: goldAccent,
                    }}
                  >
                    Savor the Craft.
                  </span>
                </Box>
              </Heading>

              {/* Tagline & Description */}
              <Text
                ref={textRef}
                fontSize={{ base: 'md', md: 'lg' }}
                color={mutedText}
                maxW="540px"
                lineHeight="1.8"
                fontWeight="400"
              >
                Where Michelin-level dedication, single-origin roastery precision, and atmospheric
                sensory architecture coalesce into an unforgettable dining milestone.
              </Text>

              {/* Magnetic Action Buttons */}
              <Box ref={buttonsRef} pt={2}>
                <HStack spacing={5} wrap="wrap">
                  <MagneticButton strength={25}>
                    <Button
                      onClick={scrollToMenu}
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
                        boxShadow: `0 12px 30px ${goldAccent}55`,
                      }}
                      _active={{ transform: 'scale(0.98)' }}
                      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    >
                      EXPLORE MENU
                    </Button>
                  </MagneticButton>

                  <MagneticButton strength={15}>
                    <Button
                      onClick={scrollToReservation}
                      size="lg"
                      h="56px"
                      px={7}
                      variant="outline"
                      color={textColor}
                      borderColor={isDark ? 'rgba(212, 168, 83, 0.4)' : 'rgba(182, 138, 58, 0.4)'}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                      letterSpacing="0.06em"
                      leftIcon={<FiCalendar color={goldAccent} />}
                      _hover={{
                        borderColor: goldAccent,
                        bg: isDark ? 'rgba(212, 168, 83, 0.1)' : 'rgba(182, 138, 58, 0.1)',
                        transform: 'scale(1.02)',
                      }}
                      _active={{ transform: 'scale(0.98)' }}
                      transition="all 0.3s ease"
                    >
                      RESERVE TABLE
                    </Button>
                  </MagneticButton>
                </HStack>
              </Box>

              {/* Social Proof Line */}
              <HStack spacing={6} pt={2} color={mutedText} fontSize="xs">
                <HStack spacing={2}>
                  <Box color={goldAccent}>
                    <FiAward size={15} />
                  </Box>
                  <Text color={textColor} fontWeight="600">
                    Michelin Selected 2026
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Box color={goldAccent}>
                    <FiStar size={15} />
                  </Box>
                  <Text color={textColor} fontWeight="600">
                    4.9 / 5 Guest Rating
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Right Column: Special Floating Food Animation Beside Heading */}
          <Box gridColumn={{ base: 'span 1', lg: 'span 5' }} position="relative">
            <Box
              ref={foodCompositionRef}
              position="relative"
              w="100%"
              maxW={{ base: '380px', sm: '460px', lg: '500px' }}
              h={{ base: '380px', sm: '460px', lg: '500px' }}
              mx="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* 1. Subtle Circular Rotating Decorative Golden Element */}
              <Box
                ref={rotatingRingRef}
                position="absolute"
                w={{ base: '320px', sm: '400px', lg: '440px' }}
                h={{ base: '320px', sm: '400px', lg: '440px' }}
                borderRadius="full"
                border="1px dashed"
                borderColor={isDark ? 'rgba(212, 168, 83, 0.35)' : 'rgba(182, 138, 58, 0.4)'}
                pointerEvents="none"
              >
                {/* Micro accent dots on rotating ring */}
                <Box
                  position="absolute"
                  top="-4px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={goldAccent}
                  boxShadow={`0 0 10px ${goldAccent}`}
                />
                <Box
                  position="absolute"
                  bottom="-4px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={goldAccent}
                  boxShadow={`0 0 10px ${goldAccent}`}
                />
              </Box>

              {/* 2. Soft Glowing Shadow Behind Food */}
              <Box
                position="absolute"
                w={{ base: '260px', sm: '320px', lg: '360px' }}
                h={{ base: '260px', sm: '320px', lg: '360px' }}
                borderRadius="full"
                bg={
                  isDark
                    ? 'radial-gradient(circle, rgba(212,168,83,0.3) 0%, rgba(212,168,83,0.05) 50%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(182,138,58,0.25) 0%, rgba(182,138,58,0.05) 50%, transparent 70%)'
                }
                filter="blur(35px)"
                pointerEvents="none"
              />

              {/* 3. Main Signature Dish (Large High-Quality Presentation) */}
              <Box
                ref={mainDishRef}
                position="relative"
                w={{ base: '260px', sm: '320px', lg: '360px' }}
                h={{ base: '260px', sm: '320px', lg: '360px' }}
                borderRadius="full"
                p={2}
                bg={isDark ? '#151515' : '#FFFFFF'}
                border="2px solid"
                borderColor={isDark ? 'rgba(212, 168, 83, 0.45)' : 'rgba(182, 138, 58, 0.45)'}
                boxShadow={
                  isDark
                    ? '0 30px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 168, 83, 0.2)'
                    : '0 30px 60px rgba(0, 0, 0, 0.18), 0 0 30px rgba(182, 138, 58, 0.15)'
                }
                cursor="pointer"
                role="group"
                transition="box-shadow 0.4s ease"
                _hover={{
                  boxShadow: `0 35px 80px ${goldAccent}50`,
                }}
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhbGav7wyHH3SY5M84-L7lFO4vxxvaKf7Rb3RrDgHYxw&s=10"
                  alt="Signature Culinary Dish"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                  filter="contrast(108%) brightness(102%)"
                  transition="transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                  _groupHover={{ transform: 'scale(1.06)' }}
                />

                {/* Floating Dish Badge */}
                <Box
                  position="absolute"
                  bottom="6px"
                  right="16px"
                  bg={isDark ? '#0B0B0B' : '#FFFFFF'}
                  border="1.5px solid"
                  borderColor={goldAccent}
                  px={3.5}
                  py={1.5}
                  borderRadius="full"
                  boxShadow="0 10px 25px rgba(0,0,0,0.5)"
                  zIndex={4}
                >
                  <Text
                    fontSize="10px"
                    fontWeight="800"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color={goldAccent}
                  >
                    ★ CHEF'S SIGNATURE
                  </Text>
                </Box>
              </Box>

              {/* 4. Small Floating Ingredient 1: Basil / Fresh Herb Leaf (Top Left) */}
              <Box
                ref={ingredient1Ref}
                position="absolute"
                top="8%"
                left="4%"
                w={{ base: '54px', sm: '68px' }}
                h={{ base: '54px', sm: '68px' }}
                borderRadius="full"
                p={1.5}
                bg={isDark ? 'rgba(21, 21, 21, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
                border="1px solid"
                borderColor={goldAccent}
                backdropFilter="blur(8px)"
                boxShadow="0 15px 30px rgba(0,0,0,0.4)"
                zIndex={3}
                pointerEvents="none"
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC7jn-WhkC61ouZLKHHyWM9DygTN6wUmTjShXQes7cBw&s=10"
                  alt="Panner Masala"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                />
              </Box>

              {/* 5. Small Floating Ingredient 2: Ripe Cherry Tomato (Bottom Left) */}
              <Box
                ref={ingredient2Ref}
                position="absolute"
                bottom="10%"
                left="2%"
                w={{ base: '50px', sm: '64px' }}
                h={{ base: '50px', sm: '64px' }}
                borderRadius="full"
                p={1.5}
                bg={isDark ? 'rgba(21, 21, 21, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
                border="1px solid"
                borderColor={goldAccent}
                backdropFilter="blur(8px)"
                boxShadow="0 15px 30px rgba(0,0,0,0.4)"
                zIndex={3}
                pointerEvents="none"
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjWUM6a0S0lceL6CumjZ2ZVDZAaYZBgxD3MDgLqLtmXQ&s=10"
                  alt="Heritage Cherry Tomato"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                />
              </Box>

              {/* 6. Small Floating Ingredient 3: Fresh Rosemary Sprig (Top Right) */}
              <Box
                ref={ingredient3Ref}
                position="absolute"
                top="6%"
                right="4%"
                w={{ base: '58px', sm: '72px' }}
                h={{ base: '58px', sm: '72px' }}
                borderRadius="full"
                p={1.5}
                bg={isDark ? 'rgba(21, 21, 21, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
                border="1px solid"
                borderColor={goldAccent}
                backdropFilter="blur(8px)"
                boxShadow="0 15px 30px rgba(0,0,0,0.4)"
                zIndex={3}
                pointerEvents="none"
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcnIhpYxQl2ecP_5K67eg1hOTx0SXxTLhGJIQNx6kIWA&s=10"
                  alt="Fresh Rosemary"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                />
              </Box>

              {/* 7. Small Floating Ingredient 4: Star Anise / Artisan Spice (Bottom Right) */}
              <Box
                ref={ingredient4Ref}
                position="absolute"
                bottom="14%"
                right="0%"
                w={{ base: '48px', sm: '60px' }}
                h={{ base: '48px', sm: '60px' }}
                borderRadius="full"
                p={1.5}
                bg={isDark ? 'rgba(21, 21, 21, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
                border="1px solid"
                borderColor={goldAccent}
                backdropFilter="blur(8px)"
                boxShadow="0 15px 30px rgba(0,0,0,0.4)"
                zIndex={3}
                pointerEvents="none"
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2mJA91biAsa2T-7KhnIuR9EFy0H4C6eUO7ukm6WVRkQ&s=10"
                  alt="Star Anise Spice"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="full"
                />
              </Box>

              {/* 8. Animated Golden Particles */}
              <Box
                ref={particle1Ref}
                position="absolute"
                top="24%"
                left="18%"
                w="8px"
                h="8px"
                borderRadius="full"
                bg={goldAccent}
                boxShadow={`0 0 12px ${goldAccent}`}
                pointerEvents="none"
              />
              <Box
                ref={particle2Ref}
                position="absolute"
                top="30%"
                right="16%"
                w="10px"
                h="10px"
                borderRadius="full"
                bg={goldAccent}
                boxShadow={`0 0 14px ${goldAccent}`}
                pointerEvents="none"
              />
              <Box
                ref={particle3Ref}
                position="absolute"
                bottom="26%"
                left="22%"
                w="7px"
                h="7px"
                borderRadius="full"
                bg={goldAccent}
                boxShadow={`0 0 10px ${goldAccent}`}
                pointerEvents="none"
              />
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* Smooth Scroll Indicator at bottom */}
      <VStack
        ref={scrollIndicatorRef}
        position="absolute"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        spacing={1.5}
        cursor="pointer"
        onClick={scrollToMenu}
        opacity={0.8}
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
        zIndex={2}
      >
        <Text
          fontSize="9px"
          letterSpacing="0.25em"
          textTransform="uppercase"
          color={mutedText}
          fontWeight="700"
        >
          SCROLL TO EXPLORE
        </Text>
        <Box
          color={goldAccent}
          animation="bounce 2s infinite"
          sx={{
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
              '40%': { transform: 'translateY(5px)' },
              '60%': { transform: 'translateY(2px)' },
            },
          }}
        >
          <FiChevronDown size={18} />
        </Box>
      </VStack>
    </Box>
  );
};
