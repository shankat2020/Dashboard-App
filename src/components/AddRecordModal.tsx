import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { SaleRecord, PRODUCT_CATEGORIES } from '../data/salesData';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: Omit<SaleRecord, 'id'>) => void;
  availableProducts: string[];
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  availableProducts,
}) => {
  const [orderNumber, setOrderNumber] = useState('TT-1099');
  const [product, setProduct] = useState(availableProducts[0] || 'Slim-Fit Denim Jeans');
  const [price, setPrice] = useState('88.00');
  const [date, setDate] = useState('2025-10-08');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!orderNumber.trim() || !product.trim() || isNaN(parsedPrice) || parsedPrice <= 0 || !date) {
      return;
    }

    onAddRecord({
      orderNumber: orderNumber.trim(),
      product,
      price: parsedPrice,
      date,
      paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Add Sales Record</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Order Number</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="e.g. TT-1099"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product</label>
            <select
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                // Auto-fill price if standard
                if (e.target.value === 'Slim-Fit Denim Jeans') setPrice('88.00');
                else if (e.target.value === 'Premium Tailored Trousers') setPrice('175.00');
                else if (e.target.value === 'Tailored Wool Dress Trousers') setPrice('145.00');
                else if (e.target.value === 'Classic Denim Overalls') setPrice('115.00');
                else if (e.target.value === 'Flannel-Lined Canvas Work Pants') setPrice('98.00');
                else if (e.target.value === 'Striped Seersucker Trousers') setPrice('95.00');
                else if (e.target.value === 'Drawstring Linen Trousers') setPrice('92.00');
                else if (e.target.value === 'Relaxed Fit Corduroy Trousers') setPrice('85.00');
                else if (e.target.value === 'Double-Pleated Khaki Trousers') setPrice('82.00');
                else if (e.target.value === 'Classic Fit Chinos') setPrice('78.00');
                else if (e.target.value === 'Technical Performance Joggers') setPrice('75.00');
                else if (e.target.value === 'Multi-Pocket Cargo Shorts') setPrice('58.00');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {availableProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="eWallet">eWallet</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
