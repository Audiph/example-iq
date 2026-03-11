export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="animate-fade-in flex items-center gap-1.5"
        style={{ animationDelay: "200ms" }}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            className="animate-loading-dot bg-gold block h-2 w-2 rounded-full"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
