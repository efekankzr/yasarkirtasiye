"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Beklenmedik Bir Hata Oluştu
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Üzgünüz, bir şeyler ters gitti. Sayfayı yenilemeyi deneyin veya anasayfaya dönün.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-900 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
