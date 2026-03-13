"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { useCartStore } from "@/store/useCartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn, ShoppingBag, LayoutDashboard, LogOut, Menu, X, Search } from "lucide-react"

export function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { setCartOpen, getTotalItems } = useCartStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const isAdmin = user?.roles?.includes("Admin")
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const closeMenu = () => setMobileMenuOpen(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      closeMenu()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 dark:border-zinc-800/50 dark:bg-zinc-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group z-50">
          <img src="/logo.png" alt="Yaşar Kırtasiye" className="h-10 w-auto" />
        </Link>
        

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex relative w-64 items-center">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün, marka, barkod ara..." 
            className="pr-10 bg-zinc-50 border-zinc-200"
          />
          <button type="submit" className="absolute right-3 text-zinc-400 hover:text-red-900 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {mounted ? (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Sepetim
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
                {isAdmin && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Panel
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-zinc-600 dark:text-zinc-400">
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </Button>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm overflow-hidden">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <Button size="sm" className="bg-red-900 hover:bg-red-800 text-white shadow-sm gap-2">
                    <LogIn className="w-4 h-4" />
                    Giriş / Kayıt
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="w-24 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse"></div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center md:hidden z-50">
           <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-zinc-950 flex flex-col pt-20 px-6 gap-6 h-screen">

            <form onSubmit={handleSearch} className="relative w-full mt-2">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, barkod ara..." 
                className="pr-10 h-12 bg-zinc-50 dark:bg-zinc-900"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-4">
              {mounted && (
                isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm overflow-hidden">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                       </div>
                       <div>
                          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm text-zinc-500">{user?.email}</p>
                       </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-center gap-2 relative" 
                      size="lg"
                      onClick={() => {
                        setCartOpen(true)
                        closeMenu()
                      }}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Teklif Sepetim
                      {getTotalItems() > 0 && (
                        <span className="absolute top-2 right-4 bg-red-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {getTotalItems()}
                        </span>
                      )}
                    </Button>

                    {isAdmin && (
                      <Link href="/dashboard" onClick={closeMenu} className="w-full">
                        <Button variant="outline" className="w-full justify-center gap-2" size="lg">
                          <LayoutDashboard className="w-5 h-5" />
                          Yönetim Paneli
                        </Button>
                      </Link>
                    )}
                    
                    <Button variant="ghost" className="w-full justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" size="lg" onClick={() => { logout(); closeMenu(); }}>
                      <LogOut className="w-5 h-5" />
                      Çıkış Yap
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/auth" onClick={closeMenu} className="w-full">
                      <Button className="w-full justify-center gap-2 bg-red-900 hover:bg-red-800 text-white" size="lg">
                        <LogIn className="w-5 h-5" />
                        Giriş / Kayıt
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
        </div>
      )}
    </header>
  )
}
