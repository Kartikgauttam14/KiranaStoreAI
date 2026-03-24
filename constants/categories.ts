export const PRODUCT_CATEGORIES = [
  { id: 'grains', label: 'Grains & Pulses', labelHi: 'अनाज और दाल', icon: '🌾' },
  { id: 'dairy', label: 'Dairy', labelHi: 'डेयरी', icon: '🥛' },
  { id: 'beverages', label: 'Beverages', labelHi: 'पेय पदार्थ', icon: '🧃' },
  { id: 'snacks', label: 'Snacks', labelHi: 'स्नैक्स', icon: '🍿' },
  { id: 'spices', label: 'Spices & Masala', labelHi: 'मसाले', icon: '🌶️' },
  { id: 'oil', label: 'Oils & Ghee', labelHi: 'तेल और घी', icon: '🫙' },
  { id: 'personal', label: 'Personal Care', labelHi: 'व्यक्तिगत देखभाल', icon: '🧴' },
  { id: 'household', label: 'Household', labelHi: 'घरेलू सामान', icon: '🧹' },
  { id: 'frozen', label: 'Frozen Foods', labelHi: 'फ्रोज़न फ़ूड', icon: '❄️' },
  { id: 'bakery', label: 'Bakery', labelHi: 'बेकरी', icon: '🍞' },
  { id: 'tobacco', label: 'Tobacco & Pan', labelHi: 'तम्बाकू', icon: '🚬' },
  { id: 'other', label: 'Other', labelHi: 'अन्य', icon: '📦' },
];

export const UNITS = [
  { id: 'kg', label: 'Kilogram', short: 'kg' },
  { id: 'litre', label: 'Litre', short: 'L' },
  { id: 'piece', label: 'Piece', short: 'pc' },
  { id: 'gram', label: 'Gram', short: 'g' },
  { id: 'ml', label: 'Millilitre', short: 'ml' },
  { id: 'dozen', label: 'Dozen', short: 'dz' },
  { id: 'pack', label: 'Pack', short: 'pack' },
];

export const GST_RATES = [0, 5, 12, 18];

export const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
  { id: 'CARD', label: 'Card', icon: '💳' },
  { id: 'CREDIT', label: 'Credit (Khata)', icon: '📖' },
];

export const ORDER_STATUSES = [
  { id: 'PLACED', label: 'Placed', color: '#FFA500' },
  { id: 'CONFIRMED', label: 'Confirmed', color: '#1A73E8' },
  { id: 'PACKED', label: 'Packed', color: '#9C27B0' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#FF5722' },
  { id: 'DELIVERED', label: 'Delivered', color: '#34A853' },
  { id: 'CANCELLED', label: 'Cancelled', color: '#757575' },
];
