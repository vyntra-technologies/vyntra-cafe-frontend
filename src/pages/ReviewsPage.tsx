import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Flex,
  Avatar,
  Badge,
  useColorModeValue,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiEdit3, FiStar, FiFilter } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { StarRating } from '../components/common/StarRating';
import { LoadingState } from '../components/common/LoadingState';
import { reviewService } from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import { IReview } from '../types';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number>(0); // 0 = all

  // Write Review form state
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const fetchReviews = () => {
    setIsLoading(true);
    reviewService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews([
            {
              _id: 'rev-1',
              customerName: 'Alexander Hayes',
              rating: 5,
              comment: 'The Signature Caramel Macchiato is unquestionably the finest roast in town. Incredibly smooth espresso with velvety microfoam. A true gem in our neighborhood.',
              status: 'approved',
              createdAt: '2026-10-25',
            },
            {
              _id: 'rev-2',
              customerName: 'Sophia Lin',
              rating: 5,
              comment: 'Warm turkey and brie panini on sourdough exceeded every expectation! The atmosphere is chic yet cozy, making it my favorite morning workspace.',
              status: 'approved',
              createdAt: '2026-10-26',
            },
            {
              _id: 'rev-3',
              customerName: 'Marcus Vance',
              rating: 5,
              comment: 'Flawless table reservation experience and lightning-quick service. Our table was waiting with fresh water, and the croissants melt in your mouth.',
              status: 'approved',
              createdAt: '2026-10-28',
            },
            {
              _id: 'rev-4',
              customerName: 'Claire Dupond',
              rating: 4,
              comment: 'Exceptional French pastries and single origin pour overs. Seating gets slightly crowded on Sunday mornings, so booking in advance is a smart move.',
              status: 'approved',
              createdAt: '2026-10-29',
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      toast({
        title: 'Fields Required',
        description: 'Please provide your name and review feedback.',
        status: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.create({
        customerName: authorName.trim(),
        rating,
        comment: comment.trim(),
      });

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your valuable feedback! It will appear after moderation.',
        status: 'success',
        duration: 4000,
      });

      onClose();
      setComment('');
      fetchReviews();
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Could not submit review.',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 0) return true;
    return r.rating === filterRating;
  });

  return (
    <PageContainer>
      {/* Top Banner */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'flex-end' }} mb={10} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Badge
            bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
            color={accentColor}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="1px"
            mb={2}
          >
            TESTIMONIALS & RATINGS
          </Badge>
          <Heading fontFamily="playfair, serif" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" color={headingColor}>
            Patron Reviews & Experiences
          </Heading>
          <Text fontSize="md" color={textColor} mt={1}>
            Real stories and ratings shared by our cherished cafe guests.
          </Text>
        </Box>
        <Button
          bg={accentColor}
          color={btnTextColor}
          _hover={{ opacity: 0.9 }}
          size="lg"
          borderRadius="2xl"
          leftIcon={<FiEdit3 />}
          onClick={onOpen}
        >
          Write a Review
        </Button>
      </Flex>

      {/* Ratings Filter Pills */}
      <HStack spacing={2} mb={8} wrap="wrap">
        <Button
          size="sm"
          borderRadius="full"
          bg={filterRating === 0 ? accentColor : 'transparent'}
          color={filterRating === 0 ? btnTextColor : headingColor}
          borderWidth="1px"
          borderColor={filterRating === 0 ? accentColor : borderColor}
          _hover={{ opacity: 0.9 }}
          onClick={() => setFilterRating(0)}
        >
          All Stars ({reviews.length})
        </Button>
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = reviews.filter((r) => r.rating === stars).length;
          return (
            <Button
              key={stars}
              size="sm"
              borderRadius="full"
              bg={filterRating === stars ? accentColor : 'transparent'}
              color={filterRating === stars ? btnTextColor : headingColor}
              borderWidth="1px"
              borderColor={filterRating === stars ? accentColor : borderColor}
              _hover={{ opacity: 0.9 }}
              onClick={() => setFilterRating(stars)}
            >
              {stars} ★ ({count})
            </Button>
          );
        })}
      </HStack>

      {/* Reviews Grid */}
      {isLoading ? (
        <LoadingState type="list" count={4} />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filteredReviews.map((rev) => (
            <Box
              key={rev._id}
              bg={cardBg}
              p={6}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box mb={4}>
                <Flex justify="space-between" align="center" mb={3}>
                  <StarRating rating={rev.rating} size={4} />
                  <Text fontSize="xs" color={textColor}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
                <Text fontSize="sm" color={textColor} lineHeight="tall" fontStyle="italic">
                  "{rev.comment}"
                </Text>
              </Box>

              <HStack spacing={3} pt={4} borderTopWidth="1px" borderColor={borderColor}>
                <Avatar size="sm" name={rev.customerName} bg={accentColor} color="white" />
                <Box>
                  <Text fontWeight="700" fontSize="sm" color={headingColor}>
                    {rev.customerName}
                  </Text>
                  <Text fontSize="10px" color={textColor}>
                    Verified Cafe Guest
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Write Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent as="form" onSubmit={handleCreateReview} bg={cardBg} borderRadius="2xl" borderColor={borderColor} borderWidth="1px">
          <ModalHeader color={headingColor}>Share Your Vyntra Experience</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Your Name *
                </Text>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Liam Parker"
                  borderRadius="xl"
                  isRequired
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={2} color={textColor}>
                  Your Rating *
                </Text>
                <StarRating
                  rating={rating}
                  isInteractive
                  onRatingChange={(r) => setRating(r)}
                  size={6}
                />
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="xs" mb={1} color={textColor}>
                  Your Review / Thoughts *
                </Text>
                <Textarea
                  placeholder="Describe the coffee roast, food flavors, ambiance, or customer hospitality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  borderRadius="xl"
                  rows={4}
                  isRequired
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Cancel
            </Button>
            <Button
              type="submit"
              bg={accentColor}
              color={btnTextColor}
              _hover={{ opacity: 0.9 }}
              borderRadius="xl"
              isLoading={isSubmitting}
            >
              Post Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};
