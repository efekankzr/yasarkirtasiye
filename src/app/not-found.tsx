import Link from "next/link"
import { PackageSearch, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-900/10 text-red-900 mb-6">
          <PackageSearch className="w-10 h-10" />
        </div>

        <h1 className="text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Aradığınız sayfa kaldırılmış, taşınmış ya da hiç mevcut olmamış olabilir.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-900 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Anasayfaya Dön
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ürünlere Git
          </Link>
        </div>
      </div>
    </div>
  )
}
