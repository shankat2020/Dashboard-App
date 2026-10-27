import React, { useState } from 'react';
import { ShoppingBag, ArrowUpDown, ChevronRight, X, Calendar, CreditCard, Tag } from 'lucide-react';
import { ProductMetric } from '../data/analytics';
import { SaleRecord, PRODUCT_CATEGORIES, PAYMENT_METHOD_COLORS } from '../data/salesData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProductMatrixViewProps {
  products: ProductMetric[];
  rawRecords: SaleRecord[];
  selectedProduct: string | null;
  onSelectProduct: (productName: string | null) => void;
}

export const ProductMatrixView: React.FC<ProductMatrixViewProps> = ({
  products,
  rawRecords,
  selectedProduct,
  onSelectProduct,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortField, setSortField] = useState<'revenue' | 'units' | 'price'>('revenue');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  // Filtered & sorted products
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterTier !== 'all' && p.tier !== filterTier) return false;
    return true;
  });

  filteredProducts.sort((a, b) => {
    let diff = 0;
    if (sortField === 'revenue') diff = b.totalRevenue - a.totalRevenue;
    else if (sortField === 'units') diff = b.unitsSold - a.unitsSold;
    else if (sortField === 'price') diff = b.unitPrice - a.unitPrice;
    return sortDirection === 'desc' ? diff : -diff;
  });

  const toggleSort = (field: 'revenue' | 'units' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Find detail data for currently selected product
  const activeProductDetail = products.find((p) => p.product === selectedProduct);
  const activeProductRecords = selectedProduct
    ? rawRecords.filter((r) => r.product === selectedProduct)
    : [];

  // Group active product records by date for mini timeline
  const productDateMap = new Map<string, number>();
  activeProductRecords.forEach((r) => {
    productDateMap.set(r.date, (productDateMap.get(r.date) || 0) + 1);
  });
  const productDateChart = Array.from(productDateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => {
      const [y, m, d] = date.split('-').map(Number);
      const dObj = new Date(y, m - 1, d);
      return {
        date,
        formatted: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      };
    });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Garment Catalog Matrix</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Comparative analysis of pricing, sales velocity, and category performance
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Filter */}
            <div className="relative">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="Premium">Premium ($145 - $175)</option>
                <option value="Mid-Range">Mid-Range ($78 - $115)</option>
                <option value="Essential">Essential ($58 - $75)</option>
              </select>
            </div>

            {/* Sort Toggles */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => toggleSort('revenue')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sortField === 'revenue' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Revenue {sortField === 'revenue' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('units')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sortField === 'units' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Units {sortField === 'units' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('price')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sortField === 'price' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Price {sortField === 'price' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct === p.product;
            return (
              <div
                key={p.product}
                onClick={() => onSelectProduct(isSelected ? null : p.product)}
                className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{p.product}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{p.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.tier}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono tabular-nums shrink-0">
                    ${p.unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Revenue</div>
                    <div className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                      ${p.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Units Sold</div>
                    <div className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                      {p.unitsSold}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Catalog Share</div>
                    <div className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                      {p.revenueShare.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
                  <span>Appeared in {p.orderCount} orders</span>
                  <span className="text-blue-600 font-medium flex items-center gap-0.5">
                    View timeline <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Detail Modal / Drawer if a product is selected */}
      {selectedProduct && activeProductDetail && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Product Deep Dive
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{activeProductDetail.category}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedProduct}</h3>
            </div>
            <button
              onClick={() => onSelectProduct(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Timeline chart */}
            <div className="lg:col-span-7">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Purchase Velocity Timeline</h4>
              <div className="h-48 border border-slate-100 rounded-lg p-2 bg-slate-50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productDateChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="formatted" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs rounded p-2 shadow">
                              <div>{d.date}</div>
                              <div className="font-bold text-emerald-400 mt-0.5">
                                {d.count} unit(s) purchased
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right side: Associated Transactions */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-2">
                  Transaction History ({activeProductRecords.length} records)
                </h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
                  {activeProductRecords.map((r) => (
                    <div key={r.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{r.orderNumber}</div>
                        <div className="text-[11px] text-slate-500">{r.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono tabular-nums font-bold text-slate-900">
                          ${r.price.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500">{r.paymentMethod}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
