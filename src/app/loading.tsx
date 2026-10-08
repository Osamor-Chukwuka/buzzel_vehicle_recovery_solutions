export default function Loading() {
  return <main className="grid min-h-dvh place-items-center bg-[#f5f7fa] px-4" role="status" aria-live="polite">
    <div className="text-center">
      <span className="mx-auto block size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--buzzel-red)]" aria-hidden="true" />
      <p className="mt-4 text-sm font-bold text-slate-700">Loading Buzzel…</p>
    </div>
  </main>
}
