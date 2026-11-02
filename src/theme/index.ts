import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Playfair Display', 'Cormorant Garamond', Georgia, serif`,
    body: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    serif: `'Playfair Display', Georgia, serif`,
    garamond: `'Cormorant Garamond', Georgia, serif`,
    sans: `'Plus Jakarta Sans', sans-serif`,
  },
  colors: {
    gold: {
      50: '#FAF6ED',
      100: '#F4ECD8',
      200: '#EADBB3',
      300: '#E0C98D',
      400: '#DAB87F',
      500: '#D4AF72', // Dark Accent
      600: '#A47A3C', // Light Accent
      700: '#86612A',
      800: '#64471B',
      900: '#422D0E',
    },
    brand: {
      50: '#FAF6ED',
      100: '#F4ECD8',
      200: '#EADBB3',
      300: '#E0C98D',
      400: '#DAB87F',
      500: '#D4AF72',
      600: '#A47A3C',
      700: '#86612A',
      800: '#64471B',
      900: '#422D0E',
    },
    dark: {
      bg: '#0B0B0B',
      secondary: '#171717',
      card: '#18181C',
      accent: '#D4AF72',
      text: '#F8F5EF',
      mutedText: '#9E9EA8',
      border: 'rgba(212, 175, 114, 0.2)',
    },
    light: {
      bg: '#F8F5EF',
      secondary: '#FFFFFF',
      card: '#FFFFFF',
      accent: '#A47A3C',
      text: '#202020',
      mutedText: '#666666',
      border: 'rgba(164, 122, 60, 0.22)',
    },
  },
  semanticTokens: {
    colors: {
      'page-bg': {
        default: '#F8F5EF',
        _dark: '#0B0B0B',
      },
      'surface-bg': {
        default: '#FFFFFF',
        _dark: '#171717',
      },
      'card-bg': {
        default: '#FFFFFF',
        _dark: '#18181C',
      },
      'accent-gold': {
        default: '#A47A3C',
        _dark: '#D4AF72',
      },
      'text-primary': {
        default: '#202020',
        _dark: '#F8F5EF',
      },
      'text-secondary': {
        default: '#666666',
        _dark: '#9E9EA8',
      },
      'border-subtle': {
        default: 'rgba(164, 122, 60, 0.22)',
        _dark: 'rgba(212, 175, 114, 0.2)',
      },
    },
  },
  styles: {
    global: (props: any) => ({
      'html, body': {
        bg: props.colorMode === 'dark' ? '#0B0B0B' : '#F8F5EF',
        color: props.colorMode === 'dark' ? '#F8F5EF' : '#202020',
        scrollBehavior: 'smooth',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'full',
        letterSpacing: '0.04em',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
});
