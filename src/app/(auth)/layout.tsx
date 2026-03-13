import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Yaşar Kırtasiye | Giriş",
  description: "Yönetim Paneline Giriş Yapın",
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative p-4">
      
      {/* Back to Home Button placed at top-left */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-red-900 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-200">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
      </div>

      {/* Decorative Background: Light Bordo and Mavi blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-red-900/5 blur-[120px] rounded-full" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  )
}
