import React from 'react';
import { CreditCard, ShoppingBag, Layers, Percent, ArrowUpRight, DollarSign } from 'lucide-react';
import { PaymentMetric, BasketMetric } from '../data/analytics';
import { PAYMENT_METHOD_COLORS } from '../data/salesData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface PaymentBasketViewProps {
  paymentMetrics: PaymentMetric[];
  basketMetrics: BasketMetric[];
  basket: BasketMetric;
}

export const PaymentBasketView: React.FC<PaymentBasketViewProps> = ({
  paymentMetrics,
  basket,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Payment Methods Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMetrics.map((pm) => (
          <div key={pm.method} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{pm.method}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PAYMENT_METHOD_COLORS[pm.method] || '#64748b' }}
              />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              ${pm.revenue.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{pm.transactions} transactions</span>
              <span className="font-semibold text-slate-700">{pm.revenueShare.toFixed(1)}% share</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Avg Basket Ticket:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                ${pm.averageTicket}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Basket Size Analysis & Order Value Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Basket Size & Multi-Item Orders */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Basket Size & Multi-Item Orders</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Breakdown of single-item checkouts versus multi-item order bundles
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="text-xs text-slate-500 font-medium">Single-Item Checkouts</div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {basket.singleItemOrders}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {((basket.singleItemOrders / (basket.singleItemOrders + basket.multiItemOrders || 1)) * 100).toFixed(1)}% of total orders
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="text-xs text-blue-700 font-medium">Multi-Item Bundles</div>
              <div className="text-2xl font-bold text-blue-900 font-mono tabular-nums mt-1">
                {basket.multiItemOrders}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {((basket.multiItemOrders / (basket.singleItemOrders + basket.multiItemOrders || 1)) * 100).toFixed(1)}% cross-selling rate
              </div>
            </div>
          </div>

          {/* Co-Purchased Bundles list */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-800 mb-2">
              Frequent Co-Purchased Garments (Order Pairs)
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {basket.coPurchasedPairs.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">No co-purchased bundles found.</div>
              ) : (
                basket.coPurchasedPairs.slice(0, 7).map((pair) => (
                  <div key={pair.pair} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <span className="font-medium text-slate-800 truncate mr-2">{pair.pair}</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 shrink-0">
                      {pair.count} bundle{pair.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Order Value Histogram Brackets */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Order Value Distribution</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Frequency distribution of total checkout spend per order
            </div>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={basket.basketValueBrackets}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bracket" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded p-2.5 shadow">
                          <div className="font-semibold text-slate-200">{d.bracket}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-400">Orders:</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-400">
                              {d.count} orders
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-4">
                            <span className="text-slate-400">Total Spend:</span>
                            <span className="font-mono tabular-nums">
                              ${d.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-5 gap-2 text-center text-xs">
            {basket.basketValueBrackets.map((b) => (
              <div key={b.bracket} className="p-1">
                <div className="text-slate-400 text-[11px] font-medium">{b.bracket}</div>
                <div className="font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {b.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
