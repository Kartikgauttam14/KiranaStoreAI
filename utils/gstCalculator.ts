export interface GSTBreakdown {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  totalWithGST: number;
}

export function calculateGST(
  sellingPrice: number,
  gstRate: number,
  isInterState = false
): GSTBreakdown {
  const taxableAmount = sellingPrice / (1 + gstRate / 100);
  const totalGST = sellingPrice - taxableAmount;

  return {
    taxableAmount: +taxableAmount.toFixed(2),
    cgst: isInterState ? 0 : +(totalGST / 2).toFixed(2),
    sgst: isInterState ? 0 : +(totalGST / 2).toFixed(2),
    igst: isInterState ? +totalGST.toFixed(2) : 0,
    totalGST: +totalGST.toFixed(2),
    totalWithGST: +sellingPrice.toFixed(2),
  };
}

export function aggregateBillGST(
  items: Array<{ sellingPrice: number; quantity: number; gstRate: number }>
) {
  const slabs: Record<number, { taxable: number; gst: number }> = {};
  items.forEach((item) => {
    const line = item.sellingPrice * item.quantity;
    const breakdown = calculateGST(line, item.gstRate);
    if (!slabs[item.gstRate]) slabs[item.gstRate] = { taxable: 0, gst: 0 };
    slabs[item.gstRate].taxable += breakdown.taxableAmount;
    slabs[item.gstRate].gst += breakdown.totalGST;
  });
  return slabs;
}
