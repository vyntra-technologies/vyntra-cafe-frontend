import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Box,
  Divider,
  Textarea,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { IMenuItem, IMenuVariant, IMenuAddOn } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QuantitySelector } from './QuantitySelector';
import { getFallbackImage } from './FoodCard';
import { FiClock, FiShoppingBag, FiZap } from 'react-icons/fi';

interface FoodModalProps {
  item: IMenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({ item, isOpen, onClose }) => {
  const { addItem } = useCart();
  const { isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<IMenuVariant | undefined>(undefined);
  const [selectedAddOns, setSelectedAddOns] = useState<IMenuAddOn[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when modal opens or item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setNotes('');
      // Default variant if available
      const defaultVar = item.variants?.find((v) => v.isDefault) || item.variants?.[0];
      setSelectedVariant(defaultVar);
      setSelectedAddOns([]);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const cardBg = useColorModeValue('#FFFFFF', '#171717');
  const borderColor = useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)');
  const textColor = useColorModeValue('#666666', '#9E9EA8');
  const headingColor = useColorModeValue('#202020', '#F8F5EF');
  const accentColor = useColorModeValue('#A47A3C', '#D4AF72');
  const btnTextColor = useColorModeValue('#FFFFFF', '#0B0B0B');

  const variantAdjustment = selectedVariant?.priceAdjustment || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.basePrice + variantAdjustment + addOnsTotal;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleVariantChange = (varName: string) => {
    const found = item.variants?.find((v) => v.name === varName);
    setSelectedVariant(found);
  };

  const handleAddOnsChange = (checkedNames: (string | number)[]) => {
    const updated = item.addOns?.filter((a) => checkedNames.includes(a.name)) || [];
    setSelectedAddOns(updated);
  };

  const handleAddToCart = () => {
    addItem(item, quantity, selectedVariant, selectedAddOns, notes);
    onClose();
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'order_now',
        itemPayload: { item, quantity, selectedVariant, selectedAddOns, notes },
        redirectTo: '/checkout',
      });
      onClose();
      navigate('/login');
      return;
    }

    addItem(item, quantity, selectedVariant, selectedAddOns, notes);
    onClose();
    navigate('/checkout');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }} isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent bg={cardBg} borderRadius={{ base: 0, md: '2xl' }} overflow="hidden" borderColor={borderColor} borderWidth="1px">
        <ModalCloseButton zIndex={10} bg="blackAlpha.600" color="white" borderRadius="full" />

        {/* Hero image */}
        <Box h={{ base: '220px', md: '260px' }} position="relative" overflow="hidden" bg="blackAlpha.200">
          <Image
            src={getFallbackImage(item)}
            alt={item.name}
            w="100%"
            h="100%"
            objectFit="cover"
          />
          <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.800, transparent)" />
          <Box position="absolute" bottom={4} left={4} right={4}>
            <HStack spacing={2} mb={2}>
              {item.isVegetarian ? (
                <Badge colorScheme="green">Vegetarian</Badge>
              ) : (
                <Badge colorScheme="red">Non-Vegetarian</Badge>
              )}
              {item.isVegan && <Badge colorScheme="teal">Vegan</Badge>}
              {item.isGlutenFree && <Badge colorScheme="purple">Gluten-Free</Badge>}
              {item.isBestseller && <Badge colorScheme="yellow">Bestseller</Badge>}
            </HStack>
            <Text fontSize="2xl" fontWeight="800" color="white" lineHeight="short">
              {item.name}
            </Text>
          </Box>
        </Box>

        <ModalBody p={{ base: 4, md: 6 }}>
          <VStack spacing={5} align="stretch">
            {/* Description & Prep Time */}
            <Box>
              <Text fontSize="sm" color={textColor} lineHeight="tall">
                {item.description || 'Specially crafted artisan culinary item.'}
              </Text>
              <HStack mt={2} color={textColor} fontSize="xs" spacing={4}>
                <HStack spacing={1}>
                  <FiClock />
                  <Text>Prep time: ~{item.preparationTimeMinutes || 10} minutes</Text>
                </HStack>
              </HStack>
            </Box>

            {/* Ingredients & Allergens */}
            {((item.ingredients && item.ingredients.length > 0) || (item.allergens && item.allergens.length > 0)) && (
              <Box p={3} bg={useColorModeValue('#F7EFE6', '#121417')} borderRadius="xl" fontSize="xs">
                {item.ingredients && item.ingredients.length > 0 && (
                  <Text color={textColor}>
                    <Text as="span" fontWeight="700" color={headingColor}>Ingredients: </Text>
                    {item.ingredients.join(', ')}
                  </Text>
                )}
                {item.allergens && item.allergens.length > 0 && (
                  <Text color="red.400" mt={1}>
                    <Text as="span" fontWeight="700">Allergens: </Text>
                    {item.allergens.join(', ')}
                  </Text>
                )}
              </Box>
            )}

            <Divider borderColor={borderColor} />

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <Box>
                <Text fontWeight="700" fontSize="sm" mb={3} color={headingColor}>
                  Choose Portion / Size
                </Text>
                <RadioGroup
                  value={selectedVariant?.name || ''}
                  onChange={handleVariantChange}
                >
                  <VStack spacing={2} align="stretch">
                    {item.variants.map((v) => (
                      <Flex
                        key={v.name}
                        p={3}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={selectedVariant?.name === v.name ? accentColor : borderColor}
                        bg={selectedVariant?.name === v.name ? (useColorModeValue('orange.50', 'whiteAlpha.50')) : 'transparent'}
                        justify="space-between"
                        align="center"
                        cursor="pointer"
                        onClick={() => handleVariantChange(v.name)}
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
                  Enhance Your Dish (Optional Add-ons)
                </Text>
                <CheckboxGroup
                  value={selectedAddOns.map((a) => a.name)}
                  onChange={handleAddOnsChange}
                >
                  <VStack spacing={2} align="stretch">
                    {item.addOns.map((a) => (
                      <Flex
                        key={a.name}
                        p={3}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
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

            {/* Special Instructions */}
            <Box>
              <Text fontWeight="700" fontSize="sm" mb={2} color={headingColor}>
                Special Preparation Notes
              </Text>
              <Textarea
                placeholder="e.g. Less ice, extra hot, oat milk on side, dressing separate..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fontSize="sm"
                borderRadius="xl"
                rows={2}
                maxLength={200}
              />
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor={borderColor}
          bg={useColorModeValue('#FAF5EE', '#121417')}
          p={{ base: 4, md: 5 }}
        >
          <Flex w="100%" justify="space-between" align="center" gap={4} wrap="wrap">
            <HStack spacing={3}>
              <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={20} />
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="10px" color={textColor} fontWeight="bold">TOTAL</Text>
                <Text fontSize="xl" fontWeight="800" color={accentColor}>
                  ₹{totalPrice.toFixed(2)}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                variant="outline"
                borderRadius="xl"
                leftIcon={<FiShoppingBag />}
                onClick={handleAddToCart}
                isDisabled={!item.isAvailable}
              >
                Add to Cart
              </Button>
              <Button
                bg={accentColor}
                color={btnTextColor}
                _hover={{ opacity: 0.9 }}
                borderRadius="xl"
                leftIcon={<FiZap />}
                onClick={handleOrderNow}
                isDisabled={!item.isAvailable}
              >
                Order Now
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

