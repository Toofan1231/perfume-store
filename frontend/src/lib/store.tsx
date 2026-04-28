"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoCategories, demoProducts, demoReviews, demoSettings, demoUsers } from "@/data/demo";
import { dictionaries, languageMeta, pickText } from "@/lib/i18n";
import { safeId } from "@/lib/helpers";
import type { CartItem, Category, Language, Order, OrderStatus, Product, Review, Role, ShippingAddress, ShopSettings, UserProfile } from "@/types";

type StoredUser = UserProfile & { password?: string };

type Persisted = {
  language: Language;
  settings: ShopSettings;
  categories: Category[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  users: StoredUser[];
  cart: CartItem[];
  currentUser: UserProfile | null;
};

type AppContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  text: (value: unknown) => string;
  money: (value: number) => string;

  settings: ShopSettings;
  saveSettings: (settings: ShopSettings) => void;
  resetDemoData: () => void;

  categories: Category[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  users: UserProfile[];
  cart: CartItem[];
  currentUser: UserProfile | null;
  cartCount: number;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => void;
  loginDemoAdmin: () => void;
  loginDemoCustomer: () => void;

  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
  getReviews: (productId: string) => Review[];

  addToCart: (productId: string, sizeLabel: string) => void;
  updateCartQuantity: (productId: string, sizeLabel: string, quantity: number) => void;
  removeFromCart: (productId: string, sizeLabel: string) => void;
  clearCart: () => void;
  placeOrder: (input: { shippingAddress: ShippingAddress; paymentMethod: "cash" | "card" | "manual" }) => Order;

  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  saveReview: (review: Review) => void;
  deleteReview: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateUserRole: (uid: string, role: Role) => void;
  deleteUser: (uid: string) => void;
  saveAddress: (address: ShippingAddress) => void;
};

const AppContext = createContext<AppContextType | null>(null);
const KEY = "luxora_complete_predeploy_v2";

const initialState: Persisted = {
  language: "en",
  settings: demoSettings,
  categories: demoCategories,
  products: demoProducts,
  reviews: demoReviews,
  orders: [],
  users: demoUsers,
  cart: [],
  currentUser: null
};

const sanitizeUser = (user: StoredUser): UserProfile => {
  const { password: _password, ...profile } = user;
  return profile;
};

const load = (): Persisted => {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      ...initialState,
      ...parsed,
      settings: { ...initialState.settings, ...(parsed.settings || {}) },
      currentUser: parsed.currentUser || null
    };
  } catch {
    return initialState;
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initialState);

  useEffect(() => setState(load()), []);

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = languageMeta[state.language].dir;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setLanguage = (language: Language) => setState((current) => ({ ...current, language }));

  const t = useCallback(
    (key: string) => dictionaries[state.language][key] || dictionaries.en[key] || key,
    [state.language]
  );

  const text = useCallback(
    (value: unknown) => pickText(value as any, state.language),
    [state.language]
  );

  const money = useCallback(
    (value: number) => `${state.settings.currency}${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    [state.settings.currency]
  );

  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === "admin";
  const cartCount = useMemo(() => state.cart.reduce((sum, item) => sum + item.quantity, 0), [state.cart]);

  const login = async (email: string, password: string) => {
    const found = state.users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
    if (!found) throw new Error("Invalid email or password");
    setState((current) => ({ ...current, currentUser: sanitizeUser(found) }));
  };

  const register = async (input: { email: string; password: string; displayName: string }) => {
    if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
    if (state.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) throw new Error("Email already exists");

    const user: StoredUser = {
      uid: safeId("user"),
      email: input.email,
      displayName: input.displayName,
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
      password: input.password
    };

    setState((current) => ({ ...current, users: [...current.users, user], currentUser: sanitizeUser(user) }));
  };

  const logout = () => setState((current) => ({ ...current, currentUser: null }));

  const loginDemoAdmin = () => {
    const user = state.users.find((item) => item.email === "admin@luxora.dev") || demoUsers.find((item) => item.email === "admin@luxora.dev");
    if (user) setState((current) => ({ ...current, currentUser: sanitizeUser(user) }));
  };

  const loginDemoCustomer = () => {
    const user = state.users.find((item) => item.email === "customer@luxora.dev") || demoUsers.find((item) => item.email === "customer@luxora.dev");
    if (user) setState((current) => ({ ...current, currentUser: sanitizeUser(user) }));
  };

  const getProduct = (id: string) => state.products.find((product) => product.id === id);
  const getCategory = (id: string) => state.categories.find((category) => category.id === id);
  const getReviews = (productId: string) => state.reviews.filter((review) => review.productId === productId);

  const addToCart = (productId: string, sizeLabel: string) => {
    const product = getProduct(productId);
    const size = product?.sizes.find((item) => item.label === sizeLabel);
    if (!product || !size || size.stock <= 0) return;

    setState((current) => {
      const found = current.cart.find((item) => item.productId === productId && item.sizeLabel === sizeLabel);
      const cart = found
        ? current.cart.map((item) => item.productId === productId && item.sizeLabel === sizeLabel ? { ...item, quantity: Math.min(item.quantity + 1, size.stock) } : item)
        : [...current.cart, { productId, sizeLabel, quantity: 1 }];
      return { ...current, cart };
    });
  };

  const updateCartQuantity = (productId: string, sizeLabel: string, quantity: number) => {
    const product = getProduct(productId);
    const size = product?.sizes.find((item) => item.label === sizeLabel);
    const max = size?.stock || 1;
    setState((current) => ({
      ...current,
      cart: current.cart.map((item) =>
        item.productId === productId && item.sizeLabel === sizeLabel
          ? { ...item, quantity: Math.max(1, Math.min(quantity, max)) }
          : item
      )
    }));
  };

  const removeFromCart = (productId: string, sizeLabel: string) => {
    setState((current) => ({ ...current, cart: current.cart.filter((item) => !(item.productId === productId && item.sizeLabel === sizeLabel)) }));
  };

  const clearCart = () => setState((current) => ({ ...current, cart: [] }));

  const placeOrder = (input: { shippingAddress: ShippingAddress; paymentMethod: "cash" | "card" | "manual" }) => {
    const lines = state.cart
      .map((item) => {
        const product = getProduct(item.productId);
        const size = product?.sizes.find((row) => row.label === item.sizeLabel);
        if (!product || !size) return null;
        return {
          productId: product.id,
          name: pickText(product.name, state.language),
          size: size.label,
          quantity: item.quantity,
          price: size.price,
          image: product.images[0]
        };
      })
      .filter(Boolean) as Order["items"];

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

    const order: Order = {
      id: safeId("order"),
      userId: currentUser?.uid || "guest",
      items: lines,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      totalAmount: subtotal + state.settings.deliveryFee,
      status: input.paymentMethod === "card" ? "paid" : "pending",
      paymentStatus: input.paymentMethod === "card" ? "paid" : "not_required",
      createdAt: new Date().toISOString()
    };

    setState((current) => ({
      ...current,
      orders: [order, ...current.orders],
      cart: [],
      users: current.currentUser && current.currentUser.role === "customer"
        ? current.users.map((user) => {
            if (user.uid !== current.currentUser?.uid) return user;
            const alreadyExists = user.addresses.some((address) =>
              address.fullName === input.shippingAddress.fullName &&
              address.phone === input.shippingAddress.phone &&
              address.city === input.shippingAddress.city &&
              address.address === input.shippingAddress.address
            );
            return alreadyExists ? user : { ...user, addresses: [input.shippingAddress, ...user.addresses].slice(0, 5) };
          })
        : current.users
    }));

    return order;
  };

  const saveProduct = (product: Product) => {
    const normalized: Product = {
      ...product,
      id: product.id || safeId("product"),
      sizes: product.sizes.filter((size) => size.label && size.price >= 0),
      images: product.images.length ? product.images : ["/images/perfume-oud.svg"],
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState((current) => ({
      ...current,
      products: current.products.some((item) => item.id === normalized.id)
        ? current.products.map((item) => item.id === normalized.id ? normalized : item)
        : [normalized, ...current.products]
    }));
  };

  const deleteProduct = (id: string) => setState((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }));

  const saveCategory = (category: Category) => {
    const normalized = {
      ...category,
      id: category.id || safeId("category"),
      slug: category.slug || pickText(category.name, "en").toLowerCase().replace(/\s+/g, "-"),
      createdAt: category.createdAt || new Date().toISOString()
    };

    setState((current) => ({
      ...current,
      categories: current.categories.some((item) => item.id === normalized.id)
        ? current.categories.map((item) => item.id === normalized.id ? normalized : item)
        : [normalized, ...current.categories]
    }));
  };

  const deleteCategory = (id: string) => {
    setState((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== id),
      products: current.products.map((product) => product.categoryId === id ? { ...product, categoryId: current.categories[0]?.id || "uncategorized" } : product)
    }));
  };

  const saveReview = (review: Review) => {
    setState((current) => ({
      ...current,
      reviews: [{ ...review, id: review.id || safeId("review"), createdAt: review.createdAt || new Date().toISOString() }, ...current.reviews]
    }));
  };

  const deleteReview = (id: string) => setState((current) => ({ ...current, reviews: current.reviews.filter((review) => review.id !== id) }));

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) => order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order)
    }));
  };

  const updateUserRole = (uid: string, role: Role) => {
    setState((current) => ({
      ...current,
      users: current.users.map((user) => user.uid === uid ? { ...user, role } : user),
      currentUser: current.currentUser?.uid === uid ? { ...current.currentUser, role } : current.currentUser
    }));
  };

  const deleteUser = (uid: string) => {
    setState((current) => ({
      ...current,
      users: current.users.filter((user) => user.uid !== uid),
      currentUser: current.currentUser?.uid === uid ? null : current.currentUser
    }));
  };

  const saveAddress = (address: ShippingAddress) => {
    if (!currentUser) return;
    setState((current) => ({
      ...current,
      users: current.users.map((user) => user.uid === currentUser.uid ? { ...user, addresses: [address, ...user.addresses].slice(0, 5) } : user),
      currentUser: { ...currentUser, addresses: [address, ...currentUser.addresses].slice(0, 5) }
    }));
  };

  const saveSettings = (settings: ShopSettings) => setState((current) => ({ ...current, settings }));
  const resetDemoData = () => setState(initialState);

  const publicUsers = state.users.map(sanitizeUser);

  return (
    <AppContext.Provider
      value={{
        language: state.language,
        setLanguage,
        t,
        text,
        money,
        settings: state.settings,
        saveSettings,
        resetDemoData,
        categories: state.categories,
        products: state.products,
        reviews: state.reviews,
        orders: state.orders,
        users: publicUsers,
        cart: state.cart,
        currentUser,
        cartCount,
        isAdmin,
        login,
        register,
        logout,
        loginDemoAdmin,
        loginDemoCustomer,
        getProduct,
        getCategory,
        getReviews,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveReview,
        deleteReview,
        updateOrderStatus,
        updateUserRole,
        deleteUser,
        saveAddress
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
