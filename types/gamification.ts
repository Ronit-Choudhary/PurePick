export interface UserProfile {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  weeklyPoints: number;
  scannedProducts: ScannedProduct[];
  coupons: Coupon[];
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  type: 'sustainability' | 'scanning' | 'weekly' | 'special';
}

export interface ScannedProduct {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  sustainabilityScore: number;
  pointsEarned: number;
  scannedAt: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  requiredLevel: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  level: number;
  rank: number;
}

export interface UPCItemResponse {
  code: string;
  total: number;
  offset: number;
  items: UPCItem[];
}

export interface UPCItem {
  ean: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  color: string;
  size: string;
  dimension: string;
  weight: string;
  category: string;
  currency: string;
  lowest_recorded_price: number;
  highest_recorded_price: number;
  images: string[];
  offers: any[];
}