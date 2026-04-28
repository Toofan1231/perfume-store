export default function Loading() {
  return (
    <main className="grid min-h-[50vh] place-items-center px-4">
      <div className="rounded-[2rem] border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" />
        <p className="mt-4 font-bold text-stone-700">Loading...</p>
      </div>
    </main>
  );
}
