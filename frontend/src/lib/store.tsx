"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  demoCategories,
  demoProducts,
  demoReviews,
  demoSettings,
  demoUsers,
} from "@/data/demo";
import { dictionaries, languageMeta, pickText } from "@/lib/i18n";
import { safeId } from "@/lib/helpers";
import { auth, db, useFirebase } from "@/lib/firebase";
import type {
  CartItem,
  Category,
  Language,
  LocalizedText,
  Order,
  OrderStatus,
  Product,
  Review,
  Role,
  ShippingAddress,
  ShopSettings,
  UserProfile,
} from "@/types";

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
  isFirebaseEnabled: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  logout: () => void;
  loginDemoAdmin: () => void;
  loginDemoCustomer: () => void;

  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
  getReviews: (productId: string) => Review[];

  addToCart: (productId: string, sizeLabel: string) => void;
  updateCartQuantity: (
    productId: string,
    sizeLabel: string,
    quantity: number,
  ) => void;
  removeFromCart: (productId: string, sizeLabel: string) => void;
  clearCart: () => void;
  placeOrder: (input: {
    shippingAddress: ShippingAddress;
    paymentMethod: "cash" | "card" | "manual";
  }) => Order;

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
const KEY = "luxora_complete_predeploy_v3_firebase";

const initialState: Persisted = {
  language: "en",
  settings: demoSettings,
  categories: demoCategories,
  products: demoProducts,
  reviews: demoReviews,
  orders: [],
  users: demoUsers,
  cart: [],
  currentUser: null,
};

const emptyText = (value = ""): LocalizedText => ({
  en: value,
  fa: value,
  ps: value,
});

const normalizeText = (
  value: unknown,
  fallback: LocalizedText = emptyText(),
): LocalizedText => {
  if (typeof value === "string") return emptyText(value);
  if (value && typeof value === "object") {
    const row = value as Partial<LocalizedText>;
    return {
      en: String(row.en ?? fallback.en ?? ""),
      fa: String(row.fa ?? fallback.fa ?? row.en ?? fallback.en ?? ""),
      ps: String(row.ps ?? fallback.ps ?? row.en ?? fallback.en ?? ""),
    };
  }
  return fallback;
};

const sanitizeForFirestore = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));

const sanitizeUser = (user: StoredUser): UserProfile => {
  const { password: _password, ...profile } = user;
  return profile;
};

const normalizeSettings = (value: any): ShopSettings => ({
  ...demoSettings,
  ...value,
  shopName: normalizeText(value?.shopName, demoSettings.shopName),
  heroTitle: normalizeText(value?.heroTitle, demoSettings.heroTitle),
  heroSubtitle: normalizeText(value?.heroSubtitle, demoSettings.heroSubtitle),
  announcement: normalizeText(value?.announcement, demoSettings.announcement),
  footerText: normalizeText(value?.footerText, demoSettings.footerText),
  seoTitle: normalizeText(value?.seoTitle, demoSettings.seoTitle),
  seoDescription: normalizeText(
    value?.seoDescription,
    demoSettings.seoDescription,
  ),
  contactAddress: normalizeText(
    value?.contactAddress,
    demoSettings.contactAddress,
  ),
  brandTagline: normalizeText(value?.brandTagline, demoSettings.brandTagline),
  currency: String(value?.currency ?? demoSettings.currency),
  deliveryFee: Number(value?.deliveryFee ?? demoSettings.deliveryFee),
  contactPhone: String(value?.contactPhone ?? demoSettings.contactPhone),
  contactEmail: String(value?.contactEmail ?? demoSettings.contactEmail),
  heroImage: String(value?.heroImage ?? demoSettings.heroImage),
});

const normalizeCategory = (value: any): Category => ({
  id: String(value?.id ?? ""),
  name: normalizeText(value?.name, emptyText("Category")),
  slug: String(value?.slug ?? ""),
  image: value?.image ? String(value.image) : undefined,
  active: Boolean(value?.active ?? true),
  createdAt: String(value?.createdAt ?? new Date().toISOString()),
});

const normalizeProduct = (value: any): Product => ({
  id: String(value?.id ?? ""),
  name: normalizeText(value?.name, emptyText("Product")),
  brand: String(value?.brand ?? ""),
  categoryId: String(value?.categoryId ?? "cat-edp"),
  description: normalizeText(value?.description, emptyText("")),
  concentration: String(value?.concentration ?? "EDP"),
  gender:
    value?.gender === "men" ||
    value?.gender === "women" ||
    value?.gender === "unisex"
      ? value.gender
      : "unisex",
  scentFamily: String(value?.scentFamily ?? "woody"),
  sizes:
    Array.isArray(value?.sizes) && value.sizes.length
      ? value.sizes.map((size: any) => ({
          label: String(size?.label ?? "100ml"),
          price: Number(size?.price ?? 0),
          stock: Number(size?.stock ?? 0),
        }))
      : [{ label: "100ml", price: 0, stock: 0 }],
  notes: {
    top: Array.isArray(value?.notes?.top) ? value.notes.top.map(String) : [],
    heart: Array.isArray(value?.notes?.heart)
      ? value.notes.heart.map(String)
      : [],
    base: Array.isArray(value?.notes?.base) ? value.notes.base.map(String) : [],
  },
  images:
    Array.isArray(value?.images) && value.images.length
      ? value.images.map(String)
      : ["/images/perfume-oud.svg"],
  featured: Boolean(value?.featured ?? false),
  active: Boolean(value?.active ?? true),
  createdAt: String(value?.createdAt ?? new Date().toISOString()),
  updatedAt: value?.updatedAt ? String(value.updatedAt) : null,
});

const normalizeReview = (value: any): Review => ({
  id: String(value?.id ?? ""),
  productId: String(value?.productId ?? ""),
  userId: String(value?.userId ?? ""),
  displayName: String(value?.displayName ?? "Customer"),
  rating: Number(value?.rating ?? 5),
  comment: String(value?.comment ?? ""),
  createdAt: String(value?.createdAt ?? new Date().toISOString()),
});

const normalizeUser = (value: any): UserProfile => ({
  uid: String(value?.uid ?? ""),
  email: String(value?.email ?? ""),
  displayName: String(value?.displayName ?? value?.email ?? "User"),
  role: value?.role === "admin" ? "admin" : "customer",
  addresses: Array.isArray(value?.addresses)
    ? value.addresses.map((address: any) => ({
        fullName: String(address?.fullName ?? ""),
        phone: String(address?.phone ?? ""),
        city: String(address?.city ?? ""),
        address: String(address?.address ?? ""),
      }))
    : [],
  createdAt: String(value?.createdAt ?? new Date().toISOString()),
});

const normalizeOrder = (value: any): Order => ({
  id: String(value?.id ?? ""),
  userId: String(value?.userId ?? ""),
  items: Array.isArray(value?.items)
    ? value.items.map((item: any) => ({
        productId: String(item?.productId ?? ""),
        name: String(item?.name ?? ""),
        size: String(item?.size ?? ""),
        quantity: Number(item?.quantity ?? 1),
        price: Number(item?.price ?? 0),
        image: item?.image ? String(item.image) : undefined,
      }))
    : [],
  shippingAddress: {
    fullName: String(value?.shippingAddress?.fullName ?? ""),
    phone: String(value?.shippingAddress?.phone ?? ""),
    city: String(value?.shippingAddress?.city ?? ""),
    address: String(value?.shippingAddress?.address ?? ""),
  },
  paymentMethod:
    value?.paymentMethod === "card" || value?.paymentMethod === "manual"
      ? value.paymentMethod
      : "cash",
  totalAmount: Number(value?.totalAmount ?? 0),
  status: value?.status ?? "pending",
  paymentStatus: value?.paymentStatus ?? "not_required",
  createdAt: String(value?.createdAt ?? new Date().toISOString()),
  updatedAt: value?.updatedAt ? String(value.updatedAt) : null,
});

const load = (): Persisted => {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      ...initialState,
      ...parsed,
      settings: normalizeSettings({
        ...initialState.settings,
        ...(parsed.settings || {}),
      }),
      currentUser: parsed.currentUser
        ? normalizeUser(parsed.currentUser)
        : null,
    };
  } catch {
    return initialState;
  }
};

async function getFirebaseProfile(
  firebaseUser: FirebaseUser,
): Promise<UserProfile> {
  if (!db) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || firebaseUser.email || "User",
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
  }

  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return normalizeUser({ uid: firebaseUser.uid, ...snapshot.data() });
  }

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firebaseUser.email || "User",
    role: "customer",
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, sanitizeForFirestore(profile));
  return profile;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initialState);

  useEffect(() => setState(load()), []);

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = languageMeta[state.language].dir;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!useFirebase || !auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState((current) => ({
          ...current,
          currentUser: null,
          orders: [],
          users: demoUsers,
        }));
        return;
      }

      try {
        const profile = await getFirebaseProfile(firebaseUser);
        setState((current) => ({
          ...current,
          currentUser: profile,
          users: profile.role === "admin" ? current.users : [profile],
        }));
      } catch (error) {
        console.error("Failed to load Firebase profile", error);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!useFirebase || !db) return;

    const unsubSettings = onSnapshot(
      doc(db, "settings", "shop"),
      (snapshot) => {
        if (snapshot.exists()) {
          setState((current) => ({
            ...current,
            settings: normalizeSettings(snapshot.data()),
          }));
        }
      },
      (error) => console.error("Public settings listener error:", error),
    );

    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) =>
          normalizeCategory({ id: item.id, ...item.data() }),
        );
        if (rows.length)
          setState((current) => ({ ...current, categories: rows }));
      },
      (error) => console.error("Public categories listener error:", error),
    );

    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) =>
          normalizeProduct({ id: item.id, ...item.data() }),
        );
        if (rows.length)
          setState((current) => ({ ...current, products: rows }));
      },
      (error) => console.error("Public products listener error:", error),
    );

    const unsubReviews = onSnapshot(
      collection(db, "reviews"),
      (snapshot) => {
        setState((current) => ({
          ...current,
          reviews: snapshot.docs.map((item) =>
            normalizeReview({ id: item.id, ...item.data() }),
          ),
        }));
      },
      (error) => console.error("Public reviews listener error:", error),
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
      unsubReviews();
    };
  }, []);

  /*
   * Protected Firestore listeners
   * Important:
   * - products/categories/reviews/settings are public listeners above.
   * - orders/users are protected by Firestore Rules.
   * - Never subscribe to orders/users before Firebase Auth has loaded a user profile.
   * - Admin can read all orders/users.
   * - Customer can read only his/her own orders.
   */

  useEffect(() => {
    if (!useFirebase || !db) return;
    if (!state.currentUser || state.currentUser.role !== "admin") return;

    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const rows = snapshot.docs
          .map((item) => normalizeOrder({ id: item.id, ...item.data() }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setState((current) => ({ ...current, orders: rows }));
      },
      (error) => {
        console.error("Admin orders listener permission error:", error);
        setState((current) => ({ ...current, orders: [] }));
      },
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) =>
          normalizeUser({ uid: item.id, ...item.data() }),
        );
        setState((current) => ({ ...current, users: rows }));
      },
      (error) => {
        console.error("Admin users listener permission error:", error);
        setState((current) => ({
          ...current,
          users: current.currentUser ? [current.currentUser] : [],
        }));
      },
    );

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [state.currentUser?.uid, state.currentUser?.role]);

  useEffect(() => {
    if (!useFirebase || !db) return;
    if (!state.currentUser || state.currentUser.role === "admin") return;

    const myOrdersQuery = query(
      collection(db, "orders"),
      where("userId", "==", state.currentUser.uid),
    );

    const unsubMyOrders = onSnapshot(
      myOrdersQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((item) => normalizeOrder({ id: item.id, ...item.data() }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setState((current) => ({
          ...current,
          orders: rows,
          users: current.currentUser ? [current.currentUser] : [],
        }));
      },
      (error) => {
        console.error("Customer orders listener permission error:", error);
        setState((current) => ({
          ...current,
          orders: [],
          users: current.currentUser ? [current.currentUser] : [],
        }));
      },
    );

    return () => {
      unsubMyOrders();
    };
  }, [state.currentUser?.uid, state.currentUser?.role]);

  const setLanguage = (language: Language) =>
    setState((current) => ({ ...current, language }));

  const t = useCallback(
    (key: string) =>
      dictionaries[state.language][key] || dictionaries.en[key] || key,
    [state.language],
  );

  const text = useCallback(
    (value: unknown) => pickText(value as any, state.language),
    [state.language],
  );

  const money = useCallback(
    (value: number) =>
      `${state.settings.currency}${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    [state.settings.currency],
  );

  const currentUser = state.currentUser;
  const isAdmin = currentUser?.role === "admin";
  const cartCount = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    [state.cart],
  );

  const localLogin = (email: string, password: string) => {
    const found = state.users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    );
    if (!found) throw new Error("Invalid email or password");
    setState((current) => ({ ...current, currentUser: sanitizeUser(found) }));
  };

  const login = async (email: string, password: string) => {
    if (useFirebase && auth) {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const profile = await getFirebaseProfile(credential.user);
      setState((current) => ({ ...current, currentUser: profile }));
      return;
    }
    localLogin(email, password);
  };

  const register = async (input: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    if (input.password.length < 8)
      throw new Error("Password must be at least 8 characters");

    if (useFirebase && auth && db) {
      const credential = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password,
      );
      const profile: UserProfile = {
        uid: credential.user.uid,
        email: input.email,
        displayName: input.displayName,
        role: "customer",
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(
        doc(db, "users", credential.user.uid),
        sanitizeForFirestore(profile),
      );
      setState((current) => ({
        ...current,
        currentUser: profile,
        users: [profile],
      }));
      return;
    }

    if (
      state.users.some(
        (user) => user.email.toLowerCase() === input.email.toLowerCase(),
      )
    )
      throw new Error("Email already exists");

    const user: StoredUser = {
      uid: safeId("user"),
      email: input.email,
      displayName: input.displayName,
      role: "customer",
      addresses: [],
      createdAt: new Date().toISOString(),
      password: input.password,
    };

    setState((current) => ({
      ...current,
      users: [...current.users, user],
      currentUser: sanitizeUser(user),
    }));
  };

  const logout = () => {
    if (useFirebase && auth) void signOut(auth);
    setState((current) => ({ ...current, currentUser: null }));
  };

  const loginDemoAdmin = () => {
    if (useFirebase) {
      void login("admin@luxora.dev", "admin12345").catch((error) =>
        console.error(error),
      );
      return;
    }

    const user =
      state.users.find((item) => item.email === "admin@luxora.dev") ||
      demoUsers.find((item) => item.email === "admin@luxora.dev");
    if (user)
      setState((current) => ({ ...current, currentUser: sanitizeUser(user) }));
  };

  const loginDemoCustomer = () => {
    if (useFirebase) {
      void login("customer@luxora.dev", "customer12345").catch((error) =>
        console.error(error),
      );
      return;
    }

    const user =
      state.users.find((item) => item.email === "customer@luxora.dev") ||
      demoUsers.find((item) => item.email === "customer@luxora.dev");
    if (user)
      setState((current) => ({ ...current, currentUser: sanitizeUser(user) }));
  };

  const getProduct = (id: string) =>
    state.products.find((product) => product.id === id);
  const getCategory = (id: string) =>
    state.categories.find((category) => category.id === id);
  const getReviews = (productId: string) =>
    state.reviews.filter((review) => review.productId === productId);

  const addToCart = (productId: string, sizeLabel: string) => {
    const product = getProduct(productId);
    const size = product?.sizes.find((item) => item.label === sizeLabel);
    if (!product || !size || size.stock <= 0) return;

    setState((current) => {
      const found = current.cart.find(
        (item) => item.productId === productId && item.sizeLabel === sizeLabel,
      );
      const cart = found
        ? current.cart.map((item) =>
            item.productId === productId && item.sizeLabel === sizeLabel
              ? { ...item, quantity: Math.min(item.quantity + 1, size.stock) }
              : item,
          )
        : [...current.cart, { productId, sizeLabel, quantity: 1 }];
      return { ...current, cart };
    });
  };

  const updateCartQuantity = (
    productId: string,
    sizeLabel: string,
    quantity: number,
  ) => {
    const product = getProduct(productId);
    const size = product?.sizes.find((item) => item.label === sizeLabel);
    const max = size?.stock || 1;
    setState((current) => ({
      ...current,
      cart: current.cart.map((item) =>
        item.productId === productId && item.sizeLabel === sizeLabel
          ? { ...item, quantity: Math.max(1, Math.min(quantity, max)) }
          : item,
      ),
    }));
  };

  const removeFromCart = (productId: string, sizeLabel: string) => {
    setState((current) => ({
      ...current,
      cart: current.cart.filter(
        (item) =>
          !(item.productId === productId && item.sizeLabel === sizeLabel),
      ),
    }));
  };

  const clearCart = () => setState((current) => ({ ...current, cart: [] }));

  const placeOrder = (input: {
    shippingAddress: ShippingAddress;
    paymentMethod: "cash" | "card" | "manual";
  }) => {
    if (useFirebase && !currentUser) {
      throw new Error("Please login before checkout.");
    }

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
          image: product.images[0],
        };
      })
      .filter(Boolean) as Order["items"];

    const subtotal = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );

    const order: Order = {
      id: safeId("order"),
      userId: currentUser?.uid || "guest",
      items: lines,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      totalAmount: subtotal + state.settings.deliveryFee,
      status: input.paymentMethod === "card" ? "paid" : "pending",
      paymentStatus: input.paymentMethod === "card" ? "paid" : "not_required",
      createdAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      orders: [order, ...current.orders],
      cart: [],
      users:
        current.currentUser && current.currentUser.role === "customer"
          ? current.users.map((user) => {
              if (user.uid !== current.currentUser?.uid) return user;
              const alreadyExists = user.addresses.some(
                (address) =>
                  address.fullName === input.shippingAddress.fullName &&
                  address.phone === input.shippingAddress.phone &&
                  address.city === input.shippingAddress.city &&
                  address.address === input.shippingAddress.address,
              );
              return alreadyExists
                ? user
                : {
                    ...user,
                    addresses: [input.shippingAddress, ...user.addresses].slice(
                      0,
                      5,
                    ),
                  };
            })
          : current.users,
      currentUser:
        current.currentUser && current.currentUser.role === "customer"
          ? {
              ...current.currentUser,
              addresses: current.currentUser.addresses.some(
                (address) =>
                  address.fullName === input.shippingAddress.fullName &&
                  address.phone === input.shippingAddress.phone &&
                  address.city === input.shippingAddress.city &&
                  address.address === input.shippingAddress.address,
              )
                ? current.currentUser.addresses
                : [
                    input.shippingAddress,
                    ...current.currentUser.addresses,
                  ].slice(0, 5),
            }
          : current.currentUser,
    }));

    if (useFirebase && db) {
      void setDoc(
        doc(db, "orders", order.id),
        sanitizeForFirestore(order),
      ).catch(console.error);
      if (currentUser?.role === "customer") {
        const nextAddresses = currentUser.addresses.some(
          (address) =>
            address.fullName === input.shippingAddress.fullName &&
            address.phone === input.shippingAddress.phone &&
            address.city === input.shippingAddress.city &&
            address.address === input.shippingAddress.address,
        )
          ? currentUser.addresses
          : [input.shippingAddress, ...currentUser.addresses].slice(0, 5);
        void updateDoc(doc(db, "users", currentUser.uid), {
          addresses: sanitizeForFirestore(nextAddresses),
        }).catch(console.error);
      }
    }

    return order;
  };

  const saveProduct = (product: Product) => {
    const normalized: Product = {
      ...product,
      id: product.id || safeId("product"),
      sizes: product.sizes.filter((size) => size.label && size.price >= 0),
      images: product.images.length
        ? product.images
        : ["/images/perfume-oud.svg"],
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      products: current.products.some((item) => item.id === normalized.id)
        ? current.products.map((item) =>
            item.id === normalized.id ? normalized : item,
          )
        : [normalized, ...current.products],
    }));

    if (useFirebase && db)
      void setDoc(
        doc(db, "products", normalized.id),
        sanitizeForFirestore(normalized),
      ).catch(console.error);
  };

  const deleteProduct = (id: string) => {
    setState((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== id),
    }));
    if (useFirebase && db)
      void deleteDoc(doc(db, "products", id)).catch(console.error);
  };

  const saveCategory = (category: Category) => {
    const normalized = {
      ...category,
      id: category.id || safeId("category"),
      slug:
        category.slug ||
        pickText(category.name, "en").toLowerCase().replace(/\s+/g, "-"),
      createdAt: category.createdAt || new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      categories: current.categories.some((item) => item.id === normalized.id)
        ? current.categories.map((item) =>
            item.id === normalized.id ? normalized : item,
          )
        : [normalized, ...current.categories],
    }));

    if (useFirebase && db)
      void setDoc(
        doc(db, "categories", normalized.id),
        sanitizeForFirestore(normalized),
      ).catch(console.error);
  };

  const deleteCategory = (id: string) => {
    setState((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== id),
      products: current.products.map((product) =>
        product.categoryId === id
          ? {
              ...product,
              categoryId: current.categories[0]?.id || "uncategorized",
            }
          : product,
      ),
    }));
    if (useFirebase && db)
      void deleteDoc(doc(db, "categories", id)).catch(console.error);
  };

  const saveReview = (review: Review) => {
    const normalized = {
      ...review,
      id: review.id || safeId("review"),
      createdAt: review.createdAt || new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      reviews: [normalized, ...current.reviews],
    }));
    if (useFirebase && db && currentUser)
      void setDoc(
        doc(db, "reviews", normalized.id),
        sanitizeForFirestore({ ...normalized, userId: currentUser.uid }),
      ).catch(console.error);
  };

  const deleteReview = (id: string) => {
    setState((current) => ({
      ...current,
      reviews: current.reviews.filter((review) => review.id !== id),
    }));
    if (useFirebase && db)
      void deleteDoc(doc(db, "reviews", id)).catch(console.error);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updates = { status, updatedAt: new Date().toISOString() };
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order,
      ),
    }));
    if (useFirebase && db)
      void updateDoc(doc(db, "orders", id), updates).catch(console.error);
  };

  const updateUserRole = (uid: string, role: Role) => {
    setState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.uid === uid ? { ...user, role } : user,
      ),
      currentUser:
        current.currentUser?.uid === uid
          ? { ...current.currentUser, role }
          : current.currentUser,
    }));
    if (useFirebase && db)
      void updateDoc(doc(db, "users", uid), { role }).catch(console.error);
  };

  const deleteUser = (uid: string) => {
    setState((current) => ({
      ...current,
      users: current.users.filter((user) => user.uid !== uid),
      currentUser:
        current.currentUser?.uid === uid ? null : current.currentUser,
    }));
    if (useFirebase && db)
      void deleteDoc(doc(db, "users", uid)).catch(console.error);
  };

  const saveAddress = (address: ShippingAddress) => {
    if (!currentUser) return;
    const nextAddresses = [address, ...currentUser.addresses].slice(0, 5);
    setState((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.uid === currentUser.uid
          ? { ...user, addresses: nextAddresses }
          : user,
      ),
      currentUser: { ...currentUser, addresses: nextAddresses },
    }));
    if (useFirebase && db)
      void updateDoc(doc(db, "users", currentUser.uid), {
        addresses: sanitizeForFirestore(nextAddresses),
      }).catch(console.error);
  };

  const saveSettings = (settings: ShopSettings) => {
    const normalized = normalizeSettings(settings);
    setState((current) => ({ ...current, settings: normalized }));
    if (useFirebase && db)
      void setDoc(
        doc(db, "settings", "shop"),
        sanitizeForFirestore(normalized),
      ).catch(console.error);
  };

  const resetDemoData = () => {
    setState((current) => ({
      ...current,
      settings: demoSettings,
      categories: demoCategories,
      products: demoProducts,
      reviews: demoReviews,
      cart: [],
    }));

    if (useFirebase && db) {
      void setDoc(
        doc(db, "settings", "shop"),
        sanitizeForFirestore(demoSettings),
      ).catch(console.error);
      demoCategories.forEach(
        (category) =>
          void setDoc(
            doc(db, "categories", category.id),
            sanitizeForFirestore(category),
          ).catch(console.error),
      );
      demoProducts.forEach(
        (product) =>
          void setDoc(
            doc(db, "products", product.id),
            sanitizeForFirestore(product),
          ).catch(console.error),
      );
      demoReviews.forEach(
        (review) =>
          void setDoc(
            doc(db, "reviews", review.id),
            sanitizeForFirestore(review),
          ).catch(console.error),
      );
    }
  };

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
        isFirebaseEnabled: useFirebase,
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
        saveAddress,
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
