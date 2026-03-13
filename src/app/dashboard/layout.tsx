"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, LayoutDashboard, Package, Tags, Menu, X, Settings, Users } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated) {
      router.push("/")
    } else if (user && (!user.roles || !user.roles.includes("Admin"))) {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!mounted || !isAuthenticated) return null // return generic loader later

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  const navLinks = [
    { name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ürünler", href: "/dashboard/products", icon: Package },
    { name: "Kategoriler", href: "/dashboard/categories", icon: Tags },
    { name: "Markalar", href: "/dashboard/brands", icon: Tags },
    { name: "Kullanıcılar", href: "/dashboard/users", icon: Users },
    { name: "Site Ayarları", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex shrink-0 items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b z-20 sticky top-0">
        <img src="/logo.png" alt="Yaşar Kırtasiye" className="h-8 w-auto" />
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-zinc-900/50 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-zinc-900 border-r transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 md:w-64
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 pb-2 md:pb-6 flex justify-between items-center">
          <div>
            <img src="/logo.png" alt="Yaşar Kırtasiye" className="h-10 w-auto mb-2 relative -left-2" />
            <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Yönetim Paneli</div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
             <X className="w-5 h-5 text-zinc-500" />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link key={link.name} href={link.href} onClick={closeSidebar}>
                <span className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 font-medium' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0 bg-white dark:bg-zinc-900">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
