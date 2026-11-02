import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Flex,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { FiPlus, FiClock } from 'react-icons/fi';
import { IMenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FoodModal } from './FoodModal';

// High-end culinary photography fallbacks by keyword/category
export const getFallbackImage = (item: IMenuItem): string => {
  if (item.images && item.images.length > 0 && item.images[0]) {
    return item.images[0];
  }
  const name = item.name.toLowerCase();
  if (name.includes('macchiato') || name.includes('latte') || name.includes('cappuccino') || name.includes('coffee') || name.includes('espresso')) {
    return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('croissant') || name.includes('bakery') || name.includes('pastry') || name.includes('muffin') || name.includes('scone')) {
    return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('panini') || name.includes('sandwich') || name.includes('baguette') || name.includes('toast') || name.includes('turkey')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('tea') || name.includes('matcha') || name.includes('chai')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('dessert') || name.includes('cake') || name.includes('cheesecake') || name.includes('gelato')) {
    return 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';
};

interface FoodCardProps {
  item: IMenuItem;
  onSelect?: (item: IMenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');

  const imageUrl = getFallbackImage(item);
  const hasCustomizations = (item.variants && item.variants.length > 0) || (item.addOns && item.addOns.length > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If item has variants or add-ons, open modal so customer can choose
    if (hasCustomizations) {
      setIsModalOpen(true);
      return;
    }

    // Direct add to cart
    addItem(item, 1);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(item);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Box
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="2xl"
        overflow="hidden"
        cursor="pointer"
        role="group"
        transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
        _hover={{
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          borderColor: accentColor,
        }}
        onClick={handleCardClick}
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {/* Top Badges */}
        <Flex
          position="absolute"
          top={3}
          left={3}
          right={3}
          justifyContent="space-between"
          alignItems="center"
          zIndex={2}
          pointerEvents="none"
        >
          <HStack spacing={1}>
            {/* Veg / Non-Veg Indicator */}
            <Tooltip label={item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}>
              <Box
                w="5"
                h="5"
                p="2px"
                borderWidth="1.5px"
                borderColor={item.isVegetarian ? '#48BB78' : '#F56565'}
                borderRadius="md"
                bg="rgba(11, 11, 11, 0.7)"
                backdropFilter="blur(4px)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  w="2.5"
                  h="2.5"
                  borderRadius="full"
                  bg={item.isVegetarian ? '#48BB78' : '#F56565'}
                />
              </Box>
            </Tooltip>

            {item.isBestseller && (
              <Badge
                bg="rgba(212, 168, 83, 0.2)"
                color="#D4A853"
                border="1px solid rgba(212, 168, 83, 0.4)"
                fontSize="10px"
                px={2}
                borderRadius="full"
              >
                BESTSELLER
              </Badge>
            )}
            {item.isFeatured && (
              <Badge
                bg="rgba(212, 168, 83, 0.25)"
                color="#FFF3D6"
                border="1px solid #D4A853"
                fontSize="10px"
                px={2}
                borderRadius="full"
              >
                CHEF'S PICK
              </Badge>
            )}
          </HStack>

          {!item.isAvailable && (
            <Badge colorScheme="red" variant="solid" fontSize="10px" px={2} borderRadius="full">
              SOLD OUT
            </Badge>
          )}
        </Flex>

        {/* Dish Thumbnail */}
        <Box h="210px" overflow="hidden" position="relative" bg="#0B0B0B">
          <Image
            src={imageUrl}
            alt={item.name}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
            _groupHover={{ transform: 'scale(1.08)' }}
            loading="lazy"
          />
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            h="60px"
            bgGradient="linear(to-t, #151515 0%, transparent 100%)"
          />
        </Box>

        {/* Content */}
        <VStack p={5} align="stretch" spacing={3} flex={1} justify="space-between">
          <Box>
            <Flex justify="space-between" align="baseline">
              <Text
                fontFamily="'Playfair Display', serif"
                fontSize="md"
                fontWeight="700"
                color={headingColor}
                noOfLines={1}
                title={item.name}
                _groupHover={{ color: accentColor }}
                transition="color 0.2s"
              >
                {item.name}
              </Text>
            </Flex>

            <Text fontSize="xs" color={textColor} noOfLines={2} mt={1} lineHeight="1.6">
              {item.description || 'Artisan preparation crafted with fresh, premium organic ingredients.'}
            </Text>
          </Box>

          <Box pt={2} borderTop="1px solid" borderColor="rgba(212, 168, 83, 0.15)">
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="9px" color={textColor} letterSpacing="0.1em" textTransform="uppercase">
                  PRICE
                </Text>
                <Text
                  fontFamily="'Playfair Display', serif"
                  fontSize="lg"
                  fontWeight="800"
                  color={accentColor}
                >
                  ₹{item.basePrice.toFixed(2)}
                </Text>
              </VStack>

              <HStack spacing={2}>
                <HStack fontSize="xs" color={textColor} spacing={1}>
                  <FiClock />
                  <Text>{item.preparationTimeMinutes || 10}m</Text>
                </HStack>

                <Button
                  size="sm"
                  h="34px"
                  bg={accentColor}
                  color="#0B0B0B"
                  borderRadius="full"
                  leftIcon={hasCustomizations ? undefined : <FiPlus />}
                  isDisabled={!item.isAvailable}
                  onClick={handleQuickAdd}
                  fontSize="xs"
                  fontWeight="700"
                  px={4}
                  _hover={{
                    bg: '#E5CC78',
                    transform: 'scale(1.04)',
                  }}
                  transition="all 0.2s ease"
                >
                  {hasCustomizations ? 'Customize' : 'Order'}
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Modal Popup */}
      <FoodModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
