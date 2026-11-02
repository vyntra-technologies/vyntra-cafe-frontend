import React, { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { CinematicLoader } from '../components/common/CinematicLoader';
import { HeroSection } from '../components/home/HeroSection';
import { AboutSection } from '../components/home/AboutSection';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedDishes } from '../components/home/FeaturedDishes';
import { ExperienceSection } from '../components/home/ExperienceSection';
import { ChefsSpecial } from '../components/home/ChefsSpecial';
import { GallerySection } from '../components/home/GallerySection';
import { ReservationSection } from '../components/home/ReservationSection';

export const HomePage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const mainBg = useColorModeValue('#F8F5EF', '#0B0B0B');

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === 'all' || categoryId === selectedCategoryId) {
      setSelectedCategoryId(undefined);
    } else {
      setSelectedCategoryId(categoryId);
    }
    // Smooth scroll down to menu area
    const menuEl =
      document.getElementById('menu') ||
      document.getElementById('signature-menu') ||
      document.getElementById('featured-dishes');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToReservation = () => {
    const resEl = document.getElementById('reservation');
    if (resEl) {
      resEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box as="main" id="top" minH="100vh" bg={mainBg} position="relative">
      {/* Award-winning entrance loader */}
      <CinematicLoader />

      {/* 1. Cinematic Hero Section with Floating Signature Food & Animated Ingredients */}
      <HeroSection onReserveClick={handleScrollToReservation} />

      {/* 2. About Restaurant & Editorial Heritage with Animated Counters */}
      <AboutSection />

      {/* 3. Signature Menu: Interactive Categories & Food Cards with Horizontal Strip Toggle */}
      <Box id="signature-menu">
        <CategorySection
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />
        <FeaturedDishes
          selectedCategoryId={selectedCategoryId}
          onClearCategory={() => setSelectedCategoryId(undefined)}
        />
      </Box>

      {/* 4. Restaurant Experience (Full-width Parallax & Alternating Scenes) */}
      <Box id="experience">
        <ExperienceSection />
      </Box>

      {/* 5. Chef's Special Spotlight Presentation */}
      <Box id="chefs-special">
        <ChefsSpecial />
      </Box>

      {/* 6. Creative Masonry Gallery with Lightbox Interaction */}
      <GallerySection />

      {/* 7. Elegant Table Reservation */}
      <ReservationSection />
    </Box>
  );
};
