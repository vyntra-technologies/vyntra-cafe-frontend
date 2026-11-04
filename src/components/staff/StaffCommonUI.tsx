import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiX,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiRefreshCw,
} from 'react-icons/fi';
import { STAFF_COLORS } from './StaffTheme';

// 1. StatCard
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  colorScheme?: 'gold' | 'green' | 'yellow' | 'red' | 'blue';
  onClick?: () => void;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  badge,
  colorScheme = 'gold',
  onClick,
  isLoading = false,
}) => {
  const getIconColors = () => {
    switch (colorScheme) {
      case 'green':
        return { bg: STAFF_COLORS.successSubtle, color: STAFF_COLORS.success, border: 'rgba(34, 197, 94, 0.3)' };
      case 'yellow':
        return { bg: STAFF_COLORS.warningSubtle, color: STAFF_COLORS.warning, border: 'rgba(245, 158, 11, 0.3)' };
      case 'red':
        return { bg: STAFF_COLORS.dangerSubtle, color: STAFF_COLORS.danger, border: 'rgba(239, 68, 68, 0.3)' };
      case 'blue':
        return { bg: STAFF_COLORS.infoSubtle, color: STAFF_COLORS.info, border: 'rgba(59, 130, 246, 0.3)' };
      case 'gold':
      default:
        return { bg: STAFF_COLORS.goldSubtle, color: STAFF_COLORS.primaryGold, border: STAFF_COLORS.borderGold };
    }
  };

  const iconColors = getIconColors();

  return (
    <Box
      bg={STAFF_COLORS.card}
      borderWidth="1px"
      borderColor={STAFF_COLORS.border}
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
      transition="all 0.2s ease"
      cursor={onClick ? 'pointer' : 'default'}
      _hover={{
        borderColor: STAFF_COLORS.primaryGold,
        transform: onClick ? 'translateY(-2px)' : 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
      onClick={onClick}
    >
      <Flex justify="space-between" align="flex-start">
        <VStack align="flex-start" spacing={1} flex="1">
          <Text fontSize="xs" fontWeight="600" color={STAFF_COLORS.secondaryText} textTransform="uppercase" letterSpacing="wider">
            {title}
          </Text>

          {isLoading ? (
            <Skeleton height="32px" width="80px" borderRadius="md" my={1} />
          ) : (
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={STAFF_COLORS.text} lineHeight="1.1">
              {value}
            </Text>
          )}

          {subtitle && (
            <Text fontSize="xs" color={STAFF_COLORS.mutedText} pt={0.5}>
              {subtitle}
            </Text>
          )}
        </VStack>

        <VStack align="flex-end" spacing={2}>
          <Flex
            w={{ base: '10', md: '12' }}
            h={{ base: '10', md: '12' }}
            borderRadius="xl"
            bg={iconColors.bg}
            color={iconColors.color}
            borderWidth="1px"
            borderColor={iconColors.border}
            align="center"
            justify="center"
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            <Icon as={IconComponent} />
          </Flex>

          {badge && (
            <Badge
              fontSize="10px"
              px={2}
              py={0.5}
              borderRadius="full"
              bg={iconColors.bg}
              color={iconColors.color}
              borderWidth="1px"
              borderColor={iconColors.border}
            >
              {badge}
            </Badge>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

// 2. SearchBar
export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  maxW?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  maxW = '340px',
}) => {
  return (
    <InputGroup maxW={maxW} size="sm">
      <InputLeftElement pointerEvents="none">
        <Icon as={FiSearch} color={STAFF_COLORS.mutedText} />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg={STAFF_COLORS.innerCard}
        borderWidth="1px"
        borderColor={STAFF_COLORS.border}
        borderRadius="xl"
        color={STAFF_COLORS.text}
        _placeholder={{ color: STAFF_COLORS.mutedText }}
        _focus={{
          borderColor: STAFF_COLORS.primaryGold,
          boxShadow: `0 0 0 1px ${STAFF_COLORS.primaryGold}`,
        }}
        _hover={{ borderColor: STAFF_COLORS.borderGold }}
      />
      {value && (
        <InputRightElement>
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Clear search"
            icon={<FiX />}
            color={STAFF_COLORS.mutedText}
            _hover={{ color: STAFF_COLORS.text }}
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

// 3. FilterDropdown
export interface FilterDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  maxW?: any;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  maxW = '200px',
}) => {
  return (
    <Select
      size="sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      bg={STAFF_COLORS.innerCard}
      borderWidth="1px"
      borderColor={STAFF_COLORS.border}
      borderRadius="xl"
      color={STAFF_COLORS.text}
      maxW={maxW}
      _focus={{
        borderColor: STAFF_COLORS.primaryGold,
        boxShadow: `0 0 0 1px ${STAFF_COLORS.primaryGold}`,
      }}
      _hover={{ borderColor: STAFF_COLORS.borderGold }}
    >
      {placeholder && <option value="" style={{ background: STAFF_COLORS.sidebar }}>{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: STAFF_COLORS.sidebar, color: STAFF_COLORS.text }}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
};

// 4. DataTable
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records located',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Box p={6} bg={STAFF_COLORS.card} borderRadius="2xl" borderWidth="1px" borderColor={STAFF_COLORS.border}>
        <Skeleton height="30px" mb={4} borderRadius="md" />
        <SkeletonText noOfLines={5} spacing={3} />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Records Available"
        message={emptyMessage}
      />
    );
  }

  return (
    <TableContainer
      bg={STAFF_COLORS.card}
      borderWidth="1px"
      borderColor={STAFF_COLORS.border}
      borderRadius="2xl"
      overflowX="auto"
    >
      <Table size="sm" variant="simple">
        <Thead bg={STAFF_COLORS.sidebar}>
          <Tr>
            {columns.map((col, idx) => (
              <Th
                key={idx}
                color={STAFF_COLORS.secondaryText}
                borderColor={STAFF_COLORS.border}
                fontSize="11px"
                py={3.5}
                textAlign={col.align || 'left'}
                width={col.width}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {col.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, rowIdx) => (
            <Tr
              key={rowIdx}
              borderColor={STAFF_COLORS.border}
              transition="background 0.15s ease"
              cursor={onRowClick ? 'pointer' : 'default'}
              _hover={{ bg: STAFF_COLORS.cardHover }}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, colIdx) => (
                <Td
                  key={colIdx}
                  borderColor={STAFF_COLORS.border}
                  py={3.5}
                  fontSize="xs"
                  color={STAFF_COLORS.text}
                  textAlign={col.align || 'left'}
                >
                  {col.cell
                    ? col.cell(item, rowIdx)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '-')
                    : '-'}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

// 5. EmptyState
export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  message = 'There is currently no data to display for this view.',
  icon: IconComponent = FiInbox,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      bg={STAFF_COLORS.card}
      borderWidth="1px"
      borderColor={STAFF_COLORS.border}
      borderRadius="2xl"
      p={{ base: 8, md: 12 }}
      textAlign="center"
      my={4}
    >
      <Flex
        w="14"
        h="14"
        borderRadius="full"
        bg={STAFF_COLORS.innerCard}
        borderWidth="1px"
        borderColor={STAFF_COLORS.border}
        color={STAFF_COLORS.mutedText}
        align="center"
        justify="center"
        fontSize="2xl"
        mx="auto"
        mb={4}
      >
        <Icon as={IconComponent} />
      </Flex>
      <Text fontSize="md" fontWeight="700" color={STAFF_COLORS.text} mb={1}>
        {title}
      </Text>
      <Text fontSize="xs" color={STAFF_COLORS.secondaryText} maxW="sm" mx="auto" mb={onAction ? 5 : 0}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          size="sm"
          bg={STAFF_COLORS.primaryGold}
          color="#0B0B0D"
          _hover={{ bg: STAFF_COLORS.lightGold }}
          borderRadius="xl"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

// 6. ErrorState
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Synchronization Failed',
  message = 'Unable to reach backend services. Please check your connection or retry.',
  onRetry,
}) => {
  return (
    <Box
      bg={STAFF_COLORS.card}
      borderWidth="1px"
      borderColor={STAFF_COLORS.danger}
      borderRadius="2xl"
      p={{ base: 8, md: 10 }}
      textAlign="center"
      my={4}
    >
      <Flex
        w="12"
        h="12"
        borderRadius="full"
        bg={STAFF_COLORS.dangerSubtle}
        color={STAFF_COLORS.danger}
        align="center"
        justify="center"
        fontSize="xl"
        mx="auto"
        mb={3}
      >
        <FiAlertTriangle />
      </Flex>
      <Text fontSize="md" fontWeight="700" color={STAFF_COLORS.text} mb={1}>
        {title}
      </Text>
      <Text fontSize="xs" color={STAFF_COLORS.secondaryText} maxW="md" mx="auto" mb={onRetry ? 4 : 0}>
        {message}
      </Text>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          borderColor={STAFF_COLORS.primaryGold}
          color={STAFF_COLORS.primaryGold}
          _hover={{ bg: STAFF_COLORS.goldSubtle }}
          borderRadius="xl"
          leftIcon={<FiRefreshCw />}
          onClick={onRetry}
        >
          Retry Connection
        </Button>
      )}
    </Box>
  );
};

// 7. LoadingSkeleton
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <VStack spacing={4} align="stretch" py={4}>
      <Skeleton height="40px" borderRadius="xl" bg={STAFF_COLORS.innerCard} />
      {[...Array(rows)].map((_, i) => (
        <Box
          key={i}
          p={5}
          bg={STAFF_COLORS.card}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={STAFF_COLORS.border}
        >
          <SkeletonText noOfLines={3} spacing={3} />
        </Box>
      ))}
    </VStack>
  );
};

// 8. ConfirmationModal
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  colorScheme?: 'gold' | 'green' | 'red';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  colorScheme = 'gold',
  isLoading = false,
}) => {
  const getButtonBg = () => {
    switch (colorScheme) {
      case 'red':
        return STAFF_COLORS.danger;
      case 'green':
        return STAFF_COLORS.success;
      case 'gold':
      default:
        return STAFF_COLORS.primaryGold;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg={STAFF_COLORS.card}
        borderColor={STAFF_COLORS.border}
        borderWidth="1px"
        borderRadius="2xl"
        color={STAFF_COLORS.text}
      >
        <ModalHeader borderBottomWidth="1px" borderColor={STAFF_COLORS.border} fontSize="md">
          {title}
        </ModalHeader>
        <ModalCloseButton color={STAFF_COLORS.secondaryText} />
        <ModalBody py={5}>
          <Text fontSize="sm" color={STAFF_COLORS.secondaryText}>
            {message}
          </Text>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={STAFF_COLORS.border}>
          <Button variant="ghost" color={STAFF_COLORS.secondaryText} mr={3} onClick={onClose} borderRadius="xl" size="sm">
            {cancelText}
          </Button>
          <Button
            bg={getButtonBg()}
            color="#0B0B0D"
            _hover={{ opacity: 0.9 }}
            borderRadius="xl"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// 9. Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
}) => {
  if (totalPages <= 1) return null;

  return (
    <Flex justify="space-between" align="center" mt={4} pt={2} px={1} wrap="wrap" gap={2}>
      {totalRecords !== undefined ? (
        <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
          Page {currentPage} of {totalPages} ({totalRecords} total items)
        </Text>
      ) : (
        <Text fontSize="xs" color={STAFF_COLORS.secondaryText}>
          Page {currentPage} of {totalPages}
        </Text>
      )}

      <HStack spacing={2}>
        <IconButton
          size="sm"
          variant="outline"
          borderColor={STAFF_COLORS.border}
          borderRadius="xl"
          aria-label="Previous page"
          icon={<FiChevronLeft />}
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          _hover={{ borderColor: STAFF_COLORS.primaryGold }}
        />
        <Text fontSize="xs" fontWeight="700" color={STAFF_COLORS.primaryGold} px={2}>
          {currentPage}
        </Text>
        <IconButton
          size="sm"
          variant="outline"
          borderColor={STAFF_COLORS.border}
          borderRadius="xl"
          aria-label="Next page"
          icon={<FiChevronRight />}
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          _hover={{ borderColor: STAFF_COLORS.primaryGold }}
        />
      </HStack>
    </Flex>
  );
};

