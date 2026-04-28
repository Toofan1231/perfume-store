"use client";

import { useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import { BarChart3, Edit, Package, RotateCcw, Save, Settings, ShoppingBag, Star, Trash2, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { parseSizes, safeId, sizesToText, splitCsv } from "@/lib/helpers";
import { genderKeys, scentFamilies } from "@/lib/i18n";
import type { Category, Gender, LocalizedText, OrderStatus, Product, Role, ShopSettings } from "@/types";

type Tab = "dashboard" | "settings" | "products" | "categories" | "orders" | "reviews" | "users";

const emptyText = (): LocalizedText => ({ en: "", fa: "", ps: "" });

const emptyProduct = (): Product => ({
  id: "",
  name: emptyText(),
  brand: "",
  categoryId: "cat-edp",
  description: emptyText(),
  concentration: "EDP",
  gender: "unisex",
  scentFamily: "woody",
  sizes: [{ label: "100ml", price: 0, stock: 0 }],
  notes: { top: [], heart: [], base: [] },
  images: ["/images/perfume-oud.svg"],
  featured: false,
  active: true,
  createdAt: new Date().toISOString()
});

const emptyCategory = (): Category => ({
  id: "",
  name: emptyText(),
  slug: "",
  active: true,
  createdAt: new Date().toISOString()
});

const updateText = (value: LocalizedText, lang: keyof LocalizedText, next: string): LocalizedText => ({ ...value, [lang]: next });

export function AdminPage() {
  const app = useApp();
  const {
    currentUser,
    isAdmin,
    t,
    text,
    money,
    products,
    categories,
    orders,
    reviews,
    users,
    settings,
    loginDemoAdmin,
    saveSettings,
    resetDemoData,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    deleteReview,
    updateOrderStatus,
    updateUserRole,
    deleteUser
  } = app;

  const [tab, setTab] = useState<Tab>("dashboard");
  const [product, setProduct] = useState<Product>(emptyProduct());
  const [category, setCategory] = useState<Category>(emptyCategory());
  const [settingsForm, setSettingsForm] = useState<ShopSettings>(settings);
  const [sizes, setSizes] = useState("100ml:0:0");
  const [top, setTop] = useState("");
  const [heart, setHeart] = useState("");
  const [base, setBase] = useState("");
  const [images, setImages] = useState("/images/perfume-oud.svg");

  const stats = useMemo(() => {
    const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.totalAmount, 0);
    const average = orders.length ? revenue / orders.length : 0;
    const productSales: Record<string, number> = {};
    orders.forEach((order) => order.items.forEach((item) => { productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity; }));
    const topProduct = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
    return { revenue, orders: orders.length, products: products.length, users: users.length, average, topProduct };
  }, [orders, products, users]);

  if (!currentUser || !isAdmin) {
    return (
      <main className="px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-[2rem] border bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-black">{t("adminLogin")}</h1>
          <p className="mt-3 text-stone-600">Use demo admin to manage every page and entity before database setup.</p>
          <button onClick={loginDemoAdmin} className="mt-5 rounded-full bg-stone-950 px-6 py-4 font-black text-white">{t("useDemoAdmin")}</button>
          <Link href="/login" className="mt-3 block font-bold text-amber-800">{t("login")}</Link>
        </div>
      </main>
    );
  }

  const resetProduct = () => {
    setProduct(emptyProduct());
    setSizes("100ml:0:0");
    setTop("");
    setHeart("");
    setBase("");
    setImages("/images/perfume-oud.svg");
  };

  const editProduct = (item: Product) => {
    setProduct(item);
    setSizes(sizesToText(item));
    setTop(item.notes.top.join(", "));
    setHeart(item.notes.heart.join(", "));
    setBase(item.notes.base.join(", "));
    setImages(item.images.join(", "));
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitProduct = (event: React.FormEvent) => {
    event.preventDefault();
    saveProduct({
      ...product,
      id: product.id || safeId("product"),
      sizes: parseSizes(sizes),
      notes: { top: splitCsv(top), heart: splitCsv(heart), base: splitCsv(base) },
      images: splitCsv(images),
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    resetProduct();
  };

  const submitCategory = (event: React.FormEvent) => {
    event.preventDefault();
    saveCategory({
      ...category,
      id: category.id || safeId("category"),
      slug: category.slug || category.name.en.toLowerCase().replaceAll(" ", "-"),
      createdAt: category.createdAt || new Date().toISOString()
    });
    setCategory(emptyCategory());
  };

  const submitSettings = (event: React.FormEvent) => {
    event.preventDefault();
    saveSettings({ ...settingsForm, deliveryFee: Number(settingsForm.deliveryFee) });
  };

  const confirmDelete = (callback: () => void) => {
    if (window.confirm(t("confirmDelete"))) callback();
  };

  const tabs: Array<[Tab, string]> = [
    ["dashboard", t("dashboard")],
    ["settings", t("shopSettings")],
    ["products", t("manageProducts")],
    ["categories", t("manageCategories")],
    ["orders", t("manageOrders")],
    ["reviews", t("manageReviews")],
    ["users", t("manageUsers")]
  ];

  return (
    <main className="px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-stone-950 p-8 text-white">
          <h1 className="text-4xl font-black">{t("dashboard")}</h1>
          <p className="mt-2 text-stone-300">{currentUser.email}</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`rounded-full px-5 py-3 font-bold ${tab === key ? "bg-stone-950 text-white" : "border bg-white"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" ? (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Stat icon={ShoppingBag} label={t("revenue")} value={money(stats.revenue)} />
              <Stat icon={Package} label={t("products")} value={String(stats.products)} />
              <Stat icon={Users} label={t("users")} value={String(stats.users)} />
              <Stat icon={BarChart3} label={t("averageOrder")} value={money(stats.average)} />
            </div>

            <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">{t("analytics")}</h2>
              <p className="mt-3 text-stone-600">
                Top product: {stats.topProduct ? `${products.find((item) => item.id === stats.topProduct?.[0])?.brand || stats.topProduct[0]} · ${stats.topProduct[1]} sold` : "No sales yet"}
              </p>
            </div>
          </section>
        ) : null}

        {tab === "settings" ? (
          <form onSubmit={submitSettings} className="rounded-[2rem] border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold uppercase tracking-[0.25em] text-amber-800">{t("content")} / {t("seo")} / {t("contact")}</p>
                <h2 className="text-3xl font-black"><Settings className="inline h-7 w-7" /> {t("shopSettings")}</h2>
              </div>
              <button type="button" onClick={resetDemoData} className="rounded-full border px-4 py-3 font-bold text-red-600">
                <RotateCcw className="inline h-4 w-4" /> Reset demo data
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <LocalizedFields label={t("shopName")} value={settingsForm.shopName} onChange={(value) => setSettingsForm({ ...settingsForm, shopName: value })} />
              <LocalizedFields label={t("brandTagline")} value={settingsForm.brandTagline} onChange={(value) => setSettingsForm({ ...settingsForm, brandTagline: value })} />
              <LocalizedFields label={t("announcement")} value={settingsForm.announcement} onChange={(value) => setSettingsForm({ ...settingsForm, announcement: value })} />
              <LocalizedFields label={t("heroTitle")} value={settingsForm.heroTitle} onChange={(value) => setSettingsForm({ ...settingsForm, heroTitle: value })} textarea />
              <LocalizedFields label={t("heroSubtitle")} value={settingsForm.heroSubtitle} onChange={(value) => setSettingsForm({ ...settingsForm, heroSubtitle: value })} textarea />
              <LocalizedFields label={t("footerText")} value={settingsForm.footerText} onChange={(value) => setSettingsForm({ ...settingsForm, footerText: value })} textarea />
              <LocalizedFields label={t("seoTitle")} value={settingsForm.seoTitle} onChange={(value) => setSettingsForm({ ...settingsForm, seoTitle: value })} />
              <LocalizedFields label={t("seoDescription")} value={settingsForm.seoDescription} onChange={(value) => setSettingsForm({ ...settingsForm, seoDescription: value })} textarea />
              <LocalizedFields label={t("contactAddress")} value={settingsForm.contactAddress} onChange={(value) => setSettingsForm({ ...settingsForm, contactAddress: value })} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <input className="input" placeholder={t("currency")} value={settingsForm.currency} onChange={(event) => setSettingsForm({ ...settingsForm, currency: event.target.value })} />
              <input className="input" type="number" placeholder={t("deliveryFee")} value={settingsForm.deliveryFee} onChange={(event) => setSettingsForm({ ...settingsForm, deliveryFee: Number(event.target.value) })} />
              <input className="input" placeholder={t("contactPhone")} value={settingsForm.contactPhone} onChange={(event) => setSettingsForm({ ...settingsForm, contactPhone: event.target.value })} />
              <input className="input" placeholder={t("contactEmail")} value={settingsForm.contactEmail} onChange={(event) => setSettingsForm({ ...settingsForm, contactEmail: event.target.value })} />
              <input className="input" placeholder={t("heroImage")} value={settingsForm.heroImage} onChange={(event) => setSettingsForm({ ...settingsForm, heroImage: event.target.value })} />
            </div>

            <button className="mt-5 rounded-full bg-stone-950 px-7 py-4 font-black text-white">
              <Save className="inline h-4 w-4" /> {t("save")}
            </button>
          </form>
        ) : null}

        {tab === "products" ? (
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <form onSubmit={submitProduct} className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-3xl font-black">{t("manageProducts")}</h2>
                <button type="button" onClick={resetProduct} className="rounded-full border px-4 py-2 font-bold">{t("resetForm")}</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input required className="input" placeholder="Name EN" value={product.name.en} onChange={(event) => setProduct({ ...product, name: updateText(product.name, "en", event.target.value) })} />
                <input required className="input" placeholder="Name Dari" value={product.name.fa} onChange={(event) => setProduct({ ...product, name: updateText(product.name, "fa", event.target.value) })} />
                <input required className="input" placeholder="Name Pashto" value={product.name.ps} onChange={(event) => setProduct({ ...product, name: updateText(product.name, "ps", event.target.value) })} />
                <input required className="input" placeholder={t("brand")} value={product.brand} onChange={(event) => setProduct({ ...product, brand: event.target.value })} />

                <select className="input" value={product.categoryId} onChange={(event) => setProduct({ ...product, categoryId: event.target.value })}>
                  {categories.map((item) => <option key={item.id} value={item.id}>{text(item.name)}</option>)}
                </select>

                <select className="input" value={product.gender} onChange={(event) => setProduct({ ...product, gender: event.target.value as Gender })}>
                  {genderKeys.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </select>

                <select className="input" value={product.scentFamily} onChange={(event) => setProduct({ ...product, scentFamily: event.target.value })}>
                  {scentFamilies.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </select>

                <input className="input" placeholder="Concentration" value={product.concentration} onChange={(event) => setProduct({ ...product, concentration: event.target.value })} />
                <input className="input md:col-span-2" placeholder="Sizes 50ml:84:10, 100ml:145:20" value={sizes} onChange={(event) => setSizes(event.target.value)} />
                <input className="input" placeholder={t("topNotes")} value={top} onChange={(event) => setTop(event.target.value)} />
                <input className="input" placeholder={t("heartNotes")} value={heart} onChange={(event) => setHeart(event.target.value)} />
                <input className="input md:col-span-2" placeholder={t("baseNotes")} value={base} onChange={(event) => setBase(event.target.value)} />
                <input className="input md:col-span-2" placeholder="Image URLs" value={images} onChange={(event) => setImages(event.target.value)} />
                <textarea required className="input" placeholder="Description EN" value={product.description.en} onChange={(event) => setProduct({ ...product, description: updateText(product.description, "en", event.target.value) })} />
                <textarea required className="input" placeholder="Description Dari" value={product.description.fa} onChange={(event) => setProduct({ ...product, description: updateText(product.description, "fa", event.target.value) })} />
                <textarea required className="input md:col-span-2" placeholder="Description Pashto" value={product.description.ps} onChange={(event) => setProduct({ ...product, description: updateText(product.description, "ps", event.target.value) })} />

                <label className="font-bold"><input type="checkbox" checked={product.featured} onChange={(event) => setProduct({ ...product, featured: event.target.checked })} /> {t("featuredProduct")}</label>
                <label className="font-bold"><input type="checkbox" checked={product.active} onChange={(event) => setProduct({ ...product, active: event.target.checked })} /> {t("active")}</label>
              </div>

              <button className="mt-5 rounded-full bg-stone-950 px-7 py-4 font-black text-white"><Save className="inline h-4 w-4" /> {t("save")}</button>
            </form>

            <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-black">{t("productList")}</h2>
              <div className="space-y-3">
                {products.map((item) => (
                  <div key={item.id} className="rounded-3xl border p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <strong>{text(item.name)}</strong>
                        <p className="text-sm text-stone-500">{item.brand} · {item.sizes.map((size) => `${size.label} ${money(size.price)}`).join(" · ")}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => editProduct(item)} className="rounded-full bg-amber-50 p-3 text-amber-800"><Edit className="h-4 w-4" /></button>
                        <button type="button" onClick={() => confirmDelete(() => deleteProduct(item.id))} className="rounded-full bg-red-50 p-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "categories" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={submitCategory} className="rounded-[2rem] border bg-white p-6">
              <h2 className="text-3xl font-black">{t("manageCategories")}</h2>
              <div className="mt-5 space-y-4">
                <input required className="input" placeholder="Name EN" value={category.name.en} onChange={(event) => setCategory({ ...category, name: updateText(category.name, "en", event.target.value) })} />
                <input required className="input" placeholder="Name Dari" value={category.name.fa} onChange={(event) => setCategory({ ...category, name: updateText(category.name, "fa", event.target.value) })} />
                <input required className="input" placeholder="Name Pashto" value={category.name.ps} onChange={(event) => setCategory({ ...category, name: updateText(category.name, "ps", event.target.value) })} />
                <input className="input" placeholder="slug" value={category.slug} onChange={(event) => setCategory({ ...category, slug: event.target.value })} />
                <button className="rounded-full bg-stone-950 px-6 py-3 font-bold text-white">{t("save")}</button>
              </div>
            </form>

            <div className="space-y-3">
              {categories.map((item) => (
                <div key={item.id} className="flex justify-between rounded-3xl border bg-white p-4">
                  <div>
                    <strong>{text(item.name)}</strong>
                    <p className="text-sm text-stone-500">{item.slug}</p>
                  </div>
                  <button type="button" onClick={() => confirmDelete(() => deleteCategory(item.id))} className="text-red-600"><Trash2 /></button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "orders" ? (
          <section className="space-y-4">
            {orders.length ? orders.map((order) => (
              <div key={order.id} className="rounded-3xl border bg-white p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-xs font-bold uppercase text-amber-800">#{order.id.slice(0, 8)}</p>
                    <h3 className="font-black">{order.shippingAddress.fullName}</h3>
                    <p className="text-sm text-stone-500">{order.shippingAddress.phone} · {order.shippingAddress.city} · {order.paymentMethod}</p>
                    <p className="mt-2 text-sm text-stone-600">{order.items.map((item) => `${item.name} (${item.size}) × ${item.quantity}`).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{money(order.totalAmount)}</p>
                    <select className="input mt-3" value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}>
                      {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )) : <p className="rounded-3xl bg-white p-8 text-center font-bold">{t("noOrders")}</p>}
          </section>
        ) : null}

        {tab === "reviews" ? (
          <section className="space-y-3">
            {reviews.length ? reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border bg-white p-5">
                <div className="flex justify-between gap-4">
                  <strong>{review.displayName} · ★ {review.rating}</strong>
                  <button type="button" onClick={() => confirmDelete(() => deleteReview(review.id))} className="text-red-600"><Trash2 /></button>
                </div>
                <p className="mt-2 text-sm">{review.comment}</p>
              </div>
            )) : <p className="rounded-3xl bg-white p-8 text-center font-bold">{t("noReviews")}</p>}
          </section>
        ) : null}

        {tab === "users" ? (
          <section className="grid gap-3">
            {users.map((user) => (
              <div key={user.uid} className="rounded-3xl border bg-white p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <strong>{user.displayName}</strong>
                    <p className="text-sm text-stone-500">{user.email} · {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <select className="input min-w-40" value={user.role} onChange={(event) => updateUserRole(user.uid, event.target.value as Role)}>
                      <option value="customer">{t("customer")}</option>
                      <option value="admin">{t("adminRole")}</option>
                    </select>
                    <button type="button" onClick={() => confirmDelete(() => deleteUser(user.uid))} className="rounded-full bg-red-50 p-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function LocalizedFields({ label, value, onChange, textarea = false }: { label: string; value: LocalizedText; onChange: (value: LocalizedText) => void; textarea?: boolean }) {
  const renderField = (lang: keyof LocalizedText, placeholder: string) => {
    if (textarea) {
      return (
        <textarea
          className="input min-h-24"
          placeholder={placeholder}
          value={value[lang]}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(updateText(value, lang, event.currentTarget.value))}
        />
      );
    }

    return (
      <input
        className="input"
        placeholder={placeholder}
        value={value[lang]}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(updateText(value, lang, event.currentTarget.value))}
      />
    );
  };

  return (
    <div className="rounded-3xl border p-4">
      <p className="mb-3 font-black">{label}</p>
      <div className="space-y-3">
        {renderField("en", "English")}
        {renderField("fa", "دری")}
        {renderField("ps", "پښتو")}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
      <Icon className="h-7 w-7 text-amber-800" />
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
