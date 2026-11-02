import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text, VStack, Heading } from '@chakra-ui/react';
import gsap from 'gsap';
import { BRAND_CONFIG } from '../../config/brand.config';

interface CinematicLoaderProps {
  onComplete?: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run if user hasn't reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsDone(true);
      onComplete?.();
      return;
    }

    const counterObj = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation: curtain split
        const exitTl = gsap.timeline({
          onComplete: () => {
            setIsDone(true);
            onComplete?.();
          },
        });

        exitTl.to(contentRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power3.in',
        });

        exitTl.to(
          topCurtainRef.current,
          {
            yPercent: -100,
            duration: 0.9,
            ease: 'expo.inOut',
          },
          '-=0.2'
        );

        exitTl.to(
          bottomCurtainRef.current,
          {
            yPercent: 100,
            duration: 0.9,
            ease: 'expo.inOut',
          },
          '<'
        );
      },
    });

    tl.to(counterObj, {
      value: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        setPercent(Math.round(counterObj.value));
      },
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <Box
      ref={containerRef}
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      zIndex={9999}
      pointerEvents="none"
      overflow="hidden"
    >
      {/* Top Curtain */}
      <Box
        ref={topCurtainRef}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="50%"
        bg="#0B0B0B"
        borderBottom="1px solid rgba(212, 168, 83, 0.2)"
      />

      {/* Bottom Curtain */}
      <Box
        ref={bottomCurtainRef}
        position="absolute"
        bottom={0}
        left={0}
        w="100%"
        h="50%"
        bg="#0B0B0B"
        borderTop="1px solid rgba(212, 168, 83, 0.2)"
      />

      {/* Central Content */}
      <Flex
        ref={contentRef}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        align="center"
        justify="center"
        direction="column"
        zIndex={2}
        p={6}
      >
        <VStack spacing={5} textAlign="center">
          <Flex
            w="64px"
            h="64px"
            borderRadius="full"
            border="1px solid rgba(212, 168, 83, 0.4)"
            align="center"
            justify="center"
            color="#D4A853"
            fontSize="2xl"
            boxShadow="0 0 30px rgba(212, 168, 83, 0.2)"
          >
            {BRAND_CONFIG.logoIcon}
          </Flex>

          <VStack spacing={1}>
            <Heading
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: '2xl', md: '4xl' }}
              letterSpacing="0.2em"
              color="#FFFFFF"
              fontWeight="800"
            >
              {BRAND_CONFIG.name}
            </Heading>
            <Text
              fontSize="xs"
              letterSpacing="0.3em"
              textTransform="uppercase"
              color="#D4A853"
              fontWeight="600"
            >
              HAUTE GASTRONOMIE
            </Text>
          </VStack>

          {/* Progress bar and counter */}
          <VStack spacing={2} pt={4} w="220px">
            <Box
              w="100%"
              h="2px"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                w={`${percent}%`}
                h="100%"
                bg="linear-gradient(90deg, #D4A853, #FFF3D6)"
                transition="width 0.1s linear"
              />
            </Box>
            <Text
              fontSize="xs"
              fontFamily="monospace"
              color="#9E9EA8"
              letterSpacing="0.1em"
            >
              {percent < 10 ? `0${percent}` : percent}%
            </Text>
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

