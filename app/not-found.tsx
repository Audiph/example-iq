import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-navy text-xl font-semibold">Page not found</h2>
      <p className="text-blue-gray text-sm">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="bg-gold hover:bg-gold-dark cursor-pointer rounded-lg px-6 py-2 text-white transition-colors duration-200"
      >
        Go home
      </Link>
    </div>
  );
}
