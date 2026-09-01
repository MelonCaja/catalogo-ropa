import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl">No encontramos esta página</h1>
      <p className="max-w-[45ch] text-sm text-ink-muted">
        Puede que la prenda ya no esté publicada o que el enlace esté incompleto.
      </p>
      <Link href="/" className="mt-2 text-sm underline underline-offset-4">
        Ir al catálogo
      </Link>
    </main>
  );
}
