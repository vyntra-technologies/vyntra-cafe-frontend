import React from 'react';
import { HStack, Icon } from '@chakra-ui/react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number; // 1-5
  maxRating?: number;
  size?: number | string;
  isInteractive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 4,
  isInteractive = false,
  onRatingChange,
}) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    let StarIcon = FaRegStar;
    if (rating >= i) {
      StarIcon = FaStar;
    } else if (rating >= i - 0.5) {
      StarIcon = FaStarHalfAlt;
    }

    stars.push(
      <Icon
        key={i}
        as={StarIcon}
        boxSize={size}
        color={rating >= i - 0.5 ? '#D4AF72' : 'gray.400'}
        cursor={isInteractive ? 'pointer' : 'default'}
        transition="transform 0.15s ease"
        _hover={isInteractive ? { transform: 'scale(1.2)' } : undefined}
        onClick={() => isInteractive && onRatingChange && onRatingChange(i)}
      />
    );
  }

  return <HStack spacing={1}>{stars}</HStack>;
};

