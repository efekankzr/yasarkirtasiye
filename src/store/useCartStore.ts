import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  barcode?: string
  quantity: number
  imageUrl?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setCartOpen: (isOpen: boolean) => void
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId)
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.productId === item.productId 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, item] }
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.productId === productId ? { ...i, quantity } : i
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0)
    }),
    {
      name: 'yasarkirtasiye-cart-storage',
      // Sadece items state'ini localeStorage'a kaydet, drawer'in açık olma durumunu vb. kaydetme
      partialize: (state) => ({ items: state.items }) 
    }
  )
)
