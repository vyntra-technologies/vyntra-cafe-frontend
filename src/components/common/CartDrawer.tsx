import React from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Image,
  IconButton,
  Divider,
  useColorModeValue,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getFallbackImage } from './FoodCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, totalCount, subtotal, grandTotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const isDark = useColorModeValue(false, true);
  const bg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const textColor = useColorModeValue('#202020', '#F8F5EF');
  const mutedText = useColorModeValue('#666666', '#9E9EA8');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleBrowseMenu = () => {
    onClose();
    const el = document.getElementById('signature-menu') || document.getElementById('menu');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="rgba(11, 11, 11, 0.85)" backdropFilter="blur(12px)" />
      <DrawerContent bg={bg} borderLeft="1px solid" borderColor={borderColor} color={textColor}>
        <DrawerCloseButton color={textColor} top={5} right={5} size="lg" />

        <DrawerHeader pt={6} pb={4} borderBottom="1px solid" borderColor={borderColor}>
          <HStack spacing={3}>
            <Box color={goldAccent} fontSize="xl">
              <FiShoppingBag />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontFamily="'Playfair Display', serif" fontSize="xl" fontWeight="800">
                Your Culinary Bag
              </Text>
              <Text fontSize="xs" color={goldAccent} fontWeight="600">
                {totalCount} {totalCount === 1 ? 'dish selected' : 'dishes selected'}
              </Text>
            </VStack>
          </HStack>
        </DrawerHeader>

        <DrawerBody py={6}>
          {items.length === 0 ? (
            <VStack spacing={5} py={16} textAlign="center">
              <Box fontSize="4xl">🍽️</Box>
              <VStack spacing={1}>
                <Text fontFamily="'Playfair Display', serif" fontSize="lg" fontWeight="700">
                  Your bag is empty
                </Text>
                <Text fontSize="xs" color={mutedText} maxW="240px">
                  Explore our seasonal menu to add chef-curated selections.
                </Text>
              </VStack>
              <Button
                onClick={handleBrowseMenu}
                size="sm"
                bg={goldAccent}
                color="#0B0B0B"
                borderRadius="full"
                fontWeight="700"
                px={6}
                _hover={{ bg: isDark ? '#E5CC78' : '#8E672E', color: '#FFFFFF' }}
              >
                Explore Menu
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {items.map((cartItem) => {
                const item = cartItem.menuItem;
                const img = getFallbackImage(item);
                const itemTotal = cartItem.totalPrice;

                return (
                  <Box
                    key={cartItem.cartItemId}
                    p={3.5}
                    borderRadius="2xl"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow="0 6px 18px rgba(0,0,0,0.06)"
                  >
                    <HStack spacing={3.5} align="center">
                      <Image
                        src={img}
                        alt={item.name}
                        w="64px"
                        h="64px"
                        borderRadius="xl"
                        objectFit="cover"
                      />
                      <VStack align="start" spacing={0.5} flex="1">
                        <Text
                          fontFamily="'Playfair Display', serif"
                          fontSize="sm"
                          fontWeight="700"
                          noOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {cartItem.selectedVariant && (
                          <Text fontSize="10px" color={goldAccent}>
                            {cartItem.selectedVariant.name}
                          </Text>
                        )}
                        <Text fontSize="xs" fontWeight="800" color={goldAccent} pt={0.5}>
                          ₹{itemTotal.toFixed(2)}
                        </Text>
                      </VStack>

                      {/* Quantity Controls */}
                      <HStack spacing={1.5}>
                        <IconButton
                          aria-label="Decrease"
                          icon={cartItem.quantity === 1 ? <FiTrash2 size={12} /> : <FiMinus size={12} />}
                          size="xs"
                          variant="outline"
                          borderRadius="full"
                          borderColor={borderColor}
                          color={cartItem.quantity === 1 ? 'red.400' : textColor}
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                        />
                        <Text fontSize="xs" fontWeight="700" px={1.5}>
                          {cartItem.quantity}
                        </Text>
                        <IconButton
                          aria-label="Increase"
                          icon={<FiPlus size={12} />}
                          size="xs"
                          variant="outline"
                          borderRadius="full"
                          borderColor={borderColor}
                          color={textColor}
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                        />
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter
            borderTop="1px solid"
            borderColor={borderColor}
            flexDirection="column"
            gap={3}
            p={6}
          >
            <Flex justify="space-between" align="center" w="100%">
              <Text fontSize="xs" color={mutedText} letterSpacing="0.08em" textTransform="uppercase">
                Estimated Total
              </Text>
              <Text fontFamily="'Playfair Display', serif" fontSize="xl" fontWeight="800" color={goldAccent}>
                ₹{grandTotal.toFixed(2)}
              </Text>
            </Flex>

            <Button
              onClick={handleCheckout}
              w="100%"
              h="50px"
              bg={goldAccent}
              color="#0B0B0B"
              fontSize="xs"
              fontWeight="800"
              letterSpacing="0.1em"
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              _hover={{
                bg: isDark ? '#E5CC78' : '#8E672E',
                color: isDark ? '#0B0B0B' : '#FFFFFF',
                boxShadow: `0 8px 24px ${goldAccent}40`,
              }}
              transition="all 0.25s ease"
            >
              PROCEED TO CHECKOUT
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
