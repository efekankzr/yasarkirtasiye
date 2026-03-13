"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react"
import { apiClient } from "@/lib/api/axios"

interface SiteSettings {
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  instagramUrl: string | null
}

export function PublicFooter() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    // We don't want to block rendering on the footer fetching, so we just run it asynchronously
    apiClient.get("/settings")
      .then(res => setSettings(res.data))
      .catch(err => console.error("Footer ayarları çekilemedi:", err))
  }, [])

  return (
    <footer className="w-full border-t border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src="/logo.png" alt="Yaşar Kırtasiye" className="h-12 w-auto" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-balance">
              {settings?.description || "Kaliteli kırtasiye malzemeleri, toptan kırtasiye çözümleri ve daha fazlası. Geniş ürün yelpazemiz için bizimle iletişime geçin."}
            </p>
          </div>
          
          {/* Social Media Links (Replaced Quick Links) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Bizi Takip Edin</h4>
            <div className="flex space-x-4 text-zinc-600 dark:text-zinc-400">
              {settings?.facebookUrl ? (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              ) : (
                <span className="opacity-50 cursor-not-allowed" title="Facebook adresi eklenmemiş"><Facebook className="w-6 h-6" /></span>
              )}
              {settings?.twitterUrl ? (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              ) : (
                <span className="opacity-50 cursor-not-allowed" title="Twitter adresi eklenmemiş"><Twitter className="w-6 h-6" /></span>
              )}
              {settings?.instagramUrl ? (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              ) : (
                <span className="opacity-50 cursor-not-allowed" title="Instagram adresi eklenmemiş"><Instagram className="w-6 h-6" /></span>
              )}
            </div>
          </div>
          
          {/* Dynamic Contact Information */}
          <div id="contact" className="space-y-4">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">İletişim</h4>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start space-x-3">
                 <Phone className="w-5 h-5 shrink-0" />
                 <span>{settings?.phone || "0 (555) 123 45 67"}</span>
              </li>
              <li className="flex items-start space-x-3">
                 <Mail className="w-5 h-5 shrink-0" />
                 <span>{settings?.email || "info@yasarkirtasiye.com"}</span>
              </li>
              <li className="flex items-start space-x-3">
                 <MapPin className="w-5 h-5 shrink-0" />
                 <span>{settings?.address || "Merkez Mah. Atatürk Cad. No:1 Ankara/Türkiye"}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Copyright */}
        <div className="text-center border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8 text-sm text-zinc-500 flex flex-col items-center justify-center space-y-2">
          <p>© {new Date().getFullYear()} Yaşar Kırtasiye Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
