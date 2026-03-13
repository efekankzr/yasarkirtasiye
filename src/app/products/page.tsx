"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/axios";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, PackageSearch, Layers, ShoppingCart, Info, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useDebounce } from "@/hooks/useDebounce";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  barcode?: string;
  categoryName: string;
  isFeatured: boolean;
  images?: { id: string; imagePath: string; displayOrder: number }[];
  brandId?: string;
  brandName?: string;
}

interface PaginatedResponse {
  data: Product[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const filterKey = searchParams.get("filter");
  const searchKey = searchParams.get("search");
  const brandParam = searchParams.get("brandId");

  const [productsData, setProductsData] = useState<PaginatedResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState("905551234567");
  
  const { isAuthenticated } = useAuthStore();
  const { addItem, setCartOpen } = useCartStore();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam || "");
  const [isBestSeller, setIsBestSeller] = useState<boolean>(filterKey === "bestsellers");
  const [localSearch, setLocalSearch] = useState<string>(searchKey || "");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadSettings();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, selectedBrand, isBestSeller, debouncedSearch]);

  const loadCategories = async () => {
    try {
      const res = await apiClient.get("/categories?pageNumber=1&pageSize=100");
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBrands = async () => {
    try {
      const res = await apiClient.get("/brands");
      setBrands(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?pageNumber=${page}&pageSize=12`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (selectedBrand) url += `&brandId=${selectedBrand}`;
      if (isBestSeller) url += `&isBestSeller=true`;
      if (debouncedSearch) url += `&searchTerm=${encodeURIComponent(debouncedSearch)}`;

      const res = await apiClient.get(url);
      // Backend her zaman PagedResult<T> { data, totalRecords, pageNumber, pageSize, totalPages } döndürür
      if (res.data && typeof res.data.totalRecords === "number") {
        setProductsData(res.data);
      } else {
        setProductsData({ data: [], pageNumber: 1, pageSize: 12, totalRecords: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    setIsMobileFiltersOpen(false);
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setPage(1);
    setIsMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setIsBestSeller(false);
    if (searchKey || brandParam) {
      window.history.replaceState(null, "", "/products");
    }
    setPage(1);
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PublicNavbar />
      
      <main className="flex-1 container px-4 sm:px-6 lg:px-8 py-8 md:py-12 mx-auto mt-16">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {debouncedSearch ? `"${debouncedSearch}" Arama Sonuçları` : "Tüm Ürünler"}
            </h1>
            <p className="text-zinc-500 mt-2">
              {debouncedSearch ? "Aradığınız kriterlere uygun ürünler listeleniyor." : "Mağazamızdaki tüm kırtasiye ürünlerini inceleyin."}
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto md:mx-0 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
             <Input 
                type="text"
                placeholder="Ürün adı, marka veya barkod ara..."
                className="pl-9 w-full bg-white dark:bg-zinc-900"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setPage(1);
                  // Update URL parameter
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set("search", e.target.value);
                  } else {
                    url.searchParams.delete("search");
                  }
                  window.history.replaceState({}, '', url);
                }}
             />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" /> Filtrele
            </Button>
            
            {/* Desktop Quick Toggles */}
            <div className="hidden md:flex bg-white dark:bg-zinc-900 rounded-md border p-1 border-zinc-200 dark:border-zinc-800">
               <button 
                  onClick={() => { setIsBestSeller(false); setPage(1); }}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${!isBestSeller ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700'}`}
               >
                 Tümü
               </button>
               <button 
                  onClick={() => { setIsBestSeller(true); setPage(1); }}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${isBestSeller ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700'}`}
               >
                 Çok Satanlar
               </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) & Drawer (Mobile) */}
          <div className={`
             fixed inset-0 z-50 bg-white dark:bg-zinc-950 p-6 overscroll-y-contain overflow-y-auto transition-transform duration-300 transform
             md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:z-auto md:w-64 md:shrink-0 md:p-0 md:bg-transparent md:block md:translate-x-0
             ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between md:hidden mb-6">
              <h2 className="text-xl font-bold">Filtreler</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 tracking-wider uppercase">
                  Kategoriler
                </h3>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Kategori ara..." 
                    className="h-8 pl-8 text-xs bg-white dark:bg-zinc-900" 
                    value={categorySearch} 
                    onChange={(e) => setCategorySearch(e.target.value)} 
                  />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === "" 
                        ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    Tüm Kategoriler
                  </button>
                  {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === cat.id 
                          ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300" 
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 tracking-wider uppercase">
                    Markalar
                  </h3>
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <Input 
                      placeholder="Marka ara..." 
                      className="h-8 pl-8 text-xs bg-white dark:bg-zinc-900" 
                      value={brandSearch} 
                      onChange={(e) => setBrandSearch(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    <button
                      onClick={() => handleBrandChange("")}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedBrand === ""
                          ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      Tüm Markalar
                    </button>
                    {brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandChange(brand.id)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedBrand === brand.id
                            ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 md:hidden">
                 <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 tracking-wider uppercase">
                   Seçenekler
                 </h3>
                 <label className="flex items-center space-x-3 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span>Sadece Çok Satanları Göster</span>
                 </label>
              </div>

              {(selectedCategory || isBestSeller) && (
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <Button variant="outline" className="w-full text-xs" onClick={resetFilters}>
                    <X className="w-3 h-3 mr-2" /> Filtreleri Temizle
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Overlays for mobile */}
          {isMobileFiltersOpen && (
             <div 
               className="fixed inset-0 bg-black/40 z-40 md:hidden" 
               onClick={() => setIsMobileFiltersOpen(false)} 
             />
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsData.data.map((p) => {
                    const mainImage =
              p.images && p.images.length > 0
                ? [...p.images].sort(
                    (a, b) => a.displayOrder - b.displayOrder,
                  )[0]
                : null;

            return (
              <Link href={`/product/${p.id}`} key={p.id} className="block group">
                <Card className="overflow-hidden h-full hover:shadow-xl transition-all border-zinc-200/50 dark:border-zinc-800/50 flex flex-col bg-white dark:bg-zinc-900 rounded-xl">
                  <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center relative overflow-hidden shrink-0">
                    {mainImage ? (
                      <Image
                        src={mainImage.imagePath}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                  <CardContent className="p-0 flex-1 flex flex-col gap-2">
                    {/* Boş alan veya başka bilgiler için ayrılabilir */}
                  </CardContent>
                          <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
                            {isAuthenticated ? (
                               <div className="flex gap-2 w-full">
                                  <span className="inline-flex items-center justify-center px-2 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors rounded-md text-xs font-semibold flex-1 text-center">
                                    <Info className="w-4 h-4 mr-1 hidden sm:block" /> İncele
                                  </span>
                                  <button
                                     onClick={(e) => {
                                        e.preventDefault()
                                        addItem({
                                           productId: p.id,
                                           name: p.name,
                                           barcode: p.barcode,
                                           imageUrl: mainImage?.imagePath,
                                           quantity: 1
                                        })
                                        setCartOpen(true)
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
                                        e.preventDefault()
                                        let clean = whatsappPhone
                                        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(`Merhaba, "${p.name}" ürünü hakkında bilgi almak istiyorum.`)}`, "_blank")
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
                    )
                  })}
                </div>

                {/* Pagination */}
                {productsData.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Önceki
                    </Button>
                    <span className="text-sm font-medium px-4 text-zinc-500">
                      Sayfa {page} / {productsData.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                      disabled={page === productsData.totalPages}
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                 <PackageSearch className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Ürün Bulunamadı</h3>
                 <p className="text-zinc-500 mt-1">Seçili filtrelere uygun ürün elimizde mevcut değil.</p>
                 <Button variant="outline" className="mt-6" onClick={resetFilters}>Aramayı Temizle</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
