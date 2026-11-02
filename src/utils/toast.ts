import { createStandaloneToast } from '@chakra-ui/react';
import { theme } from '../theme';

const { toast: chakraToast } = createStandaloneToast({ theme });

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
  isClosable?: boolean;
}

export const toast = (options: any) => {
  if (typeof options === 'string') {
    return chakraToast({
      title: options,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  }
  return chakraToast(options);
};

toast.success = (message: string, options?: ToastOptions) => {
  return chakraToast({
    title: message,
    status: 'success',
    duration: options?.duration || 3000,
    isClosable: options?.isClosable ?? true,
    position: options?.position || 'top-right',
  });
};

toast.error = (message: string, options?: ToastOptions) => {
  return chakraToast({
    title: message,
    status: 'error',
    duration: options?.duration || 4000,
    isClosable: options?.isClosable ?? true,
    position: options?.position || 'top-right',
  });
};

toast.info = (message: string, options?: ToastOptions) => {
  return chakraToast({
    title: message,
    status: 'info',
    duration: options?.duration || 3000,
    isClosable: options?.isClosable ?? true,
    position: options?.position || 'top-right',
  });
};

toast.warning = (message: string, options?: ToastOptions) => {
  return chakraToast({
    title: message,
    status: 'warning',
    duration: options?.duration || 3500,
    isClosable: options?.isClosable ?? true,
    position: options?.position || 'top-right',
  });
};

export default toast;

