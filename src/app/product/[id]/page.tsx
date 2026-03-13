"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, Layers, Image as ImageIcon, ShoppingCart } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { useCartStore } from "@/store/useCartStore"
import { apiClient } from "@/lib/api/axios"
import { PublicNavbar } from "@/components/layout/PublicNavbar"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import { SimilarProducts } from "@/components/products/SimilarProducts"

interface ProductImage {
  id: string
  imagePath: string
  displayOrder: number
}

interface Product {
  id: string
  name: string
  description: string
  barcode?: string
  categoryId: string
  categoryName: string
  brandName?: string
  isBestSeller: boolean
  packageQuantity: number
  boxQuantity: number
  images?: ProductImage[]
}

interface SiteSettings {
  phone: string | null
  address: string | null
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const productId = unwrappedParams.id

  const [product, setProduct] = useState<Product | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mainImageSrc, setMainImageSrc] = useState<string | null>(null)

  const { isAuthenticated } = useAuthStore()
  const { addItem, setCartOpen } = useCartStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productRes, settingsRes] = await Promise.all([
          apiClient.get(`/products/${productId}`),
          apiClient.get("/settings").catch(() => null) // Settings might fail, don't crash the page
        ])

        if (productRes.data) {
          setProduct(productRes.data)
          // Set initial main image
          if (productRes.data.images && productRes.data.images.length > 0) {
            const sorted = [...productRes.data.images].sort((a,b) => a.displayOrder - b.displayOrder)
            setMainImageSrc(sorted[0].imagePath)
          }
        }
        
        if (settingsRes && settingsRes.data) {
          setSettings(settingsRes.data)
        }
      } catch (error) {
        console.error("Detaylar alınamadı:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center">
        <PublicNavbar />
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <PublicFooter />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center">
        <PublicNavbar />
        <div className="flex-1 flex flex-col justify-center items-center w-full space-y-4">
          <h2 className="text-2xl font-bold text-zinc-700">Ürün bulunamadı</h2>
          <Button asChild variant="outline">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Anasayfaya Dön</Link>
          </Button>
        </div>
        <PublicFooter />
      </div>
    )
  }

  const sortedImages = product.images 
    ? [...product.images].sort((a,b) => a.displayOrder - b.displayOrder)
    : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <PublicNavbar />
      
      <main className="flex-1 w-full flex justify-center py-12 md:py-20 px-4">
        <div className="container max-w-6xl">
          {/* Breadcrumb / Geri Dön */}
          <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-red-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Ürünlere Dön
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Sol: Görsel Galerisi */}
            <div className="space-y-4 lg:sticky lg:top-24">
              {/* Ana Görsel */}
              <div className="aspect-square bg-white rounded-2xl border border-zinc-200 flex items-center justify-center overflow-hidden p-0 shadow-sm relative">
                {mainImageSrc ? (
                  <Image src={mainImageSrc} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="text-center text-zinc-400">
                    <Layers className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Görsel Bulunmuyor</p>
                  </div>
                )}
              </div>
              
              {/* Küçük Görseller (Thumbnails) */}
              {sortedImages.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {sortedImages.map((img) => (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => setMainImageSrc(img.imagePath)}
                      className={`aspect-square bg-white rounded-lg border overflow-hidden p-0 transition-all ${
                        mainImageSrc === img.imagePath 
                          ? "border-red-900 ring-2 ring-red-900/20" 
                          : "border-zinc-200 hover:border-red-300"
                      }`}
                    >
                      <div className="aspect-square bg-white rounded-lg border overflow-hidden relative">
                        <Image src={img.imagePath} alt="Thumbnail" fill sizes="10vw" className="object-cover rounded-md" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ: Ürün Detayları */}
            <div className="flex flex-col space-y-8">
              {/* Content Context & Title */}
              <div className="flex flex-col border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
                {product.brandName && (
                  <div className="text-xl md:text-2xl font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                    {product.brandName}
                  </div>
                )}
                <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mb-4">
                  {product.name}
                </h1>
                <div className="inline-flex items-center text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1.5 w-max font-medium text-zinc-700 dark:text-zinc-300">
                  {product.categoryName}
                </div>
              </div>

              {product.barcode && (
                <div className="text-sm font-medium text-zinc-500 mt-2">
                  Stok Kodu / Barkod: <span className="text-zinc-900">{product.barcode}</span>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 font-medium">Paket İçi Adet</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{product.packageQuantity}</div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs text-zinc-500 font-medium">Koli İçi Adet</div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{product.boxQuantity}</div>
                </div>
              </div>

              <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>

              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-6">
                <div>
                   <h3 className="text-lg font-bold text-zinc-900 flex items-center">
                     Toptan Alım & Stok Durumu
                   </h3>
                   <p className="text-sm text-zinc-500 mt-2">
                     Kurumsal fiyatlandırma ve mevcut stok durumu için sitemiz üzerinden iletişime geçebilirsiniz.
                   </p>
                </div>
                
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center text-sm font-medium text-zinc-700">
                    <Phone className="w-5 h-5 mr-3 text-red-900" />
                    {settings?.phone || "0 (555) 123 45 67"}
                  </div>
                  <div className="flex items-center text-sm font-medium text-zinc-700">
                    <MapPin className="w-5 h-5 mr-3 text-red-900" />
                    <span className="line-clamp-2">{settings?.address || "Merkez Mah. Atatürk Cad. No:1 Ankara/Türkiye"}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Button 
                    className="w-full text-base h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" 
                    onClick={() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        barcode: product.barcode,
                        imageUrl: mainImageSrc || undefined,
                        quantity: 1
                      })
                      setCartOpen(true)
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Teklif Sepetine Ekle
                  </Button>
                ) : (
                  <Button 
                    className="w-full text-base h-12 bg-red-900 hover:bg-red-800 text-white font-semibold" 
                    onClick={() => {
                        let clean = settings?.phone?.replace(/\D/g, '') || "905551234567";
                        if (clean.startsWith('0')) clean = '90' + clean.substring(1);
                        else if (clean.length === 10) clean = '90' + clean;
                        window.open(`https://wa.me/${clean}`, '_blank');
                    }}
                  >
                    WhatsApp'tan Bilgi Al
                  </Button>
                )}
              </div>
            </div>
          </div>

          <SimilarProducts productId={product.id} categoryId={product.categoryId} />
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
