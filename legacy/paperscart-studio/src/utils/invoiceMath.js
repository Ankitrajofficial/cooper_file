function toNonNegativeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

export function getInvoiceTotals(invoice) {
  const items = Array.isArray(invoice?.items) ? invoice.items : [];
  const subtotal = items.reduce((sum, item) => {
    const quantity = toNonNegativeNumber(item?.quantity);
    const price = toNonNegativeNumber(item?.price);
    return sum + quantity * price;
  }, 0);

  const discountType = invoice?.discountType === 'percent' ? 'percent' : 'amount';
  const discountValue = toNonNegativeNumber(invoice?.discountValue);
  const rawDiscount =
    discountType === 'percent'
      ? (subtotal * discountValue) / 100
      : discountValue;
  const discountAmount = Math.min(subtotal, rawDiscount);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = Math.min(100, toNonNegativeNumber(invoice?.gstRate));
  const gstAmount = (taxableAmount * gstRate) / 100;
  const total = Math.max(0, taxableAmount + gstAmount);
  const discountLabel =
    typeof invoice?.discountLabel === 'string' && invoice.discountLabel.trim()
      ? invoice.discountLabel.trim()
      : 'Discount';
  const paymentRequestType = ['full', 'advance_percent', 'advance_amount', 'verification'].includes(
    invoice?.paymentRequestType
  )
    ? invoice.paymentRequestType
    : 'advance_percent';
  const hasPaymentRequestValue = invoice?.paymentRequestValue !== undefined && invoice?.paymentRequestValue !== null;
  const rawPaymentRequestValue = hasPaymentRequestValue ? toNonNegativeNumber(invoice?.paymentRequestValue) : 50;
  const paymentRequestValue =
    paymentRequestType === 'advance_percent'
      ? Math.min(100, rawPaymentRequestValue)
      : rawPaymentRequestValue;

  let requestedPaymentAmount = total;
  if (paymentRequestType === 'advance_percent') {
    requestedPaymentAmount = (total * paymentRequestValue) / 100;
  } else if (paymentRequestType === 'advance_amount') {
    requestedPaymentAmount = paymentRequestValue;
  } else if (paymentRequestType === 'verification') {
    requestedPaymentAmount = 0;
  }

  requestedPaymentAmount = Math.min(total, Math.max(0, requestedPaymentAmount));
  const balanceAfterRequestedPayment = Math.max(0, total - requestedPaymentAmount);
  const paymentRequestLabel =
    paymentRequestType === 'full'
      ? 'Pay now'
      : paymentRequestType === 'advance_amount'
      ? 'Advance payment'
      : paymentRequestType === 'verification'
      ? 'No payment requested'
      : `Advance payment (${paymentRequestValue.toFixed(2)}%)`;

  return {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    total,
    discountLabel,
    paymentRequestType,
    paymentRequestValue,
    requestedPaymentAmount,
    balanceAfterRequestedPayment,
    paymentRequestLabel,
  };
}
