export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="ડેશબોર્ડ લોડ થઈ રહ્યું છે"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <p className="text-sm text-slate-600" role="status">
        અરજીઓ લોડ થઈ રહી છે…
      </p>
      <div className="mt-5 grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="h-24 rounded-xl border border-slate-200 bg-white"
            key={index}
          />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </main>
  );
}
