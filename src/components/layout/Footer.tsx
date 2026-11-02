import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  Divider,
  Input,
  Button,
} from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';
import { FiPhone, FiMail, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { settingsService } from '../../services/settings.service';
import { ISettings } from '../../types';
import { BRAND_CONFIG } from '../../config/brand.config';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<ISettings | null>(null);

  useEffect(() => {
    settingsService
      .get()
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  const address = settings?.address;
  const addressString = address
    ? `${address.street || '124 Gourmet Boulevard'}, ${address.city || 'Metropolis'}, ${address.state || 'NY'} ${address.postalCode || '10001'}`
    : '450 Lexington Avenue, New York, NY 10017';

  const contactPhone = settings?.contact?.phone || '+1 (555) 890-4321';
  const contactEmail = settings?.contact?.email || 'hospitality@vyntracafe.com';

  const scrollToAnchor = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      as="footer"
      id="contact"
      bg={bg}
      color={textColor}
      borderTop="1px solid"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
    >
      <Container maxW="7xl" py={{ base: 14, md: 20 }} px={{ base: 6, md: 10 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 10, lg: 12 }}>
          {/* Brand Column */}
          <Stack spacing={4}>
            <Flex alignItems="center" gap={3}>
              <Flex
                w="10"
                h="10"
                borderRadius="full"
                borderWidth="1.5px"
                borderColor={goldAccent}
                color={goldAccent}
                alignItems="center"
                justifyContent="center"
                fontSize="xl"
                fontWeight="bold"
              >
                {BRAND_CONFIG.logoIcon}
              </Flex>
              <Text
                fontFamily="'Playfair Display', serif"
                fontSize="2xl"
                fontWeight="800"
                color={headingColor}
                letterSpacing="1px"
              >
                {BRAND_CONFIG.name}
              </Text>
            </Flex>

            <Text fontSize="sm" fontStyle="italic" color={goldAccent} fontWeight="600">
              "{BRAND_CONFIG.tagline}"
            </Text>

            <Text fontSize="xs" lineHeight="1.8">
              A bespoke dining atelier uniting classical gastronomic discipline with modern
              sensory design and ethical sustainability.
            </Text>

            <HStack spacing={3} pt={2}>
              <IconButton
                as="a"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                icon={<FaInstagram />}
                variant="ghost"
                size="sm"
                borderRadius="full"
                color={textColor}
                _hover={{ color: goldAccent, bg: 'rgba(212, 168, 83, 0.1)' }}
              />
              <IconButton
                as="a"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                icon={<FaTwitter />}
                variant="ghost"
                size="sm"
                borderRadius="full"
                color={textColor}
                _hover={{ color: goldAccent, bg: 'rgba(212, 168, 83, 0.1)' }}
              />
              <IconButton
                as="a"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                icon={<FaFacebook />}
                variant="ghost"
                size="sm"
                borderRadius="full"
                color={textColor}
                _hover={{ color: goldAccent, bg: 'rgba(212, 168, 83, 0.1)' }}
              />
            </HStack>
          </Stack>

          {/* Quick Navigation Links */}
          <Stack spacing={3}>
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize="sm"
              fontWeight="800"
              color={headingColor}
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              The Experience
            </Text>
            <Box
              as="button"
              textAlign="left"
              fontSize="xs"
              _hover={{ color: goldAccent, transform: 'translateX(4px)' }}
              transition="all 0.2s"
              onClick={() => scrollToAnchor('top')}
            >
              Atelier Overview
            </Box>
            <Box
              as="button"
              textAlign="left"
              fontSize="xs"
              _hover={{ color: goldAccent, transform: 'translateX(4px)' }}
              transition="all 0.2s"
              onClick={() => scrollToAnchor('signature-menu')}
            >
              Signature Menu
            </Box>
            <Box
              as="button"
              textAlign="left"
              fontSize="xs"
              _hover={{ color: goldAccent, transform: 'translateX(4px)' }}
              transition="all 0.2s"
              onClick={() => scrollToAnchor('about')}
            >
              Our Heritage & Craft
            </Box>
            <Box
              as="button"
              textAlign="left"
              fontSize="xs"
              _hover={{ color: goldAccent, transform: 'translateX(4px)' }}
              transition="all 0.2s"
              onClick={() => scrollToAnchor('gallery')}
            >
              Visual Archives
            </Box>
            <Box
              as="button"
              textAlign="left"
              fontSize="xs"
              _hover={{ color: goldAccent, transform: 'translateX(4px)' }}
              transition="all 0.2s"
              onClick={() => scrollToAnchor('reservation')}
            >
              Reserve a Table
            </Box>
          </Stack>

          {/* Operating Hours */}
          <Stack spacing={3}>
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize="sm"
              fontWeight="800"
              color={headingColor}
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Dining & Salon Hours
            </Text>
            <HStack align="flex-start" spacing={3} fontSize="xs">
              <Box color={goldAccent} mt={1}>
                <FiClock />
              </Box>
              <Box>
                <Text fontWeight="700" color={headingColor}>
                  Monday – Friday
                </Text>
                <Text>Morning Roastery: 07:00 AM – 11:30 AM</Text>
                <Text>Dinner Service: 05:30 PM – 11:00 PM</Text>
              </Box>
            </HStack>
            <HStack align="flex-start" spacing={3} fontSize="xs">
              <Box color={goldAccent} mt={1}>
                <FiClock />
              </Box>
              <Box>
                <Text fontWeight="700" color={headingColor}>
                  Saturday – Sunday
                </Text>
                <Text>Weekend Brunch: 08:30 AM – 03:00 PM</Text>
                <Text>Grand Tasting: 05:00 PM – 11:30 PM</Text>
              </Box>
            </HStack>
          </Stack>

          {/* Location & Private Inquiries */}
          <Stack spacing={3}>
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize="sm"
              fontWeight="800"
              color={headingColor}
              letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Location & Contact
            </Text>
            <HStack align="flex-start" spacing={3} fontSize="xs">
              <Box color={goldAccent} mt={0.5}>
                <FiMapPin />
              </Box>
              <Text>{addressString}</Text>
            </HStack>
            <HStack align="center" spacing={3} fontSize="xs">
              <Box color={goldAccent}>
                <FiPhone />
              </Box>
              <Text as="a" href={`tel:${contactPhone}`} _hover={{ color: goldAccent }}>
                {contactPhone}
              </Text>
            </HStack>
            <HStack align="center" spacing={3} fontSize="xs">
              <Box color={goldAccent}>
                <FiMail />
              </Box>
              <Text as="a" href={`mailto:${contactEmail}`} _hover={{ color: goldAccent }}>
                {contactEmail}
              </Text>
            </HStack>
          </Stack>
        </SimpleGrid>

        <Divider borderColor={borderColor} my={10} />

        {/* Bottom bar */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={4}
          fontSize="xs"
        >
          <Text>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</Text>
          <HStack spacing={6}>
            <Text as={RouterLink} to="/privacy" _hover={{ color: goldAccent }}>
              Privacy Policy
            </Text>
            <Text as={RouterLink} to="/terms" _hover={{ color: goldAccent }}>
              Dining Terms
            </Text>
            <Text as={RouterLink} to="/login" _hover={{ color: goldAccent }}>
              Guest Portal
            </Text>
            <Text as={RouterLink} to="/login?role=admin" _hover={{ color: goldAccent }}>
              Staff & Management
            </Text>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
