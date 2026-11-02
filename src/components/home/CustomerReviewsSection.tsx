import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Avatar,
  Button,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowRight, FiEdit3 } from 'react-icons/fi';
import { reviewService } from '../../services/review.service';
import { IReview } from '../../types';
import { StarRating } from '../common/StarRating';

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardBg = useColorModeValue('#FFFFFF', '#181A1D');
  const borderColor = useColorModeValue('#E8DED1', '#2B2E33');
  const textColor = useColorModeValue('#716B65', '#B5B7BC');
  const headingColor = useColorModeValue('#211D1A', '#F7F7F7');
  const accentColor = useColorModeValue('#F06B16', '#FF7A1A');

  useEffect(() => {
    reviewService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          // Default testimonials if backend is clean
          setReviews([
            {
              _id: '1',
              customerName: 'Alexander Hayes',
              rating: 5,
              comment: 'The Signature Caramel Macchiato is unquestionably the finest roast in town. Incredibly smooth espresso with velvety microfoam. A true gem in our neighborhood.',
              status: 'approved',
              createdAt: '2026-10-25',
            },
            {
              _id: '2',
              customerName: 'Sophia Lin',
              rating: 5,
              comment: 'Warm turkey and brie panini on sourdough exceeded every expectation! The atmosphere is chic yet cozy, making it my favorite morning workspace.',
              status: 'approved',
              createdAt: '2026-10-26',
            },
            {
              _id: '3',
              customerName: 'Marcus Vance',
              rating: 5,
              comment: 'Flawless table reservation experience and lightning-quick service. Our table was waiting with fresh water, and the croissants melt in your mouth.',
              status: 'approved',
              createdAt: '2026-10-28',
            },
          ]);
        }
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Box py={{ base: 12, md: 20 }} bg={useColorModeValue('#FAF5EE', '#0C0E11')}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'flex-end' }}
          mb={10}
          gap={4}
        >
          <Box>
            <Text fontSize="xs" fontWeight="700" color={accentColor} letterSpacing="2px" textTransform="uppercase">
              GUEST EXPERIENCES
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor} mt={1}>
              What Our Visitors Say
            </Heading>
          </Box>
          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/reviews"
              variant="outline"
              borderRadius="xl"
              leftIcon={<FiEdit3 />}
              fontSize="sm"
            >
              Write Review
            </Button>
            <Button
              as={RouterLink}
              to="/reviews"
              variant="ghost"
              color={accentColor}
              rightIcon={<FiArrowRight />}
              fontWeight="700"
              _hover={{ bg: 'transparent', transform: 'translateX(4px)' }}
            >
              All Reviews
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {reviews.slice(0, 3).map((review) => (
            <Box
              key={review._id}
              bg={cardBg}
              p={6}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              boxShadow="sm"
            >
              <VStack align="flex-start" spacing={4} mb={6}>
                <StarRating rating={review.rating} size={4} />
                <Text fontSize="sm" color={textColor} lineHeight="tall" fontStyle="italic">
                  "{review.comment}"
                </Text>
              </VStack>

              <HStack spacing={3} pt={4} borderTopWidth="1px" borderColor={borderColor}>
                <Avatar size="sm" name={review.customerName} bg={accentColor} color="white" />
                <Box>
                  <Text fontWeight="700" fontSize="sm" color={headingColor}>
                    {review.customerName}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    Verified Patron
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

