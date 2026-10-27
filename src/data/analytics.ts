import { SaleRecord, PRODUCT_CATEGORIES } from './salesData';

export interface DashboardMetrics {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrdersCount: number;
  averageOrderValue: number;
  averageItemPrice: number;
  multiItemOrdersCount: number;
  topProductByRevenue: { name: string; revenue: number; units: number };
  topProductByUnits: { name: string; revenue: number; units: number };
  topPaymentMethod: { name: string; revenue: number; count: number };
}

export interface TimeSeriesPoint {
  date: string;
  formattedDate: string;
  dayOfWeek: string;
  revenue: number;
  units: number;
  orders: number;
  cumulativeRevenue: number;
  movingAverage7d?: number;
}

export interface ProductMetric {
  product: string;
  category: string;
  tier: string;
  unitPrice: number;
  unitsSold: number;
  totalRevenue: number;
  revenueShare: number;
  orderCount: number;
  paymentSplit: Record<string, number>;
}

export interface PaymentMetric {
  method: string;
  revenue: number;
  transactions: number;
  revenueShare: number;
  transactionShare: number;
  averageTicket: number;
}

export interface CategoryMetric {
  category: string;
  revenue: number;
  units: number;
  share: number;
  products: string[];
}

export interface DayOfWeekMetric {
  day: string;
  order: number;
  revenue: number;
  units: number;
  orders: number;
  averageRevenue: number;
}

export interface BasketMetric {
  singleItemOrders: number;
  multiItemOrders: number;
  maxBasketSize: number;
  basketSizeDistribution: { size: string; count: number; revenue: number }[];
  coPurchasedPairs: { pair: string; count: number }[];
  basketValueBrackets: { bracket: string; count: number; revenue: number }[];
}

export function computeDashboardMetrics(data: SaleRecord[]): DashboardMetrics {
  if (data.length === 0) {
    return {
      totalRevenue: 0,
      totalUnits: 0,
      uniqueOrdersCount: 0,
      averageOrderValue: 0,
      averageItemPrice: 0,
      multiItemOrdersCount: 0,
      topProductByRevenue: { name: 'N/A', revenue: 0, units: 0 },
      topProductByUnits: { name: 'N/A', revenue: 0, units: 0 },
      topPaymentMethod: { name: 'N/A', revenue: 0, count: 0 },
    };
  }

  const totalRevenue = data.reduce((sum, r) => sum + r.price, 0);
  const totalUnits = data.length;

  // Group by orderNumber
  const orderMap = new Map<string, SaleRecord[]>();
  data.forEach((r) => {
    const list = orderMap.get(r.orderNumber) || [];
    list.push(r);
    orderMap.set(r.orderNumber, list);
  });

  const uniqueOrdersCount = orderMap.size;
  const averageOrderValue = uniqueOrdersCount > 0 ? totalRevenue / uniqueOrdersCount : 0;
  const averageItemPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  let multiItemOrdersCount = 0;
  orderMap.forEach((items) => {
    if (items.length > 1) multiItemOrdersCount++;
  });

  // Top products
  const productRevenueMap = new Map<string, { revenue: number; units: number }>();
  data.forEach((r) => {
    const curr = productRevenueMap.get(r.product) || { revenue: 0, units: 0 };
    curr.revenue += r.price;
    curr.units += 1;
    productRevenueMap.set(r.product, curr);
  });

  let topProductByRevenue = { name: '', revenue: 0, units: 0 };
  let topProductByUnits = { name: '', revenue: 0, units: 0 };

  productRevenueMap.forEach((val, name) => {
    if (val.revenue > topProductByRevenue.revenue) {
      topProductByRevenue = { name, revenue: val.revenue, units: val.units };
    }
    if (val.units > topProductByUnits.units) {
      topProductByUnits = { name, revenue: val.revenue, units: val.units };
    }
  });

  // Top payment method
  const paymentMap = new Map<string, { revenue: number; count: number }>();
  data.forEach((r) => {
    const curr = paymentMap.get(r.paymentMethod) || { revenue: 0, count: 0 };
    curr.revenue += r.price;
    curr.count += 1;
    paymentMap.set(r.paymentMethod, curr);
  });

  let topPaymentMethod = { name: '', revenue: 0, count: 0 };
  paymentMap.forEach((val, name) => {
    if (val.revenue > topPaymentMethod.revenue) {
      topPaymentMethod = { name, revenue: val.revenue, count: val.count };
    }
  });

  return {
    totalRevenue,
    totalUnits,
    uniqueOrdersCount,
    averageOrderValue,
    averageItemPrice,
    multiItemOrdersCount,
    topProductByRevenue,
    topProductByUnits,
    topPaymentMethod,
  };
}

export function computeTimeSeries(data: SaleRecord[]): TimeSeriesPoint[] {
  if (data.length === 0) return [];

  // Group by date
  const dateMap = new Map<string, { revenue: number; units: number; orders: Set<string> }>();

  data.forEach((r) => {
    const curr = dateMap.get(r.date) || { revenue: 0, units: 0, orders: new Set<string>() };
    curr.revenue += r.price;
    curr.units += 1;
    curr.orders.add(r.orderNumber);
    dateMap.set(r.date, curr);
  });

  const sortedDates = Array.from(dateMap.keys()).sort();
  let cumulative = 0;

  const points: TimeSeriesPoint[] = sortedDates.map((dateStr) => {
    const val = dateMap.get(dateStr)!;
    cumulative += val.revenue;

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      formattedDate,
      dayOfWeek,
      revenue: val.revenue,
      units: val.units,
      orders: val.orders.size,
      cumulativeRevenue: cumulative,
    };
  });

  // Calculate 7-day moving average for revenue
  for (let i = 0; i < points.length; i++) {
    const windowStart = Math.max(0, i - 6);
    const slice = points.slice(windowStart, i + 1);
    const avg = slice.reduce((sum, p) => sum + p.revenue, 0) / slice.length;
    points[i].movingAverage7d = Math.round(avg);
  }

  return points;
}

export function computeProductMetrics(data: SaleRecord[]): ProductMetric[] {
  const totalRevenue = data.reduce((sum, r) => sum + r.price, 0);

  const productMap = new Map<
    string,
    {
      unitPrice: number;
      unitsSold: number;
      totalRevenue: number;
      orders: Set<string>;
      paymentSplit: Record<string, number>;
    }
  >();

  data.forEach((r) => {
    const curr = productMap.get(r.product) || {
      unitPrice: r.price,
      unitsSold: 0,
      totalRevenue: 0,
      orders: new Set<string>(),
      paymentSplit: {},
    };
    curr.unitsSold += 1;
    curr.totalRevenue += r.price;
    curr.orders.add(r.orderNumber);
    curr.paymentSplit[r.paymentMethod] = (curr.paymentSplit[r.paymentMethod] || 0) + 1;
    productMap.set(r.product, curr);
  });

  const list: ProductMetric[] = [];
  productMap.forEach((val, product) => {
    const catInfo = PRODUCT_CATEGORIES[product] || {
      category: 'Other',
      color: '#64748b',
      tier: 'Mid-Range',
    };
    list.push({
      product,
      category: catInfo.category,
      tier: catInfo.tier,
      unitPrice: val.unitPrice,
      unitsSold: val.unitsSold,
      totalRevenue: val.totalRevenue,
      revenueShare: totalRevenue > 0 ? (val.totalRevenue / totalRevenue) * 100 : 0,
      orderCount: val.orders.size,
      paymentSplit: val.paymentSplit,
    });
  });

  // Sort descending by total revenue by default
  return list.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function computePaymentMetrics(data: SaleRecord[]): PaymentMetric[] {
  const totalRevenue = data.reduce((sum, r) => sum + r.price, 0);
  const totalTransactions = data.length;

  const methodMap = new Map<string, { revenue: number; count: number }>();
  data.forEach((r) => {
    const curr = methodMap.get(r.paymentMethod) || { revenue: 0, count: 0 };
    curr.revenue += r.price;
    curr.count += 1;
    methodMap.set(r.paymentMethod, curr);
  });

  const list: PaymentMetric[] = [];
  methodMap.forEach((val, method) => {
    list.push({
      method,
      revenue: val.revenue,
      transactions: val.count,
      revenueShare: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
      transactionShare: totalTransactions > 0 ? (val.count / totalTransactions) * 100 : 0,
      averageTicket: val.count > 0 ? Math.round(val.revenue / val.count) : 0,
    });
  });

  return list.sort((a, b) => b.revenue - a.revenue);
}

export function computeCategoryMetrics(data: SaleRecord[]): CategoryMetric[] {
  const totalRevenue = data.reduce((sum, r) => sum + r.price, 0);
  const catMap = new Map<string, { revenue: number; units: number; products: Set<string> }>();

  data.forEach((r) => {
    const cat = PRODUCT_CATEGORIES[r.product]?.category || 'Other';
    const curr = catMap.get(cat) || { revenue: 0, units: 0, products: new Set<string>() };
    curr.revenue += r.price;
    curr.units += 1;
    curr.products.add(r.product);
    catMap.set(cat, curr);
  });

  const list: CategoryMetric[] = [];
  catMap.forEach((val, category) => {
    list.push({
      category,
      revenue: val.revenue,
      units: val.units,
      share: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
      products: Array.from(val.products),
    });
  });

  return list.sort((a, b) => b.revenue - a.revenue);
}

export function computeDayOfWeekMetrics(data: SaleRecord[]): DayOfWeekMetric[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats = dayNames.map((day, idx) => ({
    day,
    order: (idx + 6) % 7, // Monday first (0), Sunday last (6)
    revenue: 0,
    units: 0,
    orders: new Set<string>(),
    uniqueDates: new Set<string>(),
  }));

  data.forEach((r) => {
    const [y, m, d] = r.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayIdx = dateObj.getDay();
    const stat = dayStats[dayIdx];
    stat.revenue += r.price;
    stat.units += 1;
    stat.orders.add(r.orderNumber);
    stat.uniqueDates.add(r.date);
  });

  return dayStats
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      day: s.day,
      order: s.order,
      revenue: s.revenue,
      units: s.units,
      orders: s.orders.size,
      averageRevenue: s.uniqueDates.size > 0 ? Math.round(s.revenue / s.uniqueDates.size) : 0,
    }));
}

export function computeBasketMetrics(data: SaleRecord[]): BasketMetric {
  const orderMap = new Map<string, SaleRecord[]>();
  data.forEach((r) => {
    const list = orderMap.get(r.orderNumber) || [];
    list.push(r);
    orderMap.set(r.orderNumber, list);
  });

  let singleItemOrders = 0;
  let multiItemOrders = 0;
  let maxBasketSize = 0;

  const sizeDist: Record<number, { count: number; revenue: number }> = {};
  const pairCounts = new Map<string, number>();

  const brackets = [
    { label: '< $80', min: 0, max: 79.99, count: 0, revenue: 0 },
    { label: '$80 - $99', min: 80, max: 99.99, count: 0, revenue: 0 },
    { label: '$100 - $149', min: 100, max: 149.99, count: 0, revenue: 0 },
    { label: '$150 - $199', min: 150, max: 199.99, count: 0, revenue: 0 },
    { label: '$200+', min: 200, max: Infinity, count: 0, revenue: 0 },
  ];

  orderMap.forEach((items) => {
    const count = items.length;
    const orderTotal = items.reduce((sum, it) => sum + it.price, 0);

    if (count > maxBasketSize) maxBasketSize = count;

    if (count === 1) singleItemOrders++;
    else multiItemOrders++;

    if (!sizeDist[count]) sizeDist[count] = { count: 0, revenue: 0 };
    sizeDist[count].count++;
    sizeDist[count].revenue += orderTotal;

    // Brackets
    for (const b of brackets) {
      if (orderTotal >= b.min && orderTotal <= b.max) {
        b.count++;
        b.revenue += orderTotal;
        break;
      }
    }

    // Co-purchased pairs if multi-item
    if (items.length > 1) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const names = [items[i].product, items[j].product].sort();
          const key = `${names[0]} + ${names[1]}`;
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    }
  });

  const basketSizeDistribution = Object.keys(sizeDist)
    .map(Number)
    .sort((a, b) => a - b)
    .map((sz) => ({
      size: `${sz} Item${sz > 1 ? 's' : ''}`,
      count: sizeDist[sz].count,
      revenue: sizeDist[sz].revenue,
    }));

  const coPurchasedPairs = Array.from(pairCounts.entries())
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count);

  const basketValueBrackets = brackets.map((b) => ({
    bracket: b.label,
    count: b.count,
    revenue: b.revenue,
  }));

  return {
    singleItemOrders,
    multiItemOrders,
    maxBasketSize,
    basketSizeDistribution,
    coPurchasedPairs,
    basketValueBrackets,
  };
}
