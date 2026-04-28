"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import type { ShippingAddress } from "@/types";

export function ProfilePage() {
  const { currentUser, orders, t, money, logout, saveAddress } = useApp();
  const [addressForm, setAddressForm] = useState<ShippingAddress>({ fullName: currentUser?.displayName || "", phone: "", city: "", address: "" });

  if (!currentUser) {
    return (
      <main className="px-4 py-16 text-center">
        <h1 className="text-3xl font-black">{t("profile")}</h1>
        <p className="mt-3 text-stone-600">Login to view profile and orders.</p>
        <Link href="/login" className="mt-5 inline-block rounded-full bg-stone-950 px-6 py-3 font-bold text-white">{t("login")}</Link>
      </main>
    );
  }

  const myOrders = currentUser.role === "admin" ? orders : orders.filter((order) => order.userId === currentUser.uid || order.userId === "guest");

  const submitAddress = (event: React.FormEvent) => {
    event.preventDefault();
    saveAddress(addressForm);
    setAddressForm({ fullName: currentUser.displayName, phone: "", city: "", address: "" });
  };

  return (
    <main className="px-4 py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-[2rem] bg-stone-950 p-8 text-white">
          <h1 className="text-4xl font-black">{currentUser.displayName}</h1>
          <p className="mt-2 text-stone-300">{currentUser.email} · {currentUser.role}</p>
          <button onClick={logout} className="mt-5 rounded-full bg-white px-5 py-3 font-bold text-stone-950">{t("logout")}</button>
        </aside>

        <div className="space-y-8">
          <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black">{t("savedAddresses")}</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(currentUser.addresses || []).map((address, index) => (
                <div key={`${address.phone}-${index}`} className="rounded-3xl border p-4">
                  <strong>{address.fullName}</strong>
                  <p className="mt-1 text-sm text-stone-500">{address.phone}</p>
                  <p className="mt-1 text-sm text-stone-600">{address.city} · {address.address}</p>
                </div>
              ))}
            </div>

            <form onSubmit={submitAddress} className="mt-6 grid gap-4 md:grid-cols-2">
              <input required className="input" placeholder={t("fullName")} value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} />
              <input required className="input" placeholder={t("phone")} value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} />
              <input required className="input" placeholder={t("city")} value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} />
              <input required className="input" placeholder={t("address")} value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} />
              <button className="rounded-full bg-stone-950 px-6 py-3 font-bold text-white md:col-span-2">{t("addAddress")}</button>
            </form>
          </section>

          <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black">{t("orderHistory")}</h2>
            <div className="mt-5 space-y-4">
              {myOrders.length ? myOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border p-5">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <p className="text-xs font-bold uppercase text-amber-800">#{order.id.slice(0, 8)}</p>
                      <h3 className="font-black">{order.items.map((item) => `${item.name} (${item.size}) × ${item.quantity}`).join(", ")}</h3>
                      <p className="mt-1 text-sm text-stone-500">{order.shippingAddress.city} · {order.status} · {order.paymentStatus}</p>
                    </div>
                    <p className="text-2xl font-black">{money(order.totalAmount)}</p>
                  </div>
                </div>
              )) : <p className="rounded-3xl bg-stone-50 p-6 text-stone-500">{t("noOrders")}</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
