"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { useApp } from "@/lib/store";
import type { ShippingAddress } from "@/types";

export function CartPage() {
  const {
    cart,
    getProduct,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    settings,
    money,
    t,
    text,
    currentUser,
    isFirebaseEnabled
  } = useApp();

  const savedAddresses = currentUser?.addresses || [];

  const [form, setForm] = useState({
    fullName: currentUser?.displayName || "",
    phone: savedAddresses[0]?.phone || "",
    city: savedAddresses[0]?.city || "",
    address: savedAddresses[0]?.address || "",
    paymentMethod: "cash" as "cash" | "card" | "manual"
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const lines = cart
    .map((item) => {
      const product = getProduct(item.productId);
      const size = product?.sizes.find((row) => row.label === item.sizeLabel);
      return product && size ? { ...item, product, size } : null;
    })
    .filter(Boolean) as Array<{
      productId: string;
      sizeLabel: string;
      quantity: number;
      product: NonNullable<ReturnType<typeof getProduct>>;
      size: { label: string; price: number; stock: number };
    }>;

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.size.price * line.quantity, 0),
    [lines]
  );

  const hasCartItems = lines.length > 0;
  const delivery = hasCartItems ? settings.deliveryFee : 0;
  const total = subtotal + delivery;

  const applySavedAddress = (address: ShippingAddress) => {
    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      address: address.address
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      if (!hasCartItems) return;

      if (isFirebaseEnabled && !currentUser) {
        setMessageType("error");
        setMessage("Please login before checkout because Firebase orders require a signed-in customer.");
        return;
      }

      const order = placeOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          address: form.address.trim()
        },
        paymentMethod: form.paymentMethod
      });

      setMessageType("success");
      setMessage(`Order ${order.id.slice(0, 8)} created successfully.`);

      setForm({
        fullName: currentUser?.displayName || "",
        phone: "",
        city: "",
        address: "",
        paymentMethod: "cash"
      });
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    }
  };

  return (
    <main className="px-4 py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <h1 className="mb-6 text-4xl font-black text-stone-950">{t("cart")}</h1>

          {!hasCartItems ? (
            <div className="rounded-3xl bg-amber-50 p-8 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-amber-200 bg-white text-amber-900 shadow-sm">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <p className="font-bold text-stone-800">{t("emptyCart")}</p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-3 text-sm font-black text-amber-950 shadow-sm transition hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 hover:shadow-md"
              >
                <ShoppingBag className="h-4 w-4" />
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => {
                const isMaxQuantity = line.quantity >= line.size.stock;

                return (
                  <div
                    key={`${line.productId}-${line.sizeLabel}`}
                    className="grid gap-4 rounded-3xl border border-stone-200 p-4 md:grid-cols-[120px_1fr_auto]"
                  >
                    <div className="h-28 overflow-hidden rounded-2xl">
                      <ProductImage src={line.product.images[0]} alt={text(line.product.name)} />
                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-amber-800">
                        {line.product.brand}
                      </p>

                      <h2 className="text-2xl font-black text-stone-950">
                        {text(line.product.name)}
                      </h2>

                      <p className="mt-2 text-sm text-stone-500">
                        {line.size.label} · {money(line.size.price)} · {line.size.stock}{" "}
                        {t("stock")}
                      </p>

                      {isMaxQuantity ? (
                        <p className="mt-2 text-xs font-bold text-amber-700">
                          Maximum stock selected
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <div className="flex items-center rounded-full border border-stone-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              line.productId,
                              line.sizeLabel,
                              Math.max(1, line.quantity - 1)
                            )
                          }
                          className="p-2 text-stone-700 transition hover:text-amber-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-10 text-center font-black text-stone-950">
                          {line.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={isMaxQuantity}
                          onClick={() =>
                            updateCartQuantity(
                              line.productId,
                              line.sizeLabel,
                              Math.min(line.size.stock, line.quantity + 1)
                            )
                          }
                          className="p-2 text-stone-700 transition hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(line.productId, line.sizeLabel)}
                        className="rounded-full bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {hasCartItems ? (
          <aside className="h-fit rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-stone-950">{t("checkout")}</h2>

            <div className="my-6 space-y-3 rounded-3xl bg-stone-50 p-5">
              <div className="flex justify-between text-sm font-bold text-stone-700">
                <span>{t("subtotal")}</span>
                <span>{money(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-stone-700">
                <span>{t("delivery")}</span>
                <span>{money(delivery)}</span>
              </div>

              <div className="flex justify-between border-t border-stone-300 pt-3 text-xl font-black text-stone-950">
                <span>{t("total")}</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {isFirebaseEnabled && !currentUser ? (
              <div className="mb-4 rounded-3xl bg-red-50 p-4 text-sm font-bold text-red-700">
                Please login before checkout because Firebase orders require a signed-in customer.
                <Link href="/login" className="mt-2 block underline">
                  Go to login
                </Link>
              </div>
            ) : null}

            {savedAddresses.length ? (
              <div className="mb-4 rounded-3xl bg-amber-50 p-4">
                <p className="mb-2 text-sm font-black text-stone-800">
                  {t("savedAddresses")}
                </p>

                <div className="space-y-2">
                  {savedAddresses.map((address, index) => (
                    <button
                      key={`${address.phone}-${index}`}
                      type="button"
                      onClick={() => applySavedAddress(address)}
                      className="block w-full rounded-2xl bg-white px-3 py-2 text-left text-sm font-semibold text-stone-800 transition hover:bg-amber-100"
                    >
                      {address.city} · {address.address}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
              <input
                required
                className="input"
                placeholder={t("fullName")}
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />

              <input
                required
                className="input"
                placeholder={t("phone")}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />

              <input
                required
                className="input"
                placeholder={t("city")}
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />

              <textarea
                required
                className="input min-h-28"
                placeholder={t("address")}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />

              <select
                className="input"
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm({
                    ...form,
                    paymentMethod: event.target.value as "cash" | "card" | "manual"
                  })
                }
              >
                <option value="cash">{t("cash")}</option>
                <option value="card">{t("demoPayment")}</option>
              </select>

              <button className="w-full rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 font-black text-amber-950 shadow-sm transition hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 hover:shadow-md">
                {t("placeOrder")}
              </button>
            </form>

            {message ? (
              <p
                className={[
                  "mt-4 rounded-2xl p-4 text-sm font-bold",
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                ].join(" ")}
              >
                {message}
              </p>
            ) : null}
          </aside>
        ) : (
          <aside className="h-fit rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-stone-950">{t("checkout")}</h2>

            <div className="my-6 space-y-3 rounded-3xl bg-stone-50 p-5">
              <div className="flex justify-between text-sm font-bold text-stone-700">
                <span>{t("subtotal")}</span>
                <span>{money(0)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-stone-700">
                <span>{t("delivery")}</span>
                <span>{money(0)}</span>
              </div>

              <div className="flex justify-between border-t border-stone-300 pt-3 text-xl font-black text-stone-950">
                <span>{t("total")}</span>
                <span>{money(0)}</span>
              </div>
            </div>

            <p className="rounded-3xl bg-amber-50 p-5 text-center text-sm font-bold text-stone-700">
              {t("emptyCart")}
            </p>

            <Link
              href="/products"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 text-sm font-black text-amber-950 shadow-sm transition hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("shopNow")}
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
}
