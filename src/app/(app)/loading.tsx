export default function AppLoading() {
  return <div className="animate-pulse" role="status" aria-live="polite">
    <span className="sr-only">Loading page…</span>
    <div className="h-9 w-56 rounded-xl bg-slate-200" />
    <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-200" />
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-2xl border border-slate-200 bg-white" />)}
    </div>
    <div className="mt-6 h-72 rounded-2xl border border-slate-200 bg-white" />
  </div>
}
