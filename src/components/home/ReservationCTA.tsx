import React, { useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand.config';

gsap.registerPlugin(ScrollTrigger);

export const ReservationCTA: React.FC = () => {
  const { isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bannerRef = useRef<HTMLDivElement>(null);

  const goldAccent = useColorModeValue('#A87916', '#D4AF37');
  const textColor = useColorModeValue('#666666', '#A1A1AA');
  const headingColor = useColorModeValue('#171717', '#FFFFFF');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      gsap.from(bannerRef.current, {
        scrollTrigger: {
          trigger: bannerRef.current,
          start: 'top 85%',
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  const handleBooking = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'checkout',
        redirectTo: '/reservations',
      });
      toast({
        title: 'Authentication Required',
        description: 'Please sign in or create an account to reserve your table.',
        status: 'info',
        duration: 3500,
      });
      navigate('/login');
      return;
    }

    navigate('/reservations');
  };

  return (
    <Box id="reservation" py={{ base: 14, md: 20 }}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <Box
          ref={bannerRef}
          p={{ base: 8, md: 16 }}
          borderRadius="3xl"
          bg={useColorModeValue(
            'radial-gradient(circle at 50% 50%, #FAF9F6 0%, #F1EFEA 100%)',
            'radial-gradient(circle at 50% 50%, #1A1A20 0%, #111114 100%)'
          )}
          borderWidth="1px"
          borderColor={useColorModeValue('rgba(168, 121, 22, 0.25)', 'rgba(212, 175, 55, 0.3)')}
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          {/* Subtle gold decorative ring */}
          <Box
            position="absolute"
            top="-50%"
            left="50%"
            transform="translateX(-50%)"
            w="600px"
            h="600px"
            borderRadius="full"
            border="1px solid"
            borderColor={useColorModeValue('rgba(168, 121, 22, 0.1)', 'rgba(212, 175, 55, 0.1)')}
            pointerEvents="none"
          />

          <VStack spacing={4} maxW="2xl" mx="auto" position="relative" zIndex={1}>
            <HStack
              spacing={2}
              py={1}
              px={3.5}
              borderRadius="full"
              borderWidth="1px"
              borderColor={useColorModeValue('rgba(168, 121, 22, 0.3)', 'rgba(212, 175, 55, 0.3)')}
            >
              <Text fontSize="xs" color={goldAccent}>✦</Text>
              <Text fontSize="xs" fontWeight="700" letterSpacing="2px" textTransform="uppercase" color={goldAccent}>
                TABLE SERVICE
              </Text>
            </HStack>

            <Heading
              fontFamily="heading"
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              fontWeight="800"
              color={headingColor}
            >
              {BRAND_CONFIG.reservationHeading}
            </Heading>

            <Text fontSize="md" color={textColor} lineHeight="tall">
              Whether you are planning an intimate dinner for two, a weekend brunch with family, or a business gathering, our hosts ensure every moment is memorable.
            </Text>

            <Button
              size="lg"
              h="14"
              px={10}
              colorScheme="gold"
              borderRadius="full"
              fontSize="md"
              leftIcon={<FiCalendar />}
              rightIcon={<FiArrowRight />}
              onClick={handleBooking}
              mt={2}
            >
              {BRAND_CONFIG.reservationCta}
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

