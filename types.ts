
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Optional original price for showing discounts
  weight: string;
  category: string;
  imageUrl: string;
  barcode: string;
  brand: string;
  ecologicalScore: number;
  nutritionalScore: number | null;
}

export interface Category {
  name:string;
  imageUrl: string;
}

export interface Banner {
  name:string;
  imageUrl: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  products: Product[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  nickname: string;
  fullAddress: string;
  details: string; // e.g., flat number, landmark
  lat?: number;
  lng?: number;
}

export interface User {
  name: string;
  email: string;
  walletBalance: number;
  addresses: Address[];
  selectedAddressId: string | null;
  phone?: string;
  gender?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number; // Final amount paid by user
  subtotal: number; // Cart total before discounts and fees
  deliveryFee: number;
  rewardPointsEarned: number;
  rewardPointsRedeemed: number;
  storeName: string; // To track which store the order was from
  deliveryAddress: Address; // To record where the order was delivered
}

// Type for AI-generated product details and ecological score
export interface ScannedProductDetails {
  productName: string;
  brand: string;
  ingredients: string;
  isFoodProduct: boolean;
  category: string;
  ecologicalScore: number;
  ecologicalJustification: string;
  nutritionalScore: number | null;
  nutritionalJustification: string | null;
  recommendations: Product[];
}
