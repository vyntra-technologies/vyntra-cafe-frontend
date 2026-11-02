import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  useColorModeValue,
  useToast,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiTrendingUp,
  FiBox,
  FiAlertTriangle,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { InventorySubNav } from '../../../components/admin/inventory/InventorySubNav';
import { inventoryService } from '../../../services/inventory.service';
import { IInventoryReport } from '../../../types';

export const AdminInventoryReportsPage: React.FC = () => {
  const [report, setReport] = useState<IInventoryReport | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.750');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getInventoryReport();
      setReport(data);
    } catch (err: any) {
      toast({
        title: 'Error loading inventory report',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = (report?.ingredients || []).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth =
      filterHealth === 'all'
        ? true
        : filterHealth === 'low'
        ? item.isLowStock
        : !item.isLowStock;
    return matchesSearch && matchesHealth;
  });

  const lowStockRatio = report?.totalIngredientsTracked
    ? Math.round(((report.lowStockIngredientsCount || 0) / report.totalIngredientsTracked) * 100)
    : 0;

  return (
    <AdminLayout pageTitle="Inventory Valuation & Reports">
      <Box p={{ base: 4, md: 6 }}>
        <InventorySubNav lowStockCount={report?.lowStockIngredientsCount || 0} />

        {/* Page Header */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading size="lg" fontWeight="700">
              Inventory Valuation & Asset Report
            </Heading>
            <Text color={subtleText} fontSize="sm" mt={1}>
              Live valuation and capital allocation across all cafe inventory items.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={fetchReport}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiPrinter />}
              colorScheme="brand"
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              Print Report
            </Button>
          </HStack>
        </Flex>

        {/* High-Level KPIs */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={5} mb={8}>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Total Asset Valuation
                </StatLabel>
                <Icon as={FiTrendingUp} color="green.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="green.600">
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  `₹${(report?.totalInventoryValuation || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}`
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Total tied-up capital in raw materials
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Tracked Raw Materials
                </StatLabel>
                <Icon as={FiBox} color="brand.500" boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2}>
                {isLoading ? <Spinner size="sm" /> : report?.totalIngredientsTracked || 0}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                Active ingredients in catalog
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <StatLabel fontSize="sm" fontWeight="600" color={subtleText}>
                  Low Stock Ratio
                </StatLabel>
                <Icon as={FiAlertTriangle} color={report?.lowStockIngredientsCount ? 'orange.500' : 'green.500'} boxSize={5} />
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color={report?.lowStockIngredientsCount ? 'orange.500' : 'green.600'}>
                {isLoading ? <Spinner size="sm" /> : `${lowStockRatio}%`}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0} color={subtleText}>
                {report?.lowStockIngredientsCount || 0} item(s) below reorder level
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Filters */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          mb={6}
          boxShadow="sm"
        >
          <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align="center">
            <Flex flex="1" w="full" position="relative">
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl={10}
                size="sm"
                borderRadius="lg"
              />
              <Box position="absolute" left={3} top={2.5} color={subtleText}>
                <FiSearch />
              </Box>
            </Flex>

            <Select
              size="sm"
              borderRadius="lg"
              w={{ base: 'full', sm: '180px' }}
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="healthy">Healthy Stock Only</option>
              <option value="low">Low Stock Only</option>
            </Select>
          </Flex>
        </Box>

        {/* Valuation Table */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
          overflow="hidden"
        >
          {isLoading ? (
            <Flex justify="center" align="center" py={12}>
              <Spinner size="lg" color="brand.500" />
            </Flex>
          ) : filteredItems.length === 0 ? (
            <VStack py={12} spacing={3}>
              <FiBarChart2 size={36} color="gray" />
              <Text fontWeight="600" color={subtleText}>
                No valuation data found
              </Text>
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>Ingredient Name</Th>
                    <Th isNumeric>Current Physical Stock</Th>
                    <Th isNumeric>Reorder Threshold</Th>
                    <Th isNumeric>Cost / Unit</Th>
                    <Th isNumeric>Asset Valuation</Th>
                    <Th>Health Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredItems.map((item) => (
                    <Tr key={item.id} _hover={{ bg: rowHoverBg }}>
                      <Td fontWeight="600">{item.name}</Td>
                      <Td isNumeric fontWeight="500">
                        {item.currentStock} {item.unit}
                      </Td>
                      <Td isNumeric color={subtleText}>
                        {item.reorderLevel} {item.unit}
                      </Td>
                      <Td isNumeric>₹{item.costPerUnit.toFixed(2)}</Td>
                      <Td isNumeric fontWeight="bold" color="green.600">
                        ₹{item.totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td>
                        {item.isLowStock ? (
                          <Badge colorScheme="red" variant="subtle" fontSize="2xs">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge colorScheme="green" variant="subtle" fontSize="2xs">
                            Adequate
                          </Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </Box>
    </AdminLayout>
  );
};

