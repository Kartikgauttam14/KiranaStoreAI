export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parsePrice(priceString: string): number {
  return parseFloat(priceString.replace(/,/g, ''));
}
