import BookingForm from "@/components/shared/BookingForm";

export default function Home() {
  return (
    <div className="bg-background min-h-screen font-sans">
      <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-10">
        <div className="mb-8 flex items-center justify-center gap-2">
          <svg
            className="text-navy h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="12" cy="14" r="8" />
            <path d="M12 14l3-5" strokeLinecap="round" />
            <path d="M8 7.5l1.5 1" strokeLinecap="round" strokeWidth={1} />
            <path d="M16 7.5l-1.5 1" strokeLinecap="round" strokeWidth={1} />
            <path d="M5.5 12H7" strokeLinecap="round" strokeWidth={1} />
            <path d="M17 12h1.5" strokeLinecap="round" strokeWidth={1} />
            <path d="M12 19v1.5" strokeLinecap="round" strokeWidth={1} />
          </svg>
          <span className="text-navy text-xl font-bold tracking-tight">
            ExampleIQ
          </span>
        </div>
        <h1 className="text-navy mb-8 text-2xl font-semibold">
          Let&apos;s get you on your way!
        </h1>
        <BookingForm />
      </main>
    </div>
  );
}
