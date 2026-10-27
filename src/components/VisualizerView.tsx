import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Compass,
  Layers,
  ArrowUpDown,
  Sparkles,
  Table,
  SlidersHorizontal,
} from 'lucide-react';
import { SaleRecord, PRODUCT_CATEGORIES, PAYMENT_METHOD_COLORS } from '../data/salesData';

interface VisualizerViewProps {
  data: SaleRecord[];
}

type ChartKind = 'bar' | 'horizontal-bar' | 'area' | 'line' | 'donut' | 'radar' | 'composed';
type DimensionKind = 'product' | 'category' | 'paymentMethod' | 'date' | 'dayOfWeek' | 'tier';
type MetricKind = 'revenue' | 'units' | 'orders' | 'avgTicket';

const PALETTE = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#4f46e5', // indigo
  '#ea580c', // orange
  '#16a34a', // green
  '#9333ea', // purple
  '#0284c7', // light blue
  '#475569', // slate
];

export const VisualizerView: React.FC<VisualizerViewProps> = ({ data }) => {
  const [chartKind, setChartKind] = useState<ChartKind>('composed');
  const [dimension, setDimension] = useState<DimensionKind>('product');
  const [primaryMetric, setPrimaryMetric] = useState<MetricKind>('revenue');
  const [sortBy, setSortBy] = useState<'desc' | 'asc' | 'natural'>('desc');
  const [showDataTable, setShowDataTable] = useState(false);

  // Quick preset loader
  const applyPreset = (preset: {
    chart: ChartKind;
    dim: DimensionKind;
    metric: MetricKind;
    sort: 'desc' | 'asc' | 'natural';
  }) => {
    setChartKind(preset.chart);
    setDimension(preset.dim);
    setPrimaryMetric(preset.metric);
    setSortBy(preset.sort);
  };

  // Compute aggregated data dynamically based on dimension and metrics
  const aggregatedData = useMemo(() => {
    if (data.length === 0) return [];

    const groupMap = new Map<
      string,
      {
        key: string;
        label: string;
        revenue: number;
        units: number;
        orders: Set<string>;
        dateSortKey?: string;
        daySortKey?: number;
      }
    >();

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    data.forEach((r) => {
      let groupKey = '';
      let displayLabel = '';
      let dateSortKey: string | undefined;
      let daySortKey: number | undefined;

      if (dimension === 'product') {
        groupKey = r.product;
        displayLabel = r.product;
      } else if (dimension === 'category') {
        const cat = PRODUCT_CATEGORIES[r.product]?.category || 'Other';
        groupKey = cat;
        displayLabel = cat;
      } else if (dimension === 'paymentMethod') {
        groupKey = r.paymentMethod;
        displayLabel = r.paymentMethod;
      } else if (dimension === 'date') {
        groupKey = r.date;
        dateSortKey = r.date;
        const [y, m, d] = r.date.split('-').map(Number);
        const dObj = new Date(y, m - 1, d);
        displayLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (dimension === 'dayOfWeek') {
        const [y, m, d] = r.date.split('-').map(Number);
        const dObj = new Date(y, m - 1, d);
        const dIndex = dObj.getDay();
        groupKey = dayNames[dIndex];
        displayLabel = dayNames[dIndex];
        daySortKey = (dIndex + 6) % 7; // Mon = 0, Sun = 6
      } else if (dimension === 'tier') {
        const tier = PRODUCT_CATEGORIES[r.product]?.tier || 'Mid-Range';
        groupKey = tier;
        displayLabel = tier;
      }

      const curr = groupMap.get(groupKey) || {
        key: groupKey,
        label: displayLabel,
        revenue: 0,
        units: 0,
        orders: new Set<string>(),
        dateSortKey,
        daySortKey,
      };

      curr.revenue += r.price;
      curr.units += 1;
      curr.orders.add(r.orderNumber);
      groupMap.set(groupKey, curr);
    });

    const list = Array.from(groupMap.values()).map((item) => ({
      name: item.label,
      fullName: item.key,
      revenue: item.revenue,
      units: item.units,
      orders: item.orders.size,
      avgTicket: item.units > 0 ? Math.round(item.revenue / item.units) : 0,
      dateSortKey: item.dateSortKey,
      daySortKey: item.daySortKey,
    }));

    // Sort list
    if (sortBy === 'desc') {
      list.sort((a, b) => b[primaryMetric] - a[primaryMetric]);
    } else if (sortBy === 'asc') {
      list.sort((a, b) => a[primaryMetric] - b[primaryMetric]);
    } else {
      // Natural sorting
      if (dimension === 'date') {
        list.sort((a, b) => (a.dateSortKey || '').localeCompare(b.dateSortKey || ''));
      } else if (dimension === 'dayOfWeek') {
        list.sort((a, b) => (a.daySortKey ?? 0) - (b.daySortKey ?? 0));
      } else {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    return list;
  }, [data, dimension, primaryMetric, sortBy]);

  // Statistics calculation for the current dynamic view
  const stats = useMemo(() => {
    if (aggregatedData.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };
    const values = aggregatedData.map((d) => d[primaryMetric]);
    const total = values.reduce((sum, v) => sum + v, 0);
    const avg = Math.round(total / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return { total, avg, max, min };
  }, [aggregatedData, primaryMetric]);

  const getMetricFormat = (val: number) => {
    if (primaryMetric === 'revenue' || primaryMetric === 'avgTicket') {
      return `$${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  const metricLabel =
    primaryMetric === 'revenue'
      ? 'Gross Revenue ($)'
      : primaryMetric === 'units'
      ? 'Units Sold (Qty)'
      : primaryMetric === 'orders'
      ? 'Unique Orders'
      : 'Average Ticket / Item ($)';

  return (
    <div className="space-y-6">
      {/* Studio Banner & Presets Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <h2 className="text-base font-semibold text-slate-900">Multi-View Visualization Studio</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Switch visual forms, pivot across 6 analytical dimensions, and correlate revenue, orders, and unit velocity.
            </p>
          </div>

          {/* Quick preset templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
            <button
              onClick={() =>
                applyPreset({ chart: 'composed', dim: 'product', metric: 'revenue', sort: 'desc' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Revenue + Units Dual-Axis
            </button>
            <button
              onClick={() =>
                applyPreset({ chart: 'radar', dim: 'category', metric: 'revenue', sort: 'desc' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Category Radar
            </button>
            <button
              onClick={() =>
                applyPreset({ chart: 'donut', dim: 'paymentMethod', metric: 'revenue', sort: 'desc' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Payment Distribution
            </button>
            <button
              onClick={() =>
                applyPreset({ chart: 'horizontal-bar', dim: 'product', metric: 'units', sort: 'desc' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Unit Volume Ranking
            </button>
            <button
              onClick={() =>
                applyPreset({ chart: 'area', dim: 'date', metric: 'revenue', sort: 'natural' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Daily Revenue Flow
            </button>
            <button
              onClick={() =>
                applyPreset({ chart: 'bar', dim: 'dayOfWeek', metric: 'revenue', sort: 'natural' })
              }
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              Weekly Rhythm
            </button>
          </div>
        </div>

        {/* Dynamic Visualizer Controls Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Visualization Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Chart Type
            </label>
            <select
              value={chartKind}
              onChange={(e) => setChartKind(e.target.value as ChartKind)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="composed">Composed Dual-Axis (Bars + Trend Line)</option>
              <option value="bar">Vertical Columns</option>
              <option value="horizontal-bar">Horizontal Ranked Bars</option>
              <option value="area">Smooth Area Chart</option>
              <option value="line">Point-to-Point Line</option>
              <option value="donut">Donut Proportion Ring</option>
              <option value="radar">Multi-Axial Radar Profile</option>
            </select>
          </div>

          {/* 2. Group Dimension */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Group Dimension (X-Axis)
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as DimensionKind)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="product">Garment / Product (12 items)</option>
              <option value="category">Apparel Category</option>
              <option value="paymentMethod">Payment Method</option>
              <option value="date">Daily Date Timeline</option>
              <option value="dayOfWeek">Day of Week (Mon - Sun)</option>
              <option value="tier">Price Tier (Essential, Mid, Premium)</option>
            </select>
          </div>

          {/* 3. Primary Metric */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Primary Metric (Value)
            </label>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value as MetricKind)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="revenue">Gross Revenue ($)</option>
              <option value="units">Units Sold (Count)</option>
              <option value="orders">Unique Orders</option>
              <option value="avgTicket">Average Ticket / Item ($)</option>
            </select>
          </div>

          {/* 4. Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Ordering / Sequence
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'desc' | 'asc' | 'natural')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="desc">Highest Value First (Descending)</option>
              <option value="asc">Lowest Value First (Ascending)</option>
              <option value="natural">Natural Order (Date / Days / A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Chart Canvas */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{metricLabel}</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Aggregated across {aggregatedData.length} data groupings
            </div>
          </div>
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showDataTable ? 'Hide Data Table' : 'Show Data Table'}</span>
          </button>
        </div>

        {/* Viewport */}
        <div className="h-88 mt-4 w-full">
          {aggregatedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No matching records for current filters.
            </div>
          ) : chartKind === 'composed' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={aggregatedData}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => (primaryMetric === 'revenue' ? `$${v}` : `${v}`)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">Revenue:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              ${d.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-4">
                            <span className="text-slate-400">Units Sold:</span>
                            <span className="tabular-nums font-semibold">{d.units}</span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-4">
                            <span className="text-slate-400">Orders:</span>
                            <span className="tabular-nums">{d.orders}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  yAxisId="left"
                  dataKey={primaryMetric}
                  name={metricLabel}
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="units"
                  name="Units Sold (Qty)"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : chartKind === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aggregatedData}
                margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) =>
                    primaryMetric === 'revenue' || primaryMetric === 'avgTicket' ? `$${v}` : `${v}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={primaryMetric} fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {aggregatedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : chartKind === 'horizontal-bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={aggregatedData}
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) =>
                    primaryMetric === 'revenue' || primaryMetric === 'avgTicket' ? `$${v}` : `${v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  width={95}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-4 text-slate-400">
                            <span>Units / Orders:</span>
                            <span>{d.units} items · {d.orders} orders</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={primaryMetric} fill="#0f172a" radius={[0, 4, 4, 0]}>
                  {aggregatedData.map((_, index) => (
                    <Cell key={`cell-h-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : chartKind === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={aggregatedData}
                margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) =>
                    primaryMetric === 'revenue' || primaryMetric === 'avgTicket' ? `$${v}` : `${v}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])}
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
                  dataKey={primaryMetric}
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#visGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartKind === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={aggregatedData}
                margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) =>
                    primaryMetric === 'revenue' || primaryMetric === 'avgTicket' ? `$${v}` : `${v}`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])}
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
                  dataKey={primaryMetric}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : chartKind === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aggregatedData}
                  dataKey={primaryMetric}
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                >
                  {aggregatedData.map((_, index) => (
                    <Cell key={`donut-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const pct = stats.total > 0 ? ((d[primaryMetric] / stats.total) * 100).toFixed(1) : '0';
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])} ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            // Radar Chart
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={aggregatedData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis stroke="#94a3b8" fontSize={10} />
                <Radar
                  name={metricLabel}
                  dataKey={primaryMetric}
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg">
                          <div className="font-semibold text-slate-200">{d.fullName || d.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">{metricLabel}:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {getMetricFormat(d[primaryMetric])}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Statistics Footer (Strict anti-slop, clean unboxed metadata) */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Dimension Aggregate</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {getMetricFormat(stats.total)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Mean Average</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {getMetricFormat(stats.avg)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Peak Point</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {getMetricFormat(stats.max)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Base Point</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {getMetricFormat(stats.min)}
            </div>
          </div>
        </div>

        {/* Collapsible Underlying Data Table */}
        {showDataTable && (
          <div className="mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 px-3 font-semibold">Group / Dimension</th>
                  <th className="py-2 px-3 font-semibold text-right">Revenue ($)</th>
                  <th className="py-2 px-3 font-semibold text-right">Units Sold</th>
                  <th className="py-2 px-3 font-semibold text-right">Orders</th>
                  <th className="py-2 px-3 font-semibold text-right">Avg Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aggregatedData.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">{row.fullName || row.name}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.units}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                      {row.orders}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                      ${row.avgTicket}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
