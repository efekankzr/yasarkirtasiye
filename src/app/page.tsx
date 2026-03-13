"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api/axios";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  PackageSearch,
  Layers,
  ArrowRight,
  Tags,
  ShoppingCart,
  Info,
  MessageCircle,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

interface Product {
  id: string;
  name: string;
  description: string;
  barcode?: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  images?: { id: string; imagePath: string; displayOrder: number }[];
}

interface Brand {
  id: string;
  name: string;
  imageUrl?: string | null;
  isShowMainPage: boolean;
}

function ProductSlider({
  items,
  whatsappPhone,
}: {
  items: Product[];
  whatsappPhone: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const { addItem, setCartOpen } = useCartStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scrollRef.current && items.length > 0) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            const cardWidth = scrollRef.current.children[0]?.clientWidth || 280;
            scrollRef.current.scrollBy({
              left: cardWidth + 24,
              behavior: "smooth",
            });
          }
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        Bu kategoride henüz ürün bulunmamaktadır.
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x touch-pan-x"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {items.map((p) => {
        const mainImage =
          p.images && p.images.length > 0
            ? [...p.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]
            : null;

        return (
          <Link
            href={`/product/${p.id}`}
            key={p.id}
            className="block group w-[260px] sm:w-[280px] shrink-0 snap-start"
          >
            <Card className="overflow-hidden h-full hover:shadow-xl transition-all border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-white dark:bg-zinc-900">
              <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center relative overflow-hidden shrink-0">
                {mainImage ? (
                  <Image
                    src={mainImage.imagePath}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 260px, 280px"
                    className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Layers className="h-16 w-16 text-zinc-300" />
                )}
              </div>
              <CardHeader className="p-4 flex-none">
                <div className="flex flex-col gap-1.5 border-b border-zinc-100 dark:border-zinc-800/50 pb-3 mb-3">
                  {p.brandName && (
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {p.brandName}
                    </div>
                  )}
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </CardTitle>
                  <div className="inline-flex items-center text-[11px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-2.5 py-0.5 w-max font-medium text-zinc-600 dark:text-zinc-400">
                    {p.categoryName}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col gap-2"></CardContent>
              <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
                {isAuthenticated ? (
                  <div className="flex gap-2 w-full">
                    <span className="inline-flex items-center justify-center px-2 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors rounded-md text-xs font-semibold flex-1 text-center">
                      <Info className="w-4 h-4 mr-1 hidden sm:block" /> İncele
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          productId: p.id,
                          name: p.name,
                          barcode: p.barcode,
                          imageUrl: mainImage?.imagePath,
                          quantity: 1,
                        });
                        setCartOpen(true);
                      }}
                      className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md text-xs font-semibold shrink-0"
                      title="Sepete Ekle"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <span className="inline-flex items-center justify-center px-2 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors rounded-md text-xs font-semibold flex-1 text-center">
                      <Info className="w-4 h-4 mr-1 hidden sm:block" /> İncele
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        let clean = whatsappPhone;
                        window.open(
                          `https://wa.me/${clean}?text=${encodeURIComponent(`Merhaba, "${p.name}" ürünü hakkında bilgi almak istiyorum.`)}`,
                          "_blank",
                        );
                      }}
                      className="inline-flex items-center justify-center px-3 py-2 bg-[#25D366] text-white hover:bg-[#20BE5A] transition-colors rounded-md text-xs font-semibold shrink-0"
                      title="WhatsApp ile Sor"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState("905551234567");

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await apiClient.get("/settings");
      if (res.data?.phone) {
        let clean = res.data.phone.replace(/\D/g, "");
        if (clean.startsWith("0")) clean = "90" + clean.substring(1);
        else if (clean.length === 10) clean = "90" + clean;
        setWhatsappPhone(clean);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [bestRes, featRes, brandRes] = await Promise.all([
        apiClient.get("/products?isBestSeller=true&pageNumber=1&pageSize=8"),
        apiClient.get("/products?isFeatured=true&pageNumber=1&pageSize=12"),
        apiClient.get("/brands"),
      ]);

      const bItems =
        bestRes.data?.data || bestRes.data?.items || bestRes.data || [];
      const fItems =
        featRes.data?.data || featRes.data?.items || featRes.data || [];
      const brandItems = Array.isArray(brandRes.data) ? brandRes.data : [];

      if (Array.isArray(bItems)) setBestSellers(bItems);
      else setBestSellers([]);

      if (Array.isArray(fItems)) setFeatured(fItems);
      else setFeatured([]);

      const showcaseBrands = brandItems.filter((b: Brand) => b.isShowMainPage);
      setBrands(showcaseBrands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="w-full relative py-20 md:py-28 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-20 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px] left-1/4"></div>

        <div className="container px-4 md:px-6 z-10">
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 mb-6">
            ✨ Toptan Kırtasiye Merkezi
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto">
            Hızlı, Güvenilir ve Hesaplı <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Kırtasiye Çözümleri
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-zinc-600 dark:text-zinc-400 md:text-lg mb-8">
            Binlerce çeşit ürün, hızlı kargo ve sürekli stok avantajıyla
            kurumsal hizmet sunan Yaşar Kırtasiye ile işinizi hızlandırın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="px-8 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Link href="/products">Tüm Ürünleri Gör</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Markalar (Brand Showcase) */}
      <section className="w-full py-12 bg-white dark:bg-zinc-950 flex justify-center border-t border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 md:px-6">
          <div className="flex items-center mb-8 gap-3">
            <Tags className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Öne Çıkan Markalarımız
            </h2>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-14 w-40 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl shrink-0"
                ></div>
              ))}
            </div>
          ) : brands.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brandId=${b.id}`}
                  className="snap-start shrink-0 px-6 py-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800 transition-all rounded-xl font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-center min-w-[180px] h-[140px] flex items-center justify-center flex-col gap-3 group"
                >
                  {b.imageUrl ? (
                    <div className="flex-1 flex items-center justify-center w-full">
                      <Image
                        width={100}
                        height={64}
                        src={b.imageUrl}
                        alt={b.name}
                        className="max-h-16 w-auto max-w-full object-contain filter group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : null}
                  <span className="text-sm font-semibold">{b.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 text-sm">
              Vitrin markası bulunamadı.
            </div>
          )}
        </div>
      </section>

      {/* Çok Satanlar (Best Sellers) */}
      <section className="w-full py-16 bg-white dark:bg-zinc-900/50 flex justify-center border-t border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center">
                🔥 Çok Satanlar
              </h2>
              <p className="text-zinc-500 mt-2">
                Müşterilerimizin en çok tercih ettiği popüler ürünler.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 group">
              <Link href="/products?filter=bestsellers">
                Hepsini Gör{" "}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ProductSlider
                items={bestSellers}
                whatsappPhone={whatsappPhone}
              />
            )}
          </div>
        </div>
      </section>

      {/* Sizin İçin Seçtiklerimiz (Featured) */}
      <section className="w-full py-16 bg-zinc-50 dark:bg-zinc-950 flex justify-center border-t border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <PackageSearch className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-3xl font-bold tracking-tight">
              Sizin İçin Seçtiklerimiz
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-[600px]">
              Kayıtlı kullanıcılarımıza en uygun fiyatlarla geniş çeşit
              seçeneği. Satış fiyatları veya toplu alım avantajları için lütfen
              iletişime geçin.
            </p>
          </div>

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <ProductSlider items={featured} whatsappPhone={whatsappPhone} />
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
