import React from 'react';
import { LayoutDashboard, BarChart2, ShoppingBag, CreditCard, Table2, Download, RotateCcw } from 'lucide-react';

export type ActiveTab = 'overview' | 'visualizer' | 'products' | 'payments' | 'ledger';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onExportCsv: () => void;
  onResetData: () => void;
  isCustomData: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onExportCsv,
  onResetData,
  isCustomData,
  totalRecords,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'visualizer', label: 'Multi-View Studio', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'products', label: 'Product Matrix', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments & Basket', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'ledger', label: 'Data Ledger', icon: <Table2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              TT
            </div>
            <div className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TailorTrack Intelligence
            </div>
          </div>

          {/* Zone 2: Concise navigation links with hover states */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action zone */}
          <div className="flex items-center gap-2 shrink-0">
            {isCustomData && (
              <button
                onClick={onResetData}
                title="Reset to default provided sales data"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Data</span>
              </button>
            )}
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-500'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
