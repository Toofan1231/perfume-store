export type Language = "en" | "fa" | "ps";
export type Role = "admin" | "customer";
export type Gender = "men" | "women" | "unisex";
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "not_required" | "pending" | "paid" | "failed";

export type LocalizedText = { en: string; fa: string; ps: string };
export type ProductSize = { label: string; price: number; stock: number };
export type PerfumeNotes = { top: string[]; heart: string[]; base: string[] };

export type Category = {
  id: string;
  name: LocalizedText;
  slug: string;
  image?: string;
  active: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: LocalizedText;
  brand: string;
  categoryId: string;
  description: LocalizedText;
  concentration: string;
  gender: Gender;
  scentFamily: string;
  sizes: ProductSize[];
  notes: PerfumeNotes;
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  displayName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type CartItem = { productId: string; sizeLabel: string; quantity: number };
export type ShippingAddress = { fullName: string; phone: string; city: string; address: string };
export type OrderLine = { productId: string; name: string; size: string; quantity: number; price: number; image?: string };

export type Order = {
  id: string;
  userId: string;
  items: OrderLine[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cash" | "card" | "manual";
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt?: string | null;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  addresses: ShippingAddress[];
  createdAt: string;
};

export type ShopSettings = {
  shopName: LocalizedText;
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  announcement: LocalizedText;
  footerText: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  currency: string;
  deliveryFee: number;
  contactPhone: string;
  contactEmail: string;
  contactAddress: LocalizedText;
  heroImage: string;
  brandTagline: LocalizedText;
};
