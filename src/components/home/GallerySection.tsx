import React, { useState, useRef, useEffect } from 'react';
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
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMaximize2, FiInstagram } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageLightbox } from '../common/ImageLightbox';

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  url: string;
  aspectRatio?: number;
}

const galleryData: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'The Royal Chai Ritual',
    category: 'Chai & Coffee',
    caption: 'Authentic Indian masala chai and handcrafted coffee, brewed to perfection.',
    url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 4 / 3,
  },
  {
    id: 'g-2',
    title: 'Desi Street Indulgence',
    category: 'Indian Street Bites',
    caption: 'A delicious celebration of Indian street food classics with a modern twist.',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 3 / 4,
  },
  {
    id: 'g-3',
    title: 'The Signature Dining Experience',
    category: 'Cafe Ambience',
    caption: 'Warm lighting, elegant interiors and comfortable spaces for memorable moments.',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 4 / 3,
  },
  {
    id: 'g-4',
    title: 'Sweet Symphony',
    category: 'Desserts & Bakery',
    caption: 'Freshly prepared cakes, pastries and delightful handcrafted desserts.',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 3 / 4,
  },
  {
    id: 'g-5',
    title: 'Spice Symphony',
    category: 'Indian Specials',
    caption: 'Rich Indian flavours, aromatic spices and traditional favourites.',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 4 / 3,
  },
  {
    id: 'g-6',
    title: 'The Midnight Cravings',
    category: 'Burgers & Pizza',
    caption: 'Loaded burgers, cheesy pizzas and irresistible cafe favourites.',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 4 / 3,
  },
];

const categories = [
  'All',
  'Indian Specials',
  'Indian Street Bites',
  'Chai & Coffee',
  'Burgers & Pizza',
  'Desserts & Bakery',
  'Cafe Ambience',
];

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isDark = useColorModeValue(false, true);
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  const filteredItems =
    selectedCategory === 'All'
      ? galleryData
      : galleryData.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const items = gridRef.current?.children;
      if (items && items.length > 0) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
          y: 40,
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedCategory]);

  return (
    <Box id="gallery" ref={sectionRef} py={{ base: 20, md: 32 }} bg={bg} position="relative">
      <Container maxW="7xl" px={{ base: 6, md: 10 }}>
        {/* Section Header */}
        <VStack spacing={4} textAlign="center" mb={12}>
          <Badge
            px={4}
            py={1.5}
            borderRadius="full"
            bg={isDark ? 'rgba(212, 168, 83, 0.12)' : 'rgba(182, 138, 58, 0.12)'}
            border="1px solid"
            borderColor={borderColor}
            color={goldAccent}
            fontSize="xs"
            letterSpacing="0.25em"
            textTransform="uppercase"
            fontWeight="700"
          >
            VISUAL ARCHIVE
          </Badge>

          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            fontSize={{ base: '34px', sm: '46px', md: '56px' }}
            fontWeight="800"
            color={headingColor}
            lineHeight="1.15"
          >
            Moments of Culinary Craft.
          </Heading>

          <Text fontSize="sm" color={textColor} maxW="580px">
            Explore our visual gallery capturing the intimacy of our dining room, precision at the pass,
            and the morning roastery ritual.
          </Text>

          {/* Category Filter Pills */}
          <HStack spacing={2} wrap="wrap" justify="center" pt={4}>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                borderRadius="full"
                px={5}
                py={2}
                fontSize="xs"
                letterSpacing="0.05em"
                bg={selectedCategory === cat ? goldAccent : cardBg}
                color={selectedCategory === cat ? '#0B0B0B' : headingColor}
                border="1px solid"
                borderColor={selectedCategory === cat ? goldAccent : borderColor}
                _hover={{
                  bg: selectedCategory === cat ? (isDark ? '#E5CC78' : '#9E7428') : 'rgba(212, 168, 83, 0.15)',
                  borderColor: goldAccent,
                }}
                onClick={() => setSelectedCategory(cat)}
                transition="all 0.2s ease"
              >
                {cat}
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Masonry-Style Image Grid */}
        <SimpleGrid
          ref={gridRef}
          columns={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 6, md: 8 }}
        >
          {filteredItems.map((item) => (
            <Box
              key={item.id}
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              border="1px solid"
              borderColor={borderColor}
              boxShadow={useColorModeValue('0 15px 35px rgba(0,0,0,0.08)', '0 15px 35px rgba(0,0,0,0.5)')}
              cursor="pointer"
              role="group"
              onClick={() => setLightboxImage(item)}
              bg={cardBg}
              aspectRatio={item.aspectRatio || 1}
            >
              <Image
                src={item.url}
                alt={item.title}
                w="100%"
                h="100%"
                objectFit="cover"
                transition="transform 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease"
                _groupHover={{ transform: 'scale(1.08)', filter: 'contrast(108%)' }}
              />

              {/* Ambient Hover Overlay */}
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(to-t, rgba(11, 11, 11, 0.95) 0%, rgba(11, 11, 11, 0.3) 50%, transparent 100%)"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.4s ease"
              />

              {/* Magnify Icon Trigger */}
              <Flex
                position="absolute"
                top={4}
                right={4}
                w="38px"
                h="38px"
                borderRadius="full"
                bg="rgba(11, 11, 11, 0.75)"
                border="1px solid rgba(212, 168, 83, 0.4)"
                backdropFilter="blur(8px)"
                align="center"
                justify="center"
                color="#D4A853"
                opacity={0}
                transform="translateY(-8px)"
                _groupHover={{ opacity: 1, transform: 'translateY(0)' }}
                transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              >
                <FiMaximize2 size={16} />
              </Flex>

              {/* Bottom Details Revealed on Hover */}
              <VStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={5}
                align="start"
                spacing={1}
                transform="translateY(8px)"
                opacity={0}
                _groupHover={{ transform: 'translateY(0)', opacity: 1 }}
                transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              >
                <Badge
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg="rgba(212, 168, 83, 0.2)"
                  color="#D4A853"
                  fontSize="10px"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                >
                  {item.category}
                </Badge>
                <Text
                  fontFamily="'Playfair Display', serif"
                  fontSize="lg"
                  fontWeight="700"
                  color="#FFFFFF"
                >
                  {item.title}
                </Text>
                <Text fontSize="xs" color="#B8B8C2" noOfLines={2}>
                  {item.caption}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Instagram / Social Proof Footer */}
        <Flex justify="center" mt={12}>
          <HStack
            as="a"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            spacing={2}
            px={6}
            py={3}
            borderRadius="full"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            color={headingColor}
            fontSize="xs"
            fontWeight="600"
            _hover={{
              bg: isDark ? 'rgba(212, 168, 83, 0.15)' : 'rgba(182, 138, 58, 0.15)',
              borderColor: goldAccent,
              color: goldAccent,
            }}
            transition="all 0.2s ease"
          >
            <FiInstagram />
            <Text>Follow @milobistro on Instagram for daily culinary stories</Text>
          </HStack>
        </Flex>
      </Container>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        image={lightboxImage}
      />
    </Box>
  );
};
