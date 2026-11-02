import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Image,
  Input,
  IconButton,
  Divider,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrash2, FiArrowRight, FiTag, FiShoppingBag, FiCheck, FiX } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { EmptyState } from '../components/common/EmptyState';
import { getFallbackImage } from '../components/common/FoodCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    taxAmount,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isApplyingCoupon,
  } = useCart();

  const { isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    const ok = await applyCoupon(couponInput);
    if (ok) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'checkout',
        redirectTo: '/checkout',
      });
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon="🛍️"
          title="Your Cart is Empty"
          description="Looks like you haven't added any artisan dishes or coffee to your basket yet. Explore our handcrafted menu to get started."
          actionText="Explore Full Menu"
          actionLink="/menu"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <VStack spacing={2} align="flex-start" mb={8}>
        <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
          Your Dining Basket
        </Heading>
        <Text fontSize="sm" color={textColor}>
          Review your selected items, apply promotional vouchers, and proceed to checkout.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="flex-start">
        {/* Left 2 Cols: Cart Items */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <VStack spacing={4} align="stretch">
            {items.map((item) => (
              <Box
                key={item.cartItemId}
                bg={cardBg}
                p={{ base: 4, md: 5 }}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align={{ sm: 'center' }}>
                  <Image
                    src={getFallbackImage(item.menuItem)}
                    alt={item.menuItem.name}
                    w={{ base: '100%', sm: '90px' }}
                    h="90px"
                    objectFit="cover"
                    borderRadius="xl"
                  />

                  <VStack align="flex-start" spacing={1} flex={1}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="700" fontSize="md" color={headingColor}>
                        {item.menuItem.name}
                      </Text>
                      <IconButton
                        aria-label="Remove item"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeItem(item.cartItemId)}
                      />
                    </HStack>

                    {item.selectedVariant && (
                      <Badge
                        bg={useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)')}
                        color={accentColor}
                        variant="subtle"
                        fontSize="10px"
                        borderRadius="md"
                        px={2}
                        py={0.5}
                      >
                        Size: {item.selectedVariant.name}
                      </Badge>
                    )}

                    {item.selectedAddOns.length > 0 && (
                      <Text fontSize="xs" color={textColor}>
                        Add-ons: {item.selectedAddOns.map((a) => a.name).join(', ')}
                      </Text>
                    )}

                    {item.notes && (
                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                        Note: "{item.notes}"
                      </Text>
                    )}

                    <Flex justify="space-between" w="100%" align="center" pt={2}>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.cartItemId, qty)}
                        size="sm"
                      />
                      <Text fontWeight="800" fontSize="md" color={accentColor}>
                        ₹{item.totalPrice.toFixed(2)}
                      </Text>
                    </Flex>
                  </VStack>
                </Flex>
              </Box>
            ))}

            <Flex justify="space-between" pt={2}>
              <Button
                as={RouterLink}
                to="/menu"
                variant="ghost"
                size="sm"
                color={accentColor}
              >
                + Add More Items
              </Button>
              <Button
                variant="ghost"
                size="sm"
                colorScheme="red"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </Flex>
          </VStack>
        </Box>

        {/* Right 1 Col: Order Summary & Coupon */}
        <VStack spacing={6} align="stretch">
          {/* Coupon Input Card */}
          <Box bg={cardBg} p={5} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
            <Text fontWeight="700" fontSize="sm" mb={3} color={headingColor}>
              Have a Promo Code?
            </Text>
            {appliedCoupon ? (
              <Flex
                p={3}
                borderRadius="xl"
                bg={useColorModeValue('green.50', 'rgba(72, 187, 120, 0.1)')}
                borderWidth="1px"
                borderColor="green.400"
                justify="space-between"
                align="center"
              >
                <HStack spacing={2} color="green.500">
                  <FiCheck />
                  <Box>
                    <Text fontWeight="700" fontSize="xs">
                      {appliedCoupon.code} Applied
                    </Text>
                    <Text fontSize="10px">
                      Saved ₹{discount.toFixed(2)} on this order
                    </Text>
                  </Box>
                </HStack>
                <IconButton
                  aria-label="Remove coupon"
                  icon={<FiX />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={removeCoupon}
                />
              </Flex>
            ) : (
              <HStack spacing={2}>
                <Input
                  placeholder="e.g. WELCOME10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  borderRadius="xl"
                  size="sm"
                  textTransform="uppercase"
                />
                <Button
                  bg={accentColor}
                  color={btnTextColor}
                  _hover={{ opacity: 0.9 }}
                  size="sm"
                  borderRadius="xl"
                  onClick={handleApplyCoupon}
                  isLoading={isApplyingCoupon}
                  px={4}
                >
                  Apply
                </Button>
              </HStack>
            )}
          </Box>

          {/* Pricing Breakdown Card */}
          <Box bg={cardBg} p={6} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} boxShadow="sm">
            <Text fontWeight="800" fontSize="md" mb={4} color={headingColor}>
              Order Summary
            </Text>
            <VStack spacing={3} align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color={textColor}>Subtotal</Text>
                <Text fontWeight="600">₹{subtotal.toFixed(2)}</Text>
              </Flex>

              {discount > 0 && (
                <Flex justify="space-between" color="green.500">
                  <Text>Voucher Discount</Text>
                  <Text fontWeight="600">-₹{discount.toFixed(2)}</Text>
                </Flex>
              )}

              <Flex justify="space-between">
                <Text color={textColor}>Estimated Taxes (7.5%)</Text>
                <Text fontWeight="600">₹{taxAmount.toFixed(2)}</Text>
              </Flex>

              <Divider borderColor={borderColor} my={1} />

              <Flex justify="space-between" align="baseline">
                <Text fontWeight="800" fontSize="md" color={headingColor}>
                  Total Amount
                </Text>
                <Text fontWeight="800" fontSize="2xl" color={accentColor}>
                  ₹{grandTotal.toFixed(2)}
                </Text>
              </Flex>
            </VStack>

            <Button
              mt={6}
              w="100%"
              size="lg"
              h="14"
              bgGradient={useColorModeValue(
                'linear(to-r, #A87916, #D4AF37)',
                'linear(to-r, #D4AF37, #F5D76E)'
              )}
              color={btnTextColor}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
                opacity: 0.95,
              }}
              _active={{ transform: 'translateY(0)' }}
              borderRadius="2xl"
              rightIcon={<FiArrowRight />}
              onClick={handleProceedToCheckout}
              fontWeight="700"
            >
              Proceed to Checkout
            </Button>

            <Text fontSize="11px" color={textColor} textAlign="center" mt={3}>
              Choose Dine-In Table or Quick Takeaway on next step
            </Text>
          </Box>
        </VStack>
      </SimpleGrid>
    </PageContainer>
  );
};
