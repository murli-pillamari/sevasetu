"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-950">
        માહિતી લોડ થઈ શકી નથી
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        ડેટાબેઝ સાથે જોડાણ અથવા વિનંતીમાં સમસ્યા આવી. થોડી વાર પછી ફરી પ્રયાસ કરો.
      </p>
      <button
        className="mt-6 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
        onClick={() => reset()}
        type="button"
      >
        ફરી પ્રયાસ કરો (Try again)
      </button>
    </main>
  );
}
