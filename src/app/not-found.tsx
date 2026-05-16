import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-gray-600">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Back to Home
      </Link>
    </main>
  );
}
