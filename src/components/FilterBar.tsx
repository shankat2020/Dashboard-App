import React from 'react';
import { Filter, X, Search, Calendar, CreditCard, RotateCcw } from 'lucide-react';

export interface FilterState {
  dateRange: 'all' | 'august' | 'september' | 'october' | 'custom';
  startDate: string;
  endDate: string;
  selectedProduct: string; // 'all' or product name
  selectedPayment: string; // 'all' or method
  searchQuery: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableProducts: string[];
  availablePaymentMethods: string[];
  filteredCount: number;
  totalCount: number;
  filteredRevenue: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableProducts,
  availablePaymentMethods,
  filteredCount,
  totalCount,
  filteredRevenue,
}) => {
  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.selectedProduct !== 'all' ||
    filters.selectedPayment !== 'all' ||
    filters.searchQuery.trim().length > 0;

  const handleReset = () => {
    onFilterChange({
      dateRange: 'all',
      startDate: '',
      endDate: '',
      selectedProduct: 'all',
      selectedPayment: 'all',
      searchQuery: '',
    });
  };

  const handleDatePreset = (preset: 'all' | 'august' | 'september' | 'october') => {
    let start = '';
    let end = '';
    if (preset === 'august') {
      start = '2025-08-01';
      end = '2025-08-31';
    } else if (preset === 'september') {
      start = '2025-09-01';
      end = '2025-09-30';
    } else if (preset === 'october') {
      start = '2025-10-01';
      end = '2025-10-31';
    }
    onFilterChange({
      ...filters,
      dateRange: preset,
      startDate: start,
      endDate: end,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Presets (Segmented interactive buttons) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => handleDatePreset('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.dateRange === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Data
            </button>
            <button
              onClick={() => handleDatePreset('august')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.dateRange === 'august'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aug '25
            </button>
            <button
              onClick={() => handleDatePreset('september')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.dateRange === 'september'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sep '25
            </button>
            <button
              onClick={() => handleDatePreset('october')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.dateRange === 'october'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oct '25
            </button>
          </div>

          {/* Product Select */}
          <div className="relative">
            <select
              value={filters.selectedProduct}
              onChange={(e) => onFilterChange({ ...filters, selectedProduct: e.target.value })}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Products (12)</option>
              {availableProducts.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Payment Method Select */}
          <div className="relative">
            <select
              value={filters.selectedPayment}
              onChange={(e) => onFilterChange({ ...filters, selectedPayment: e.target.value })}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              {availablePaymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search Query */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order # or item..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reset button if active */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Unboxed metadata readout with separators */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
          <span>
            Showing <strong className="text-slate-900 font-semibold tabular-nums">{filteredCount}</strong> of{' '}
            <span className="tabular-nums">{totalCount}</span> line items
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            Volume: <strong className="text-slate-900 font-semibold tabular-nums">${filteredRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
