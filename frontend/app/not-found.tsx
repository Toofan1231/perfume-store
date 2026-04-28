import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 py-20 text-center">
      <h1 className="text-5xl font-black text-stone-950">404</h1>
      <p className="mt-3 text-stone-600">This page could not be found.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-stone-950 px-6 py-3 font-bold text-white">Back home</Link>
    </main>
  );
}
