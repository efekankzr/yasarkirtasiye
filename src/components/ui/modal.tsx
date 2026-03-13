import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg sm:my-8 m-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold leading-none tracking-tight">{title}</h2>
            {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="my-2">
          {children}
        </div>
      </div>
    </div>
  )
}
