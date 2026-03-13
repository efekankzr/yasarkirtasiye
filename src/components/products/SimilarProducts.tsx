import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import { apiClient } from "@/lib/api/axios";
import { getImageUrl } from "@/lib/utils";

interface ProductImage {
  id: string;
  imagePath: string;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string;
  brandName?: string;
  categoryName: string;
  images?: ProductImage[];
}

interface SimilarProductsProps {
  productId: string;
  categoryId: string;
}

export function SimilarProducts({ productId, categoryId }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/products/${productId}/similar?categoryId=${categoryId}&count=4`);
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Benzer ürünler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId && categoryId) {
      fetchSimilar();
    }
  }, [productId, categoryId]);

  if (loading) {
    return (
      <div className="mt-16 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
        Benzer/Alternatif Ürünler
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(p => {
          const mainImage = p.images && p.images.length > 0
            ? [...p.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]
            : null;

          return (
            <Link href={`/product/${p.id}`} key={p.id} className="block group">
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center relative overflow-hidden shrink-0">
                  {mainImage ? (
                    <Image
                      src={getImageUrl(mainImage.imagePath)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Layers className="h-10 w-10 text-zinc-300" />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {p.brandName && (
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                      {p.brandName}
                    </div>
                  )}
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-red-900 transition-colors">
                    {p.name}
                  </h4>
                  <div className="mt-auto pt-3">
                     <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full inline-block">
                       {p.categoryName}
                     </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
