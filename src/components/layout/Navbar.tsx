import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  Text,
  Avatar,
  Container,
  IconButton,
  Badge,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiShoppingBag,
  FiGrid,
  FiBriefcase,
  FiHome,
  FiCoffee,
  FiLayers,
  FiInfo,
  FiPhone,
  FiChevronRight,
  FiStar,
} from 'react-icons/fi';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { BRAND_CONFIG } from '../../config/brand.config';
import { MagneticButton } from '../common/MagneticButton';
import { CartDrawer } from '../common/CartDrawer';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCartOpen,
    onOpen: onOpenCart,
    onClose: onCloseCart,
  } = useDisclosure();

  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  // Palette tokens declared at top level
  const navBg = scrolled
    ? useColorModeValue('rgba(248, 245, 239, 0.96)', 'rgba(11, 11, 11, 0.94)')
    : isHome
    ? 'transparent'
    : useColorModeValue('rgba(248, 245, 239, 0.98)', 'rgba(11, 11, 11, 0.98)');

  const borderColor = scrolled
    ? useColorModeValue('rgba(164, 122, 60, 0.22)', 'rgba(212, 175, 114, 0.2)')
    : 'transparent';

  const goldAccent = useColorModeValue('#A47A3C', '#D4AF72');
  const textColor = useColorModeValue('#202020', '#F8F5EF');
  const mutedColor = useColorModeValue('#666666', '#9E9EA8');
  const drawerBg = useColorModeValue('#F8F5EF', '#0B0B0B');
  const drawerItemBg = useColorModeValue('rgba(164, 122, 60, 0.04)', 'rgba(212, 175, 114, 0.05)');
  const drawerActiveBg = useColorModeValue('rgba(164, 122, 60, 0.12)', 'rgba(212, 175, 114, 0.15)');
  const drawerBorder = useColorModeValue('rgba(164, 122, 60, 0.15)', 'rgba(212, 175, 114, 0.15)');
  const hoverCartBg = useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)');
  const hoverLoginBg = useColorModeValue('rgba(164, 122, 60, 0.08)', 'rgba(212, 175, 114, 0.1)');
  const hoverGoldBg = useColorModeValue('#8E672E', '#E5CC78');
  const menuListBg = useColorModeValue('#FFFFFF', '#171717');
  const cardSurfaceBg = useColorModeValue('#FFFFFF', '#161618');

  // Center links for desktop
  const centerLinks = [
    { label: 'Home', target: 'top', path: '/' },
    { label: 'Our Story', target: 'about', path: '/about' },
    { label: 'Menu', target: 'signature-menu', path: '/menu' },
    { label: 'Categories', target: 'categories', path: '/categories' },
    { label: 'Experience', target: 'experience', path: '/#experience' },
  ];

  const handleNavClick = (target: string) => {
    onClose();
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      setTimeout(() => {
        const el = document.getElementById(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReservationClick = () => {
    onClose();
    if (location.pathname === '/') {
      handleNavClick('reservation');
    } else {
      navigate('/reservations');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isStaffOrAdmin = [
    'Owner',
    'Admin',
    'Manager',
    'SUPER_ADMIN',
    'MANAGER',
    'Cashier',
    'Kitchen Staff',
    'Service Staff',
    'CASHIER',
    'CHEF',
    'WAITER',
  ].includes(user?.role || '');

  // Mobile Drawer Links
  const mobileNavLinks = [
    { label: 'Home', path: '/', icon: FiHome, exact: true },
    { label: 'Menu & Roastery', path: '/menu', icon: FiCoffee },
    { label: 'Categories', path: '/categories', icon: FiLayers },
    { label: 'Table Reservations', path: '/reservations', icon: FiCalendar },
    { label: 'My Orders', path: '/orders', icon: FiShoppingBag },
    { label: 'About Our Craft', path: '/about', icon: FiInfo },
    { label: 'Guest Reviews', path: '/reviews', icon: FiStar },
    { label: 'Contact Concierge', path: '/contact', icon: FiPhone },
  ];

  return (
    <>
      <Box
        as="header"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="1000"
        bg={navBg}
        backdropFilter={scrolled ? 'blur(16px)' : 'none'}
        borderBottom="1px solid"
        borderColor={borderColor}
        transition="all 0.35s ease"
      >
        <Container maxW="7xl" px={{ base: 3.5, sm: 5, md: 8, lg: 10 }}>
          <Flex h={{ base: '64px', sm: '72px', md: '84px' }} alignItems="center" justifyContent="space-between">
            {/* Left: VYNTRA CAFE Brand Logo */}
            <HStack
              as={RouterLink}
              to="/"
              spacing={{ base: 2, sm: 2.5, md: 3 }}
              _hover={{ textDecoration: 'none' }}
              transition="transform 0.2s ease"
              flexShrink={0}
            >
              <Flex
                w={{ base: '32px', sm: '38px' }}
                h={{ base: '32px', sm: '38px' }}
                borderRadius="full"
                border="1.5px solid"
                borderColor={goldAccent}
                color={goldAccent}
                alignItems="center"
                justifyContent="center"
                fontSize={{ base: 'sm', sm: 'md' }}
                fontWeight="bold"
                boxShadow={scrolled ? `0 0 14px ${goldAccent}40` : 'none'}
              >
                {BRAND_CONFIG.logoIcon}
              </Flex>
              <VStack align="start" spacing={0}>
                <Text
                  fontFamily="'Playfair Display', serif"
                  fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                  fontWeight="800"
                  letterSpacing={{ base: '0.04em', sm: '0.08em' }}
                  color={textColor}
                  lineHeight="1.1"
                >
                  {BRAND_CONFIG.name.toUpperCase()}
                </Text>
                <Text
                  fontSize={{ base: '6.5px', sm: '8px' }}
                  letterSpacing={{ base: '0.15em', sm: '0.25em' }}
                  textTransform="uppercase"
                  color={goldAccent}
                  fontWeight="700"
                  display={{ base: 'none', xs: 'block', sm: 'block' }}
                >
                  HAUTE GASTRONOMIE
                </Text>
              </VStack>
            </HStack>

            {/* Center: Desktop Navigation Links */}
            <HStack spacing={{ base: 4, lg: 7, xl: 9 }} display={{ base: 'none', md: 'flex' }}>
              {centerLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Box
                    key={link.label}
                    as="button"
                    onClick={() => handleNavClick(link.target)}
                    fontSize="xs"
                    fontWeight={isActive ? '700' : '600'}
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color={isActive ? goldAccent : textColor}
                    position="relative"
                    py={2}
                    _after={{
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: isActive ? '100%' : '0%',
                      height: '1.5px',
                      backgroundColor: goldAccent,
                      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    _hover={{
                      color: goldAccent,
                      _after: {
                        width: '100%',
                      },
                    }}
                    transition="color 0.2s ease"
                  >
                    {link.label}
                  </Box>
                );
              })}
            </HStack>

            {/* Right: Theme Toggle, Reserve Table, Cart Icon, Login/Profile & Mobile Hamburger */}
            <HStack spacing={{ base: 1.5, sm: 2.5, md: 3.5 }} flexShrink={0}>
              {/* Dark / Light Toggle */}
              <ThemeToggle />

              {/* Reserve Table Button (Hidden on Mobile phones, shown on Tablet/Desktop) */}
              <Box display={{ base: 'none', lg: 'block' }}>
                <MagneticButton strength={15}>
                  <Button
                    onClick={handleReservationClick}
                    size="sm"
                    h="40px"
                    px={4.5}
                    bg={goldAccent}
                    color="#0B0B0B"
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="0.08em"
                    borderRadius="full"
                    leftIcon={<FiCalendar />}
                    _hover={{
                      bg: hoverGoldBg,
                      color: '#0B0B0B',
                      transform: 'scale(1.03)',
                      boxShadow: `0 8px 20px ${goldAccent}45`,
                    }}
                    transition="all 0.25s ease"
                  >
                    RESERVE TABLE
                  </Button>
                </MagneticButton>
              </Box>

              {/* Cart Icon Button with Live Counter Badge */}
              <Box position="relative">
                <IconButton
                  aria-label="View Cart"
                  icon={<FiShoppingBag size={17} />}
                  onClick={onOpenCart}
                  variant="outline"
                  size="sm"
                  h={{ base: '36px', sm: '38px', md: '40px' }}
                  w={{ base: '36px', sm: '38px', md: '40px' }}
                  borderRadius="full"
                  color={textColor}
                  borderColor={borderColor}
                  _hover={{
                    borderColor: goldAccent,
                    color: goldAccent,
                    bg: hoverCartBg,
                  }}
                />
                {totalCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={goldAccent}
                    color="#0B0B0B"
                    borderRadius="full"
                    fontSize="10px"
                    fontWeight="800"
                    minW="18px"
                    h="18px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 2px 6px rgba(0,0,0,0.4)"
                  >
                    {totalCount}
                  </Badge>
                )}
              </Box>

              {/* Desktop Login / Profile Menu */}
              {isAuthenticated ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rounded="full"
                    cursor="pointer"
                    minW={0}
                    p={0}
                    _hover={{ bg: 'transparent' }}
                  >
                    <Avatar
                      size="sm"
                      name={user?.name}
                      src={user?.avatar}
                      bg="rgba(212, 175, 114, 0.2)"
                      color={goldAccent}
                      border="1.5px solid"
                      borderColor={goldAccent}
                    />
                  </MenuButton>
                  <MenuList
                    bg={menuListBg}
                    borderColor={borderColor}
                    boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
                    borderRadius="xl"
                    p={2}
                    zIndex={1200}
                  >
                    <Box px={3} py={2}>
                      <Text fontWeight="700" fontSize="sm" color={textColor}>
                        {user?.name}
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        {user?.email}
                      </Text>
                    </Box>
                    <MenuDivider borderColor={borderColor} />
                    <MenuItem
                      as={RouterLink}
                      to="/profile"
                      icon={<FiUser />}
                      borderRadius="lg"
                      fontSize="xs"
                      _hover={{ bg: 'rgba(212, 175, 114, 0.1)', color: goldAccent }}
                    >
                      My Guest Profile
                    </MenuItem>
                    <MenuItem
                      as={RouterLink}
                      to="/orders"
                      icon={<FiShoppingBag />}
                      borderRadius="lg"
                      fontSize="xs"
                      _hover={{ bg: 'rgba(212, 175, 114, 0.1)', color: goldAccent }}
                    >
                      My Orders
                    </MenuItem>
                    <MenuItem
                      as={RouterLink}
                      to="/reservation-history"
                      icon={<FiCalendar />}
                      borderRadius="lg"
                      fontSize="xs"
                      _hover={{ bg: 'rgba(212, 175, 114, 0.1)', color: goldAccent }}
                    >
                      My Reservations
                    </MenuItem>
                    {isStaffOrAdmin && (
                      <>
                        <MenuItem
                          as={RouterLink}
                          to="/waiter/dashboard"
                          icon={<FiBriefcase />}
                          borderRadius="lg"
                          fontSize="xs"
                          fontWeight="700"
                          color={goldAccent}
                          _hover={{ bg: 'rgba(212, 175, 114, 0.15)' }}
                        >
                          Staff Workstations
                        </MenuItem>
                        <MenuItem
                          as={RouterLink}
                          to="/admin/dashboard"
                          icon={<FiGrid />}
                          borderRadius="lg"
                          fontSize="xs"
                          fontWeight="700"
                          color={goldAccent}
                          _hover={{ bg: 'rgba(212, 175, 114, 0.15)' }}
                        >
                          Operations Portal
                        </MenuItem>
                      </>
                    )}
                    <MenuItem
                      icon={<FiLogOut />}
                      onClick={handleLogout}
                      color="red.400"
                      borderRadius="lg"
                      fontSize="xs"
                      _hover={{ bg: 'rgba(255, 0, 0, 0.1)' }}
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="outline"
                  display={{ base: 'none', sm: 'inline-flex' }}
                  size="sm"
                  h={{ base: '36px', sm: '38px', md: '40px' }}
                  px={{ base: 3, sm: 4 }}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  _hover={{
                    borderColor: goldAccent,
                    color: goldAccent,
                    bg: hoverLoginBg,
                  }}
                >
                  LOGIN
                </Button>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="ghost"
                aria-label="Open Navigation Menu"
                color={textColor}
                size="sm"
                h="38px"
                w="38px"
                borderRadius="full"
                border="1px solid"
                borderColor={borderColor}
                icon={<FiMenu size={20} />}
                _hover={{ bg: 'transparent', color: goldAccent, borderColor: goldAccent }}
              />
            </HStack>
          </Flex>
        </Container>

        {/* Mobile Animated Luxury Drawer Menu */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
          <DrawerOverlay bg="rgba(11, 11, 11, 0.85)" backdropFilter="blur(16px)" />
          <DrawerContent
            bg={drawerBg}
            borderLeft="1px solid"
            borderColor={drawerBorder}
            color={textColor}
            maxW={{ base: '88vw', sm: '380px' }}
            boxShadow="2xl"
          >
            <DrawerCloseButton color={textColor} top={5} right={5} size="md" />

            {/* Drawer Header with Logo & Brand Tagline */}
            <DrawerHeader pt={6} pb={4} borderBottom="1px solid" borderColor={drawerBorder}>
              <HStack spacing={3}>
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  border="1.5px solid"
                  borderColor={goldAccent}
                  color={goldAccent}
                  align="center"
                  justify="center"
                  fontWeight="bold"
                >
                  {BRAND_CONFIG.logoIcon}
                </Flex>
                <VStack align="start" spacing={0}>
                  <Text fontFamily="'Playfair Display', serif" fontSize="md" fontWeight="800">
                    {BRAND_CONFIG.name.toUpperCase()}
                  </Text>
                  <Text fontSize="8px" letterSpacing="0.2em" color={goldAccent} fontWeight="700">
                    HAUTE GASTRONOMIE
                  </Text>
                </VStack>
              </HStack>
            </DrawerHeader>

            {/* Drawer Scrollable Body */}
            <DrawerBody py={5} px={4}>
              <VStack spacing={4} align="stretch">
                {/* User Status Card */}
                {isAuthenticated ? (
                  <Box
                    p={3.5}
                    borderRadius="xl"
                    bg={cardSurfaceBg}
                    border="1px solid"
                    borderColor={drawerBorder}
                    boxShadow="sm"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={user?.name}
                        src={user?.avatar}
                        bg="rgba(212, 175, 114, 0.2)"
                        color={goldAccent}
                        border="1.5px solid"
                        borderColor={goldAccent}
                      />
                      <Box flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="700" color={textColor} isTruncated>
                          {user?.name}
                        </Text>
                        <Text fontSize="xs" color={mutedColor} isTruncated>
                          {user?.email}
                        </Text>
                        <Badge
                          mt={1}
                          colorScheme="yellow"
                          variant="subtle"
                          fontSize="9px"
                          borderRadius="sm"
                          px={1.5}
                        >
                          {user?.role || 'GUEST'}
                        </Badge>
                      </Box>
                    </HStack>
                  </Box>
                ) : (
                  <Box
                    p={3.5}
                    borderRadius="xl"
                    bg={cardSurfaceBg}
                    border="1px solid"
                    borderColor={drawerBorder}
                    boxShadow="sm"
                  >
                    <Text fontSize="xs" fontWeight="700" color={textColor}>
                      Welcome to Vyntra Cafe
                    </Text>
                    <Text fontSize="11px" color={mutedColor} mt={0.5} mb={3}>
                      Sign in for personalized orders, table bookings & loyalty rewards.
                    </Text>
                    <SimpleGrid columns={2} spacing={2}>
                      <Button
                        as={RouterLink}
                        to="/login"
                        onClick={onClose}
                        size="xs"
                        h="34px"
                        bg={goldAccent}
                        color="#0B0B0B"
                        fontWeight="700"
                        borderRadius="md"
                        _hover={{ opacity: 0.9 }}
                      >
                        Sign In
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/register"
                        onClick={onClose}
                        size="xs"
                        h="34px"
                        variant="outline"
                        borderColor={goldAccent}
                        color={goldAccent}
                        fontWeight="700"
                        borderRadius="md"
                        _hover={{ bg: 'rgba(212, 175, 114, 0.1)' }}
                      >
                        Register
                      </Button>
                    </SimpleGrid>
                  </Box>
                )}

                <Divider borderColor={drawerBorder} />

                {/* Primary Nav Links */}
                <VStack spacing={1.5} align="stretch">
                  {mobileNavLinks.map((link) => {
                    const isActive = link.exact
                      ? location.pathname === link.path
                      : location.pathname.startsWith(link.path);

                    return (
                      <Flex
                        key={link.path}
                        as={RouterLink}
                        to={link.path}
                        onClick={onClose}
                        align="center"
                        justify="space-between"
                        px={3.5}
                        py={2.5}
                        borderRadius="lg"
                        bg={isActive ? drawerActiveBg : drawerItemBg}
                        color={isActive ? goldAccent : textColor}
                        fontWeight={isActive ? '700' : '500'}
                        fontSize="sm"
                        borderLeft={isActive ? `3px solid ${goldAccent}` : '3px solid transparent'}
                        transition="all 0.2s ease"
                        _hover={{
                          bg: drawerActiveBg,
                          color: goldAccent,
                          transform: 'translateX(3px)',
                        }}
                      >
                        <HStack spacing={3}>
                          <Box color={isActive ? goldAccent : mutedColor}>
                            <link.icon size={16} />
                          </Box>
                          <Text>{link.label}</Text>
                        </HStack>
                        <FiChevronRight size={14} color={mutedColor} />
                      </Flex>
                    );
                  })}
                </VStack>

                {/* Staff / Admin Section (if authenticated with staff/management role) */}
                {isStaffOrAdmin && (
                  <>
                    <Divider borderColor={drawerBorder} />
                    <Box>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        color={goldAccent}
                        mb={2}
                        px={2}
                      >
                        STAFF & MANAGEMENT
                      </Text>
                      <VStack spacing={1.5} align="stretch">
                        <Flex
                          as={RouterLink}
                          to="/waiter/dashboard"
                          onClick={onClose}
                          align="center"
                          justify="space-between"
                          px={3.5}
                          py={2.5}
                          borderRadius="lg"
                          bg={drawerItemBg}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="600"
                        >
                          <HStack spacing={3}>
                            <FiBriefcase size={16} color={goldAccent} />
                            <Text>Staff Workstations</Text>
                          </HStack>
                          <FiChevronRight size={14} color={mutedColor} />
                        </Flex>
                        <Flex
                          as={RouterLink}
                          to="/admin/dashboard"
                          onClick={onClose}
                          align="center"
                          justify="space-between"
                          px={3.5}
                          py={2.5}
                          borderRadius="lg"
                          bg={drawerItemBg}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="600"
                        >
                          <HStack spacing={3}>
                            <FiGrid size={16} color={goldAccent} />
                            <Text>Operations Portal</Text>
                          </HStack>
                          <FiChevronRight size={14} color={mutedColor} />
                        </Flex>
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </DrawerBody>

            {/* Drawer Bottom Actions */}
            <DrawerFooter
              borderTop="1px solid"
              borderColor={drawerBorder}
              p={4}
              display="flex"
              flexDirection="column"
              gap={2.5}
            >
              <Button
                onClick={handleReservationClick}
                w="100%"
                h="44px"
                bg={goldAccent}
                color="#0B0B0B"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.08em"
                borderRadius="full"
                leftIcon={<FiCalendar />}
                _hover={{ bg: hoverGoldBg }}
              >
                RESERVE A TABLE
              </Button>

              {isAuthenticated && (
                <Button
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  w="100%"
                  h="38px"
                  variant="ghost"
                  colorScheme="red"
                  fontSize="xs"
                  fontWeight="600"
                  leftIcon={<FiLogOut />}
                >
                  Sign Out of Account
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Box>

      {/* Cart Drawer Slide-over */}
      <CartDrawer isOpen={isCartOpen} onClose={onCloseCart} />
    </>
  );
};
