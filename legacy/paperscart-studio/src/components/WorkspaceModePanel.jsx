import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Clock,
  FileSignature,
  FileText,
  ImagePlus,
  Leaf,
  Mail,
  MessageCircle,
  Package,
  Pencil,
  Percent,
  Plus,
  ReceiptText,
  Send,
  ShoppingBag,
  Store,
  Truck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getSelectableWorkspaceModeOptions } from '../utils/companyProfile';
import { getInvoiceTotals } from '../utils/invoiceMath';

const selectableWorkspaceModeOptions = getSelectableWorkspaceModeOptions();

const emptyClient = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  projectName: '',
  scope: '',
  deliverables: '',
  paymentTerms: '',
  notes: '',
};

const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  imageDataUrl: '',
  price: '',
  stockQuantity: '0',
  unit: 'pieces',
};

const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  shippingAddress: '',
};

function formatCurrency(value) {
  const number = Number(value) || 0;
  return `₹${number.toFixed(2)}`;
}

function ModeIcon({ id }) {
  if (id === 'business') return <Store size={16} />;
  if (id === 'agency') return <Clock size={16} />;
  return <Briefcase size={16} />;
}

function Field({ label, value, onChange, placeholder, type = 'text', rows, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {rows ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      )}
    </label>
  );
}

function CompactPanel({ title, description, icon: Icon, action, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-950">{title}</h3>
              {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
            </div>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function WorkspaceModePanel({
  mode,
  onModeChange,
  isAccountModeLocked = false,
  clients = [],
  activeClientId = '',
  onSaveClient,
  onUpdateClient,
  onUseClient,
  onRemoveClient,
  products = [],
  activeProductId = '',
  invoice,
  businessSubMode = 'shop',
  onBusinessSubModeChange,
  onSaveProduct,
  onRemoveProduct,
  onAddProductToInvoice,
  onUpdateProductInventory,
  onInvoiceChange,
  onUseBusinessCustomer,
  onPrepareEmail,
  onSendWhatsApp,
}) {
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [clientDraft, setClientDraft] = useState(emptyClient);
  const [productDraft, setProductDraft] = useState(emptyProduct);
  const [customerDraft, setCustomerDraft] = useState(emptyCustomer);
  const [addedNotice, setAddedNotice] = useState('');
  const [editingInventoryId, setEditingInventoryId] = useState('');
  const [inventoryDraft, setInventoryDraft] = useState('');
  const [editingClientId, setEditingClientId] = useState('');
  const [clientNotice, setClientNotice] = useState('');

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId),
    [activeClientId, clients]
  );
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId),
    [activeProductId, products]
  );
  const isDeliveryMode = businessSubMode === 'delivery';
  const totals = getInvoiceTotals(invoice || {});

  const updateClientDraft = (key, value) => setClientDraft((prev) => ({ ...prev, [key]: value }));
  const updateProductDraft = (key, value) => setProductDraft((prev) => ({ ...prev, [key]: value }));
  const confirmDashboardRemoval = (message) => {
    if (typeof window === 'undefined') return true;
    return window.confirm(message);
  };

  const closeClientForm = () => {
    setIsClientFormOpen(false);
    setEditingClientId('');
    setClientDraft(emptyClient);
  };

  const handleToggleClientForm = () => {
    if (isClientFormOpen) {
      closeClientForm();
      return;
    }
    setEditingClientId('');
    setClientDraft(emptyClient);
    setIsClientFormOpen(true);
  };

  const showClientNotice = (message) => {
    setClientNotice(message);
    window.setTimeout(() => setClientNotice(''), 2600);
  };

  const handleSaveClient = () => {
    const name = clientDraft.name.trim();
    if (!name) return;
    if (editingClientId) {
      onUpdateClient?.(editingClientId, clientDraft);
      showClientNotice(`${name} updated and applied to your documents.`);
    } else {
      onSaveClient(clientDraft);
      showClientNotice(`${name} saved. It is now filled into your documents.`);
    }
    closeClientForm();
  };

  // Opens the form pre-filled. Without this the edit path was unreachable:
  // editingClientId could only ever be cleared, never set.
  const handleEditClient = (client) => {
    setEditingClientId(client.id);
    setClientDraft({ ...emptyClient, ...client });
    setIsClientFormOpen(true);
  };

  const handleUseClient = (client) => {
    onUseClient?.(client);
    showClientNotice(`Now using ${client.name || 'this client'} on your documents.`);
  };

  const handleSaveProduct = () => {
    if (!productDraft.name.trim()) return;
    onSaveProduct({
      ...productDraft,
      price: Number(productDraft.price) || 0,
      stockQuantity: Math.max(0, Math.floor(Number(productDraft.stockQuantity) || 0)),
    });
    setProductDraft(emptyProduct);
    setIsProductFormOpen(false);
  };

  const handleAddProductToInvoice = (product) => {
    const didAdd = onAddProductToInvoice(product);
    if (didAdd === false) return;

    setAddedNotice(`${product.name || 'Product'} added`);
    window.setTimeout(() => setAddedNotice(''), 1800);
  };

  const handleStartInventoryEdit = (product) => {
    setEditingInventoryId(product.id);
    setInventoryDraft(String(Math.max(0, Math.floor(Number(product.stockQuantity) || 0))));
  };

  const handleSaveInventory = (product) => {
    const nextStockQuantity = Math.max(0, Math.floor(Number(inventoryDraft) || 0));
    onUpdateProductInventory?.(product.id, nextStockQuantity);
    setEditingInventoryId('');
    setInventoryDraft('');
    setAddedNotice(`${product.name || 'Product'} inventory set to ${nextStockQuantity}`);
    window.setTimeout(() => setAddedNotice(''), 1800);
  };

  const handleCustomerDraftChange = (key, value) => {
    const nextDraft = { ...customerDraft, [key]: value };
    setCustomerDraft(nextDraft);
    onUseBusinessCustomer?.(nextDraft);
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please upload an image file for the product.');
      return;
    }

    if (file.size > 700 * 1024) {
      window.alert('Please choose a product image below 700 KB so it can sync reliably.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProductDraft('imageDataUrl', typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProductImage = () => {
    if (!confirmDashboardRemoval('Remove this product image from the dashboard?')) return;
    updateProductDraft('imageDataUrl', '');
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">
                <Leaf size={14} />
                Paperless workflow
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {mode === 'business'
                  ? 'Product cards + customer billing'
                  : 'Client onboarding + reusable templates'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAccountModeLocked ? null : (
              selectableWorkspaceModeOptions.map((option) => {
                const selected = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => !option.comingSoon && onModeChange(option.id)}
                    disabled={option.comingSoon}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition-colors ${
                      selected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : option.comingSoon
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                    title={option.description}
                  >
                    <ModeIcon id={option.id} />
                    {option.label.replace(' mode', '')}
                    {option.comingSoon && <span className="text-xs font-bold">soon</span>}
                  </button>
                );
              })
            )}
            {mode === 'business' && (
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => onBusinessSubModeChange?.('shop')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-black transition-colors ${
                    !isDeliveryMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <Store size={15} />
                  Shop mode
                </button>
                <button
                  type="button"
                  onClick={() => onBusinessSubModeChange?.('delivery')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-black transition-colors ${
                    isDeliveryMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <Truck size={15} />
                  Delivery mode
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === 'freelance' && (
        <div className="grid gap-4 p-4 sm:p-5">
          <CompactPanel
            title="Clients"
            description={activeClient ? `Active: ${activeClient.name}` : 'Onboard once, reuse everywhere.'}
            icon={Users}
            action={
              <button
                type="button"
                onClick={handleToggleClientForm}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                {isClientFormOpen ? <X size={16} /> : <UserPlus size={16} />}
                {isClientFormOpen ? 'Close' : 'Onboard'}
              </button>
            }
          >
            {clientNotice && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                {clientNotice}
              </div>
            )}

            {isClientFormOpen ? (
              <div className="space-y-3">
                {editingClientId && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                    Editing saved client. Saving will update the card and use it on the current documents.
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Client / Company" value={clientDraft.name} onChange={(value) => updateClientDraft('name', value)} placeholder="Client business name" />
                  <Field label="Contact person" value={clientDraft.contactName} onChange={(value) => updateClientDraft('contactName', value)} placeholder="Decision maker" />
                  <Field label="Email" type="email" value={clientDraft.email} onChange={(value) => updateClientDraft('email', value)} placeholder="client@example.com" />
                  <Field label="Phone" value={clientDraft.phone} onChange={(value) => updateClientDraft('phone', value)} placeholder="+91 98765 43210" />
                  <Field label="Address" value={clientDraft.address} onChange={(value) => updateClientDraft('address', value)} placeholder="Billing address" className="sm:col-span-2" rows={2} />
                </div>
                <button
                  type="button"
                  onClick={handleSaveClient}
                  disabled={!clientDraft.name.trim()}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingClientId ? 'Update and use client' : 'Save and use client'}
                </button>
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Click <span className="font-bold text-slate-800">Onboard</span> to create a reusable client card for invoices, agreements, and scope of work.
              </div>
            ) : null}

            {/* Saved clients. Without this list a saved client left no trace on
                screen — the documents filled in silently, so onboarding read as
                a no-op. */}
            {clients.length > 0 && (
              <div className={`grid gap-2 ${isClientFormOpen ? 'mt-3 border-t border-slate-200 pt-3' : ''}`}>
                {clients.map((client) => {
                  const isActive = client.id === activeClientId;
                  const meta = [client.contactName, client.email, client.phone].filter(Boolean).join(' · ');
                  return (
                    <article
                      key={client.id}
                      className={`rounded-lg border p-3 ${
                        isActive ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="min-w-0 break-words text-sm font-black text-slate-950">{client.name}</h4>
                          {isActive && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                              In use
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 break-words text-xs text-slate-500">{meta || 'No contact details yet'}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleUseClient(client)}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-emerald-700"
                          >
                            <Send size={14} />
                            {/* Short label on phones so Use / Edit / delete stay on one row. */}
                            <span className="sm:hidden">Use</span>
                            <span className="hidden sm:inline">Use on documents</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditClient(client)}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveClient?.(client.id)}
                          className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-red-100 text-red-600 transition-colors hover:bg-red-50"
                          title={`Remove ${client.name}`}
                          aria-label={`Remove ${client.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CompactPanel>
        </div>
      )}

      {mode === 'business' && (
        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
          <div className="space-y-4">
            <CompactPanel
              title="Customer"
              description={isDeliveryMode ? 'Online delivery: customer plus shipping address.' : 'Counter billing: customer details, then select products.'}
              icon={ShoppingBag}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={customerDraft.name} onChange={(value) => handleCustomerDraftChange('name', value)} placeholder="Customer name" />
                <Field label="Phone / WhatsApp" value={customerDraft.phone} onChange={(value) => handleCustomerDraftChange('phone', value)} placeholder="+91 98765 43210" />
                <Field label="Email" type="email" value={customerDraft.email} onChange={(value) => handleCustomerDraftChange('email', value)} placeholder="customer@example.com" />
                {isDeliveryMode && (
                  <Field label="Shipping address" value={customerDraft.shippingAddress} onChange={(value) => handleCustomerDraftChange('shippingAddress', value)} placeholder="Delivery address" className="sm:col-span-2" rows={2} />
                )}
              </div>
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                Invoice preview updates automatically. Select products from the catalog on the right.
              </p>
            </CompactPanel>

            <CompactPanel
              title="Bill summary"
              description="Total updates automatically when products or discount change."
              icon={ReceiptText}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_120px]">
                  <Field
                    label="Discount label"
                    value={invoice?.discountLabel || 'Discount'}
                    onChange={(value) => onInvoiceChange?.({ discountLabel: value })}
                    placeholder="Discount"
                  />
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-slate-600">Discount type</span>
                    <select
                      value={invoice?.discountType || 'amount'}
                      onChange={(event) => onInvoiceChange?.({ discountType: event.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="amount">Amount ₹</option>
                      <option value="percent">Percent %</option>
                    </select>
                  </label>
                  <Field
                    label={invoice?.discountType === 'percent' ? 'Value %' : 'Value ₹'}
                    type="number"
                    value={String(invoice?.discountValue ?? 0)}
                    onChange={(value) => onInvoiceChange?.({ discountValue: Math.max(0, Number(value) || 0) })}
                    placeholder="0"
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Percent size={14} />
                      {totals.discountLabel}
                    </span>
                    <span className="font-bold text-emerald-700">-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="font-black text-slate-950">Total</span>
                    <span className="text-lg font-black text-slate-950">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSendWhatsApp?.(customerDraft)}
                    disabled={!customerDraft.phone.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle size={16} />
                    WhatsApp bill
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrepareEmail(customerDraft)}
                    disabled={!customerDraft.email.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Mail size={16} />
                    Email bill
                  </button>
                </div>
              </div>
            </CompactPanel>
          </div>

          <div className="space-y-4">
            <CompactPanel
              title="Product catalog"
              description={activeProduct ? `Last added: ${activeProduct.name}` : `${products.length} saved products`}
              icon={Package}
              action={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{products.length} saved</span>}
            >
              {addedNotice && (
                <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                  {addedNotice}
                </div>
              )}
              {products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No products yet. Click <span className="font-bold text-slate-700">New</span> to create your first product card.
                </div>
              ) : (
                <div className="grid gap-2">
                  {products.map((product) => (
                    (() => {
                      const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity) || 0));
                      const isOutOfStock = stockQuantity <= 0;
                      return (
                    <article
                      key={product.id}
                      className={`grid gap-3 rounded-lg border p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                        product.id === activeProductId ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {product.imageDataUrl ? (
                          <img src={product.imageDataUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h4 className="truncate text-sm font-black text-slate-950">{product.name}</h4>
                          <span className="text-sm font-black text-emerald-700">{formatCurrency(product.price)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-black ${
                              isOutOfStock ? 'bg-red-50 text-red-700' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {stockQuantity} available
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {[product.sku, product.unit, product.description].filter(Boolean).join(' | ') || 'Product card'}
                        </p>
                        <div className="mt-2">
                          {editingInventoryId === product.id ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={inventoryDraft}
                                onChange={(event) => setInventoryDraft(event.target.value)}
                                className="h-9 w-24 rounded-lg border border-slate-300 px-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                aria-label={`Set inventory for ${product.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInventory(product)}
                                className="h-9 rounded-lg bg-slate-950 px-3 text-xs font-black text-white transition-colors hover:bg-slate-800"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingInventoryId('');
                                  setInventoryDraft('');
                                }}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartInventoryEdit(product)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-black text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                            >
                              Set inventory
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddProductToInvoice(product)}
                          disabled={isOutOfStock}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none"
                        >
                          <Send size={15} />
                          {isOutOfStock ? 'Out' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveProduct(product.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-600 transition-colors hover:bg-red-50"
                          title="Remove product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                      );
                    })()
                  ))}
                </div>
              )}
            </CompactPanel>

            <CompactPanel
              title="Product card"
              description={isProductFormOpen ? 'Create a reusable product.' : 'Keep the form hidden until needed.'}
              icon={Package}
              action={
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {isProductFormOpen ? <X size={16} /> : <Plus size={16} />}
                  {isProductFormOpen ? 'Close' : 'New'}
                </button>
              }
            >
              {isProductFormOpen ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {productDraft.imageDataUrl ? (
                          <img src={productDraft.imageDataUrl} alt="Product preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlus size={22} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Product image</p>
                        <p className="text-xs text-slate-500">Shown in product cards and invoice templates.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                        <ImagePlus size={15} />
                        Upload
                        <input type="file" accept="image/*" onChange={handleProductImageChange} className="hidden" />
                      </label>
                      {productDraft.imageDataUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveProductImage}
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" value={productDraft.name} onChange={(value) => updateProductDraft('name', value)} placeholder="Cotton shirt, phone case..." />
                    <Field label="Price" type="number" value={productDraft.price} onChange={(value) => updateProductDraft('price', value)} placeholder="999" />
                    <Field label="SKU / Code" value={productDraft.sku} onChange={(value) => updateProductDraft('sku', value)} placeholder="Optional" />
                    <Field label="Available stock" type="number" value={productDraft.stockQuantity} onChange={(value) => updateProductDraft('stockQuantity', value)} placeholder="20" />
                    <Field label="Unit / measure" value={productDraft.unit} onChange={(value) => updateProductDraft('unit', value)} placeholder="pieces, hour, kg" />
                    <Field label="Description" value={productDraft.description} onChange={(value) => updateProductDraft('description', value)} placeholder="Internal product details" className="sm:col-span-2" rows={2} />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    disabled={!productDraft.name.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Save product
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(true)}
                  className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Add a product only when you need a new catalog item.
                </button>
              )}
            </CompactPanel>
          </div>
        </div>
      )}
    </section>
  );
}
