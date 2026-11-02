import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Image,
  Badge,
  Divider,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Flex,
  useColorModeValue,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { FiClock, FiShoppingBag, FiZap, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { PageContainer } from '../components/layout/PageContainer';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { StarRating } from '../components/common/StarRating';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { getFallbackImage } from '../components/common/FoodCard';
import { menuService } from '../services/menu.service';
import { reviewService } from '../services/review.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { IMenuItem, IMenuVariant, IMenuAddOn, IReview } from '../types';

export const FoodDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, setPendingAction } = useAuth();

  const [item, setItem] = useState<IMenuItem | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Customization state
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<IMenuVariant | undefined>(undefined);
  const [selectedAddOns, setSelectedAddOns] = useState<IMenuAddOn[]>([]);
  const [notes, setNotes] = useState('');

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.2)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#716B65', '#A0A0A0');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);

    menuService
      .getById(id)
      .then((data) => {
        setItem(data);
        const defaultVar = data.variants?.find((v) => v.isDefault) || data.variants?.[0];
        setSelectedVariant(defaultVar);
      })
      .catch(() => {
        // Fallback for mock preview if backend ID is mock
        setHasError(true);
      })
      .finally(() => setIsLoading(false));

    reviewService
      .getAll()
      .then((allReviews) => {
        setReviews(allReviews.filter((r) => r.menuItemId === id || !r.menuItemId));
      })
      .catch(() => {});
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState type="detail" />
      </PageContainer>
    );
  }

  if (hasError || !item) {
    return (
      <PageContainer>
        <ErrorState
          title="Dish Not Found"
          message="We could not find the dish you were looking for. It may have been discontinued or moved."
          onRetry={() => navigate('/menu')}
        />
      </PageContainer>
    );
  }

  const variantAdjustment = selectedVariant?.priceAdjustment || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.basePrice + variantAdjustment + addOnsTotal;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleAddToCart = () => {
    addItem(item, quantity, selectedVariant, selectedAddOns, notes);
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'order_now',
        itemPayload: { item, quantity, selectedVariant, selectedAddOns, notes },
        redirectTo: '/checkout',
      });
      navigate('/login');
      return;
    }
    addItem(item, quantity, selectedVariant, selectedAddOns, notes);
    navigate('/checkout');
  };

  return (
    <PageContainer>
      {/* Back button */}
      <Button
        as={RouterLink}
        to="/menu"
        variant="ghost"
        leftIcon={<FiArrowLeft />}
        mb={6}
        color={textColor}
        _hover={{ color: accentColor }}
      >
        Back to Menu
      </Button>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="flex-start">
        {/* Left: Food Imagery */}
        <Box>
          <Box
            borderRadius="3xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
            bg="blackAlpha.200"
            position="relative"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.15)"
          >
            <Image
              src={getFallbackImage(item)}
              alt={item.name}
              w="100%"
              h={{ base: '320px', md: '450px' }}
              objectFit="cover"
            />
            <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)" />
            <Box position="absolute" bottom={6} left={6} right={6}>
              <HStack spacing={2} mb={2}>
                {item.isVegetarian ? (
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    Vegetarian
                  </Badge>
                ) : (
                  <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                    Non-Vegetarian
                  </Badge>
                )}
                {item.isVegan && <Badge colorScheme="teal" px={3} py={1} borderRadius="full">Vegan</Badge>}
                {item.isGlutenFree && <Badge colorScheme="purple" px={3} py={1} borderRadius="full">Gluten-Free</Badge>}
              </HStack>
              <Text fontSize="xs" color="gray.300">
                Prep Time: ~{item.preparationTimeMinutes || 10} minutes
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Right: Customization & Ordering Box */}
        <VStack align="stretch" spacing={6}>
          <Box>
            <Flex justify="space-between" align="baseline">
              <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '4xl' }} fontWeight="800" color={headingColor}>
                {item.name}
              </Heading>
              <Text fontSize="2xl" fontWeight="800" color={accentColor}>
                ${item.basePrice.toFixed(2)}
              </Text>
            </Flex>
            <Text fontSize="sm" color={textColor} mt={3} lineHeight="tall">
              {item.description || 'Artisan handcrafted recipe made with the freshest premium ingredients.'}
            </Text>
          </Box>

          <Divider borderColor={borderColor} />

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <Box>
              <Text fontWeight="700" fontSize="sm" mb={3} color={headingColor}>
                Choose Size / Portion
              </Text>
              <RadioGroup
                value={selectedVariant?.name || ''}
                onChange={(val) => {
                  const found = item.variants?.find((v) => v.name === val);
                  setSelectedVariant(found);
                }}
              >
                <VStack spacing={2} align="stretch">
                  {item.variants.map((v) => (
                    <Flex
                      key={v.name}
                      p={3.5}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={selectedVariant?.name === v.name ? accentColor : borderColor}
                      bg={selectedVariant?.name === v.name ? (useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)')) : cardBg}
                      justify="space-between"
                      align="center"
                      cursor="pointer"
                      onClick={() => setSelectedVariant(v)}
                    >
                      <Radio value={v.name} colorScheme="orange">
                        <Text fontWeight="600" fontSize="sm">
                          {v.name}
                        </Text>
                      </Radio>
                      <Text fontSize="sm" fontWeight="700" color={accentColor}>
                        {v.priceAdjustment > 0
                          ? `+₹${v.priceAdjustment.toFixed(2)}`
                          : v.priceAdjustment < 0
                          ? `-₹${Math.abs(v.priceAdjustment).toFixed(2)}`
                          : 'Included'}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </RadioGroup>
            </Box>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <Box>
              <Text fontWeight="700" fontSize="sm" mb={3} color={headingColor}>
                Customize with Add-ons
              </Text>
              <CheckboxGroup
                value={selectedAddOns.map((a) => a.name)}
                onChange={(vals) => {
                  const updated = item.addOns?.filter((a) => vals.includes(a.name)) || [];
                  setSelectedAddOns(updated);
                }}
              >
                <VStack spacing={2} align="stretch">
                  {item.addOns.map((a) => (
                    <Flex
                      key={a.name}
                      p={3}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg={cardBg}
                      justify="space-between"
                      align="center"
                    >
                      <Checkbox value={a.name} colorScheme="orange">
                        <Text fontSize="sm" fontWeight="500">
                          {a.name}
                        </Text>
                      </Checkbox>
                      <Text fontSize="sm" fontWeight="700" color={accentColor}>
                        +₹{a.price.toFixed(2)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </CheckboxGroup>
            </Box>
          )}

          {/* Special Cooking Notes */}
          <Box>
            <Text fontWeight="700" fontSize="sm" mb={2} color={headingColor}>
              Special Notes / Instructions
            </Text>
            <Textarea
              placeholder="e.g. Extra hot, oat milk sub, dressing on side..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              borderRadius="xl"
              rows={2}
            />
          </Box>

          {/* Summary and CTAs */}
          <Box p={5} bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={4}>
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={20} size="lg" />
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="10px" color={textColor} fontWeight="bold">TOTAL</Text>
                  <Text fontSize="2xl" fontWeight="800" color={accentColor}>
                    ₹{totalPrice.toFixed(2)}
                  </Text>
                </VStack>
              </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <Button
                variant="outline"
                borderColor={borderColor}
                color={headingColor}
                _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                size="lg"
                h="14"
                borderRadius="2xl"
                leftIcon={<FiShoppingBag />}
                onClick={handleAddToCart}
                isDisabled={!item.isAvailable}
              >
                Add to Cart
              </Button>
              <Button
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
                size="lg"
                h="14"
                borderRadius="2xl"
                leftIcon={<FiZap />}
                onClick={handleOrderNow}
                isDisabled={!item.isAvailable}
              >
                Order Now
              </Button>
            </SimpleGrid>
          </Box>
        </VStack>
      </SimpleGrid>

      {/* Tabs: Ingredients, Allergens & Reviews */}
      <Box mt={16}>
        <Tabs colorScheme="orange" variant="enclosed">
          <TabList borderColor={borderColor}>
            <Tab fontWeight="700">Ingredients & Allergens</Tab>
            <Tab fontWeight="700">Guest Reviews ({reviews.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={6} bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mt={2}>
              <VStack align="flex-start" spacing={4}>
                <Box>
                  <Text fontWeight="700" color={headingColor} mb={1}>
                    Ingredients
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {item.ingredients && item.ingredients.length > 0
                      ? item.ingredients.join(', ')
                      : 'Ethically sourced, pure natural organic ingredients.'}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="700" color={headingColor} mb={1}>
                    Allergen Notice
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {item.allergens && item.allergens.length > 0
                      ? item.allergens.join(', ')
                      : 'No major declared allergens.'}
                  </Text>
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel p={6} bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor} mt={2}>
              {reviews.length === 0 ? (
                <Text fontSize="sm" color={textColor}>
                  No reviews yet for this dish. Be the first to share your thoughts!
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {reviews.map((rev) => (
                    <Box key={rev._id} pb={3} borderBottomWidth="1px" borderColor={borderColor}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="700" fontSize="sm" color={headingColor}>
                          {rev.customerName}
                        </Text>
                        <StarRating rating={rev.rating} size={3} />
                      </HStack>
                      <Text fontSize="xs" color={textColor}>
                        {rev.comment}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </PageContainer>
  );
};
