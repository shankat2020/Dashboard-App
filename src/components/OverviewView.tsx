import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, ShoppingBag, CreditCard, DollarSign, ArrowUpRight, BarChart3 } from 'lucide-react';
import {
  DashboardMetrics,
  TimeSeriesPoint,
  ProductMetric,
  PaymentMetric,
  DayOfWeekMetric,
} from '../data/analytics';
import { PAYMENT_METHOD_COLORS, PRODUCT_CATEGORIES } from '../data/salesData';

interface OverviewViewProps {
  metrics: DashboardMetrics;
  timeSeries: TimeSeriesPoint[];
  productMetrics: ProductMetric[];
  paymentMetrics: PaymentMetric[];
  dayOfWeekMetrics: DayOfWeekMetric[];
  onSelectProduct?: (productName: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  timeSeries,
  productMetrics,
  paymentMetrics,
  dayOfWeekMetrics,
  onSelectProduct,
}) => {
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'movingAverage' | 'cumulative'>('revenue');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [productSort, setProductSort] = useState<'revenue' | 'units'>('revenue');

  const sortedProducts = [...productMetrics].sort((a, b) =>
    productSort === 'revenue' ? b.totalRevenue - a.totalRevenue : b.unitsSold - a.unitsSold
  );

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Hero Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="tabular-nums font-semibold text-slate-700">{metrics.totalUnits} items</span>
            <span aria-hidden="true">·</span>
            <span>Across 54-day period</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            ${metrics.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="tabular-nums font-semibold text-slate-700">{metrics.uniqueOrdersCount} orders</span>
            <span aria-hidden="true">·</span>
            <span>${metrics.averageItemPrice.toFixed(2)} / item</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Top Product by Revenue</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-lg font-bold tracking-tight text-slate-900 truncate" title={metrics.topProductByRevenue.name}>
            {metrics.topProductByRevenue.name || '—'}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="tabular-nums font-semibold text-slate-700">${metrics.topProductByRevenue.revenue.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.topProductByRevenue.units} units sold</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Primary Payment Method</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-lg font-bold tracking-tight text-slate-900">
            {metrics.topPaymentMethod.name || '—'}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="tabular-nums font-semibold text-slate-700">${metrics.topPaymentMethod.revenue.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.topPaymentMethod.count} transactions</span>
          </div>
        </div>
      </div>

      {/* Main Section: Revenue Trajectory & Time Series */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Revenue Trajectory & Sales Velocity</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Time-series tracking of sales performance from August 15 through October 7, 2025
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setTrendMetric('revenue')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  trendMetric === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Revenue
              </button>
              <button
                onClick={() => setTrendMetric('movingAverage')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  trendMetric === 'movingAverage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Moving Avg
              </button>
              <button
                onClick={() => setTrendMetric('cumulative')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  trendMetric === 'cumulative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cumulative Growth
              </button>
            </div>

            {/* Chart Type Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'area' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartType === 'line' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Line
              </button>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 mt-4 w-full">
          {timeSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No sales records match the current filter selection.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as TimeSeriesPoint;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg border border-slate-800">
                            <div className="font-semibold text-slate-200">
                              {data.formattedDate} ({data.dayOfWeek})
                            </div>
                            <div className="mt-1.5 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Daily Revenue:</span>
                              <span className="font-mono tabular-nums font-bold text-emerald-400">
                                ${data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-4">
                              <span className="text-slate-400">7-Day Moving Avg:</span>
                              <span className="font-mono tabular-nums text-slate-300">
                                ${data.movingAverage7d?.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Cumulative:</span>
                              <span className="font-mono tabular-nums text-blue-300">
                                ${data.cumulativeRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-4 text-slate-400">
                              <span>Orders / Units:</span>
                              <span className="tabular-nums">
                                {data.orders} orders · {data.units} items
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={
                      trendMetric === 'revenue'
                        ? 'revenue'
                        : trendMetric === 'movingAverage'
                        ? 'movingAverage7d'
                        : 'cumulativeRevenue'
                    }
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              ) : chartType === 'bar' ? (
                <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as TimeSeriesPoint;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg">
                            <div className="font-semibold text-slate-200">
                              {data.formattedDate} ({data.dayOfWeek})
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Revenue:</span>
                              <span className="font-mono tabular-nums font-bold text-emerald-400">
                                ${data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Units:</span>
                              <span className="tabular-nums font-semibold">{data.units}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={
                      trendMetric === 'revenue'
                        ? 'revenue'
                        : trendMetric === 'movingAverage'
                        ? 'movingAverage7d'
                        : 'cumulativeRevenue'
                    }
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as TimeSeriesPoint;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg">
                            <div className="font-semibold text-slate-200">
                              {data.formattedDate} ({data.dayOfWeek})
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Value:</span>
                              <span className="font-mono tabular-nums font-bold text-emerald-400">
                                $
                                {(trendMetric === 'revenue'
                                  ? data.revenue
                                  : trendMetric === 'movingAverage'
                                  ? data.movingAverage7d
                                  : data.cumulativeRevenue
                                )?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={
                      trendMetric === 'revenue'
                        ? 'revenue'
                        : trendMetric === 'movingAverage'
                        ? 'movingAverage7d'
                        : 'cumulativeRevenue'
                    }
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#2563eb' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Two-Column Deep Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Product Performance Leaderboard */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Product Performance Ranking</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  12 garments across denim, casual trousers, tailored wool, and workwear
                </div>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setProductSort('revenue')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    productSort === 'revenue' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  By Revenue
                </button>
                <button
                  onClick={() => setProductSort('units')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    productSort === 'units' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                  }`}
                >
                  By Units
                </button>
              </div>
            </div>

            {/* High-density product ranking table with inline bar indicators */}
            <div className="mt-4 divide-y divide-slate-100">
              {sortedProducts.map((p, idx) => {
                const maxVal = productSort === 'revenue' ? sortedProducts[0]?.totalRevenue || 1 : sortedProducts[0]?.unitsSold || 1;
                const currentVal = productSort === 'revenue' ? p.totalRevenue : p.unitsSold;
                const percent = Math.min(100, Math.round((currentVal / maxVal) * 100));

                return (
                  <div
                    key={p.product}
                    onClick={() => onSelectProduct?.(p.product)}
                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-slate-400 font-mono w-4 shrink-0 text-right">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.product}
                        </div>
                        <div className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                          <span>${p.unitPrice.toFixed(2)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{p.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{p.unitsSold} units</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Visual fill indicator bar */}
                      <div className="w-20 sm:w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-slate-800 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-right w-20">
                        <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                          ${p.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {p.revenueShare.toFixed(1)}% share
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Payment Channels Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Payment Channel Distribution</h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Revenue and transaction volume by payment instrument
              </div>
            </div>

            {/* Donut Chart with center readout */}
            <div className="h-52 mt-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMetrics}
                    dataKey="revenue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {paymentMetrics.map((entry) => (
                      <Cell
                        key={`cell-${entry.method}`}
                        fill={PAYMENT_METHOD_COLORS[entry.method] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PaymentMetric;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                            <div className="font-semibold text-slate-200">{data.method}</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <span className="text-slate-400">Revenue:</span>
                              <span className="font-mono tabular-nums font-bold text-emerald-400">
                                ${data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-3">
                              <span className="text-slate-400">Transactions:</span>
                              <span className="tabular-nums">{data.transactions} ({data.transactionShare.toFixed(1)}%)</span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-3">
                              <span className="text-slate-400">Avg Ticket:</span>
                              <span className="font-mono tabular-nums">${data.averageTicket}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Total Gross</span>
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  ${metrics.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Breakdown Table */}
            <div className="mt-4 space-y-2.5">
              {paymentMetrics.map((pm) => (
                <div
                  key={pm.method}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PAYMENT_METHOD_COLORS[pm.method] || '#64748b' }}
                    />
                    <div>
                      <span className="font-medium text-slate-900">{pm.method}</span>
                      <div className="text-slate-500 text-[11px] tabular-nums">
                        {pm.transactions} txns · avg ${pm.averageTicket}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-slate-900">${pm.revenue.toLocaleString()}</div>
                    <div className="text-slate-500 text-[11px]">{pm.revenueShare.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day of Week Velocity Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Day-of-Week Sales Performance</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Aggregated revenue and order velocity across Monday through Sunday
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Peak Day: <strong className="text-slate-900">{[...dayOfWeekMetrics].sort((a,b) => b.revenue - a.revenue)[0]?.day || '—'}</strong>
          </div>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeekMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayOfWeekMetric;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg">
                        <div className="font-semibold text-slate-200">{data.day}</div>
                        <div className="mt-1 flex items-center justify-between gap-4">
                          <span className="text-slate-400">Total Revenue:</span>
                          <span className="font-mono tabular-nums font-bold text-emerald-400">
                            ${data.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-4">
                          <span className="text-slate-400">Items Sold:</span>
                          <span className="tabular-nums font-semibold">{data.units}</span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-4">
                          <span className="text-slate-400">Orders:</span>
                          <span className="tabular-nums">{data.orders}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
