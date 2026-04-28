"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="px-4 py-20 text-center">
      <h1 className="text-4xl font-black text-stone-950">Something went wrong</h1>
      <p className="mt-3 text-stone-600">{error.message || "Unexpected application error."}</p>
      <button onClick={reset} className="mt-6 rounded-full bg-stone-950 px-6 py-3 font-bold text-white">Try again</button>
    </main>
  );
}
