"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-navy text-xl font-semibold">Something went wrong</h2>
      <button
        onClick={reset}
        className="bg-gold hover:bg-gold-dark cursor-pointer rounded-lg px-6 py-2 text-white transition-colors duration-200"
      >
        Try again
      </button>
    </div>
  );
}
