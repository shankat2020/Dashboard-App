import React, { useState, useMemo } from 'react';
import {
  SaleRecord,
  INITIAL_SALES_DATA,
  RAW_CSV_DATA,
  parseCsv,
  PRODUCT_CATEGORIES,
} from './data/salesData';
import {
  computeDashboardMetrics,
  computeTimeSeries,
  computeProductMetrics,
  computePaymentMetrics,
  computeDayOfWeekMetrics,
  computeBasketMetrics,
} from './data/analytics';
import { Header, ActiveTab } from './components/Header';
import { FilterBar, FilterState } from './components/FilterBar';
import { OverviewView } from './components/OverviewView';
import { VisualizerView } from './components/VisualizerView';
import { ProductMatrixView } from './components/ProductMatrixView';
import { PaymentBasketView } from './components/PaymentBasketView';
import { DataLedgerView } from './components/DataLedgerView';
import { AddRecordModal } from './components/AddRecordModal';

export default function App() {
  const [records, setRecords] = useState<SaleRecord[]>(INITIAL_SALES_DATA);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    selectedProduct: 'all',
    selectedPayment: 'all',
    searchQuery: '',
  });

  const isCustomData = records !== INITIAL_SALES_DATA && records.length !== INITIAL_SALES_DATA.length;

  // Available filters from entire dataset
  const availableProducts = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.product))).sort();
  }, [records]);

  const availablePaymentMethods = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.paymentMethod))).sort();
  }, [records]);

  // Apply global filters
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Date filter
      if (filters.dateRange !== 'all') {
        if (filters.startDate && r.date < filters.startDate) return false;
        if (filters.endDate && r.date > filters.endDate) return false;
      }

      // Product filter
      if (filters.selectedProduct !== 'all' && r.product !== filters.selectedProduct) {
        return false;
      }

      // Payment filter
      if (filters.selectedPayment !== 'all' && r.paymentMethod !== filters.selectedPayment) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const match =
          r.orderNumber.toLowerCase().includes(q) ||
          r.product.toLowerCase().includes(q) ||
          r.paymentMethod.toLowerCase().includes(q) ||
          r.date.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [records, filters]);

  // Analytical metrics
  const dashboardMetrics = useMemo(() => computeDashboardMetrics(filteredRecords), [filteredRecords]);
  const timeSeries = useMemo(() => computeTimeSeries(filteredRecords), [filteredRecords]);
  const productMetrics = useMemo(() => computeProductMetrics(filteredRecords), [filteredRecords]);
  const paymentMetrics = useMemo(() => computePaymentMetrics(filteredRecords), [filteredRecords]);
  const dayOfWeekMetrics = useMemo(() => computeDayOfWeekMetrics(filteredRecords), [filteredRecords]);
  const basketMetrics = useMemo(() => computeBasketMetrics(filteredRecords), [filteredRecords]);

  // Export CSV handler
  const handleExportCsv = () => {
    const header = 'Order Number,Product,Price,Date,Payment Method\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.orderNumber}","${r.product}","$${r.price.toFixed(2)}","${r.date}","${r.paymentMethod}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset data handler
  const handleResetData = () => {
    setRecords(parseCsv(RAW_CSV_DATA));
  };

  // Add record handler
  const handleAddRecord = (record: Omit<SaleRecord, 'id'>) => {
    const newRecord: SaleRecord = {
      ...record,
      id: `${record.orderNumber}-${Date.now()}`,
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Delete record handler
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Import custom CSV
  const handleImportCsv = (csvText: string) => {
    try {
      const parsed = parseCsv(csvText);
      if (parsed.length > 0) {
        setRecords(parsed);
      }
    } catch (err) {
      console.error('Failed to parse uploaded CSV', err);
    }
  };

  const handleSelectProduct = (productName: string | null) => {
    setSelectedProduct(productName);
    if (productName && activeTab !== 'products') {
      setActiveTab('products');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        isCustomData={isCustomData}
        totalRecords={records.length}
      />

      {/* Global Interactive Filter Strip */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        availableProducts={availableProducts}
        availablePaymentMethods={availablePaymentMethods}
        filteredCount={filteredRecords.length}
        totalCount={records.length}
        filteredRevenue={dashboardMetrics.totalRevenue}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            metrics={dashboardMetrics}
            timeSeries={timeSeries}
            productMetrics={productMetrics}
            paymentMetrics={paymentMetrics}
            dayOfWeekMetrics={dayOfWeekMetrics}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'visualizer' && (
          <VisualizerView data={filteredRecords} />
        )}

        {activeTab === 'products' && (
          <ProductMatrixView
            products={productMetrics}
            rawRecords={filteredRecords}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentBasketView
            paymentMetrics={paymentMetrics}
            basketMetrics={[]}
            basket={basketMetrics}
          />
        )}

        {activeTab === 'ledger' && (
          <DataLedgerView
            records={filteredRecords}
            onAddRecordClick={() => setIsAddModalOpen(true)}
            onDeleteRecord={handleDeleteRecord}
            onImportCsv={handleImportCsv}
          />
        )}
      </main>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        availableProducts={availableProducts}
      />
    </div>
  );
}
