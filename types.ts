

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  category: string;
  imageUrl: string;
  barcode: string;
  brand: string;
  ecologicalScore: number;
  nutritionalScore: number | null;
}

export interface Category {
  name: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
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