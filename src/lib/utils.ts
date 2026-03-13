import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;

  // Sadece geliştirme (development) ortamındayken API portuna git. Sunucu public/ içinde tutuyor.
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5012${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  // Prodüksiyonda her şey zaten Next.js sunucusundan (yasarkirtasiye.com/uploads...) çıkıyor. Localhost falan eklemesin.
  return `${path.startsWith('/') ? '' : '/'}${path}`;
}
