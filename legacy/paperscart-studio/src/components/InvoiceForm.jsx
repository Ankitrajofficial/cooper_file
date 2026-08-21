import React from 'react';
import { Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { getInvoiceTotals } from '../utils/invoiceMath';

const InvoiceForm = ({
  data,
  invoiceNumberState = { status: 'idle', message: '' },
  onChange,
  onGenerateInvoiceNumber,
  onItemChange,
  onAddItem,
  onRemoveItem,
  hideClientInfo = false,
  formMode = 'standard',
  businessSubMode = 'shop',
}) => {
  const isBusinessMode = formMode === 'business';
  const isDeliveryMode = businessSubMode === 'delivery';
  const {
    subtotal,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    total,
    discountType,
    paymentRequestType,
    paymentRequestValue,
    requestedPaymentAmount,
    balanceAfterRequestedPayment,
    paymentRequestLabel,
  } = getInvoiceTotals(data);
  const showsPaymentValue = paymentRequestType === 'advance_percent' || paymentRequestType === 'advance_amount';
  const sectionClass = 'rounded-lg border border-gray-200 bg-white p-3 space-y-3';
  const sectionTitleClass = 'text-sm font-black uppercase tracking-wide text-gray-700';
  const controlClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const paymentValueLabel = paymentRequestType === 'advance_percent' ? 'Advance percentage' : 'Advance amount';
  const paymentValueHelper = paymentRequestType === 'advance_percent'
    ? 'Percentage of the invoice total to request now.'
    : 'Fixed amount to request now.';

  return (
    <div className="invoice-compact-form bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg space-y-3">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Invoice Details</h2>

      {!isBusinessMode && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Transaction Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={data.status}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Unpaid">Unpaid (Invoice)</option>
                <option value="Paid">Paid (Receipt)</option>
              </select>
            </div>
            {data.status === 'Paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    name="paymentMethod"
                    value={data.paymentMethod}
                    onChange={onChange}
                    placeholder="e.g. UPI, Cash, Bank Transfer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={data.paymentDate}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!hideClientInfo && (
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>
            {isBusinessMode ? (isDeliveryMode ? 'Customer Details - Delivery' : 'Customer Details - Shop') : 'Client Information'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isBusinessMode ? 'Customer Name' : 'Client Name'}</label>
              <input
                type="text"
                name="clientName"
                value={data.clientName}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={isBusinessMode ? 'Enter customer name' : 'Enter client name'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="clientEmail"
                value={data.clientEmail || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                name="clientPhone"
                value={data.clientPhone || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91 98765 43210"
              />
            </div>
            {!isBusinessMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                <input
                  type="text"
                  name="clientAddress"
                  value={data.clientAddress}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter client address"
                />
              </div>
            )}
            {isBusinessMode && isDeliveryMode ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={data.shippingAddress || ''}
                  onChange={onChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Delivery address"
                />
              </div>
            ) : !isBusinessMode ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">State Operating Head</label>
            <input
              type="text"
              name="stateOperatingHead"
                value={data.stateOperatingHead ?? ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Person who closed this deal"
            />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Invoice Details */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Invoice Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="invoiceNumber"
                value={data.invoiceNumber || ''}
                onChange={onChange}
                placeholder="Generating..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={onGenerateInvoiceNumber}
                disabled={invoiceNumberState.status === 'loading'}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Generate a new invoice number for this issue date"
              >
                {invoiceNumberState.status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
              </button>
            </div>
            <p
              className={`mt-1 text-xs ${
                invoiceNumberState.status === 'error'
                  ? 'text-red-600'
                  : invoiceNumberState.status === 'warning'
                  ? 'text-amber-700'
                  : invoiceNumberState.status === 'saved'
                  ? 'text-emerald-700'
                  : 'text-gray-500'
              }`}
            >
              {invoiceNumberState.message || 'Generated from the issue date.'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              name="date"
              value={data.date}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={data.dueDate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Items</h3>
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 items-end border-b pb-2 md:border-b-0 md:pb-0">
              <div className="flex-grow">
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => onItemChange(index, 'description', e.target.value)}
                  placeholder="Item description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="w-full md:w-24">
                <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="Qty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="w-full md:w-32">
                 <label className="block text-xs font-medium text-gray-500 mb-1 md:hidden">Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => onItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="w-full md:w-32 pt-2 md:pt-0 text-right md:text-left font-semibold text-gray-700">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
              <button
                onClick={() => onRemoveItem(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                title="Remove Item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onAddItem}
          className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      {!isBusinessMode && (
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Discount and GST</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              name="discountLabel"
              value={data.discountLabel ?? ''}
              onChange={onChange}
              placeholder="Discount"
              className={controlClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="discountType"
              value={data.discountType || 'amount'}
              onChange={onChange}
              className={controlClass}
            >
              <option value="amount">Fixed amount (₹)</option>
              <option value="percent">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value {discountType === 'percent' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              name="discountValue"
              min="0"
              step="0.01"
              value={data.discountValue ?? 0}
              onChange={onChange}
              placeholder="0"
              className={controlClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
            <input
              type="number"
              name="gstRate"
              min="0"
              max="100"
              step="0.01"
              value={data.gstRate ?? 0}
              onChange={onChange}
              placeholder="0"
              className={controlClass}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 text-gray-600">
            <span className="min-w-0">Subtotal</span>
            <span className="font-medium text-gray-900 tabular-nums">₹{subtotal.toFixed(2)}</span>
            <span className="min-w-0 truncate">{data.discountLabel || 'Discount'}</span>
            <span className="font-medium text-emerald-600 tabular-nums">-₹{discountAmount.toFixed(2)}</span>
            {(gstRate > 0 || gstAmount > 0) && (
              <>
                <span className="min-w-0">Taxable amount</span>
                <span className="font-medium text-gray-900 tabular-nums">₹{taxableAmount.toFixed(2)}</span>
                <span className="min-w-0 truncate">GST ({gstRate.toFixed(2)}%)</span>
                <span className="font-medium text-gray-900 tabular-nums">₹{gstAmount.toFixed(2)}</span>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
            <span className="font-semibold text-gray-900">Net Total</span>
            <span className="font-bold text-gray-900 tabular-nums">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      )}

      {!isBusinessMode && (
        <div className="grid gap-3 grid-cols-1">
      <div className={`${sectionClass} min-h-full`}>
        <div>
          <h3 className={sectionTitleClass}>Payment Request</h3>
          <p className="mt-1 text-xs font-medium text-gray-500">Controls the amount shown in the invoice QR panel.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">QR / Pay Now Mode</label>
            <select
              name="paymentRequestType"
              value={paymentRequestType}
              onChange={onChange}
              className={`${controlClass} min-w-0`}
            >
              <option value="advance_percent">Ask for a percentage upfront</option>
              <option value="advance_amount">Ask for a fixed amount upfront</option>
              <option value="full">Ask for the full amount now</option>
              <option value="verification">Show QR only (no amount)</option>
            </select>
          </div>
          {showsPaymentValue && (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,140px)] items-end gap-3 rounded-lg border border-gray-200 bg-slate-50 p-2.5">
              <div className="min-w-0">
                <label className="block text-sm font-bold text-gray-800">{paymentValueLabel}</label>
                <p className="mt-0.5 text-xs leading-5 text-gray-500">{paymentValueHelper}</p>
              </div>
              <div className="flex items-stretch overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
                {paymentRequestType === 'advance_amount' && (
                  <span className="flex items-center bg-gray-100 px-2.5 text-sm font-semibold text-gray-500">₹</span>
                )}
                <input
                  type="number"
                  name="paymentRequestValue"
                  min="0"
                  max={paymentRequestType === 'advance_percent' ? '100' : undefined}
                  step="0.01"
                  value={paymentRequestValue}
                  onChange={onChange}
                  placeholder={paymentRequestType === 'advance_percent' ? '50' : '0'}
                  className="w-full min-w-0 border-0 bg-transparent px-3 py-2 text-right text-sm font-semibold tabular-nums text-gray-900 focus:outline-none focus:ring-0"
                />
                {paymentRequestType === 'advance_percent' && (
                  <span className="flex items-center bg-gray-100 px-2.5 text-sm font-semibold text-gray-500">%</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white">
          <div className="grid gap-px bg-emerald-100 sm:grid-cols-2">
            <div className="bg-emerald-500 px-3 py-3 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-50/90">Customer pays now</p>
              <p className="mt-1 break-words text-xl font-black leading-tight tabular-nums">₹{requestedPaymentAmount.toFixed(2)}</p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-emerald-50/80">{paymentRequestLabel}</p>
            </div>
            <div className="bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Remaining balance</p>
              <p className="mt-1 break-words text-xl font-bold leading-tight text-gray-900 tabular-nums">₹{balanceAfterRequestedPayment.toFixed(2)}</p>
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">Due after this payment</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 border-t border-emerald-100 bg-emerald-50/60 px-3 py-2">
            <svg className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] leading-5 text-emerald-800">
              The invoice QR uses this requested amount when a UPI ID is saved.
            </p>
          </div>
        </div>
      </div>

      <div className={`${sectionClass} min-h-full`}>
        <div>
          <h3 className={sectionTitleClass}>Footer Message</h3>
          <p className="mt-1 text-xs font-medium text-gray-500">Shown at the bottom of the PDF.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Thank-you Note</label>
            <input
              type="text"
              name="footerNote"
              value={data.footerNote ?? ''}
              onChange={onChange}
              placeholder="Thank you for your business!"
              className={controlClass}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Payment Terms Line</label>
            <input
              type="text"
              name="paymentTermsNote"
              value={data.paymentTermsNote ?? ''}
              onChange={onChange}
              placeholder="Payment is due within 15 days."
              className={controlClass}
            />
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
