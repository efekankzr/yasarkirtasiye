"use client"

import { useEffect, useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { apiClient } from "@/lib/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ShoppingCart, Trash2, Plus, Minus, Layers, ExternalLink } from "lucide-react"

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  // To avoid hydration mismatch errors with local storage
  const [mounted, setMounted] = useState(false)
  const [phone, setPhone] = useState("")
  const [template, setTemplate] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Fetch site settings for phone number
    apiClient.get("/settings")
      .then(res => {
        if (res.data && res.data.phone) {
          let cleanPhone = res.data.phone.replace(/\D/g, '')
          if (cleanPhone.startsWith('0')) {
            cleanPhone = '90' + cleanPhone.substring(1)
          } else if (cleanPhone.length === 10) {
            cleanPhone = '90' + cleanPhone
          }
          setPhone(cleanPhone)
        }
        if (res.data && res.data.whatsAppTemplate) {
          setTemplate(res.data.whatsAppTemplate)
        }
      })
      .catch(err => console.error("Could not load settings", err))
  }, [])

  if (!mounted) return null
  if (!isAuthenticated) return null

  const handleWhatsappOffer = () => {
    if (items.length === 0) return

    const itemsString = items.map((item, index) => {
      let line = `${index + 1}. ${item.name}`
      if (item.barcode) {
        line += ` (Barkod: ${item.barcode})`
      }
      line += ` - ${item.quantity} Adet`
      return line
    }).join("\n")

    let finalMessage = ""
    if (template && template.includes("{urunler}")) {
      finalMessage = template.replace("{urunler}", itemsString)
    } else {
      finalMessage = `Merhaba, aşağıdaki ürünler için fiyat teklifi veya stok bilgisi rica ediyorum:\n\n${itemsString}`
    }

    const encodedText = encodeURIComponent(finalMessage)
    const targetPhone = phone || "905551234567" // Fallback phone
    window.open(`https://wa.me/${targetPhone}?text=${encodedText}`, "_blank")
    
    // Clear cart after sending
    clearCart()
  }

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 transform ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold tracking-tight">Teklif Sepeti</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                <ShoppingCart className="w-16 h-16 opacity-20" />
                <p>Sepetiniz şu an boş.</p>
                <Button variant="outline" onClick={() => setCartOpen(false)}>
                  Alışverişe Başla
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 relative group">
                   <div className="w-16 h-16 shrink-0 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                     {item.imageUrl ? (
                       <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                       <Layers className="w-6 h-6 text-zinc-300" />
                     )}
                   </div>
                   
                   <div className="flex-1 min-w-0 pr-6">
                     <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h4>
                     {item.barcode && (
                       <p className="text-xs text-zinc-500 mt-0.5 truncate">Barkod: {item.barcode}</p>
                     )}
                     
                     <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                     </div>
                   </div>

                   <button 
                     onClick={() => removeItem(item.productId)}
                     className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {items.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-zinc-500 hover:text-red-500" 
                onClick={() => clearCart()}
              >
                Sepeti Temizle
              </Button>
              <Button 
                className="w-full h-12 text-base font-semibold bg-[#25D366] hover:bg-[#20BE5A] text-white shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
                onClick={handleWhatsappOffer}
              >
                WhatsApp ile Teklif İste <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
