"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save } from "lucide-react"

import { apiClient } from "@/lib/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "react-hot-toast"


interface SiteSettings {
  id: string
  description: string | null
  phone: string | null
  whatsAppNumber: string | null
  email: string | null
  address: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  instagramUrl: string | null
  whatsAppTemplate: string | null
}

// Validation Schema
const settingsSchema = z.object({
  description: z.string().min(5, "Açıklama çok kısa").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  whatsAppNumber: z.string().nullable().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  facebookUrl: z.string().url("Geçerli bir URL giriniz").nullable().optional().or(z.literal("")),
  twitterUrl: z.string().url("Geçerli bir URL giriniz").nullable().optional().or(z.literal("")),
  instagramUrl: z.string().url("Geçerli bir URL giriniz").nullable().optional().or(z.literal("")),
  whatsAppTemplate: z.string().nullable().optional().or(z.literal("")),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema)
  })

  // Format phone number utility: 0 (xxx) xxx xx xx
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Enforce starting with 0
    let trimmed = phoneNumber;
    if (trimmed.length > 0 && trimmed[0] !== '0') {
      trimmed = '0' + trimmed;
    }
    
    const phoneNumberLength = trimmed.length;
    if (phoneNumberLength === 0) return '';
    if (phoneNumberLength < 2) return trimmed;
    if (phoneNumberLength < 5) {
      return `${trimmed.slice(0, 1)} (${trimmed.slice(1)}`;
    }
    if (phoneNumberLength < 8) {
      return `${trimmed.slice(0, 1)} (${trimmed.slice(1, 4)}) ${trimmed.slice(4)}`;
    }
    if (phoneNumberLength < 10) {
      return `${trimmed.slice(0, 1)} (${trimmed.slice(1, 4)}) ${trimmed.slice(4, 7)} ${trimmed.slice(7)}`;
    }
    return `${trimmed.slice(0, 1)} (${trimmed.slice(1, 4)}) ${trimmed.slice(4, 7)} ${trimmed.slice(7, 9)} ${trimmed.slice(9, 11)}`;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get("/settings")
        if (res.data) {
          // React hook form resets with fetched data
          reset({
            description: res.data.description || "",
            phone: res.data.phone || "",
            whatsAppNumber: res.data.whatsAppNumber || "",
            email: res.data.email || "",
            address: res.data.address || "",
            logoUrl: res.data.logoUrl || "",
            facebookUrl: res.data.facebookUrl || "",
            twitterUrl: res.data.twitterUrl || "",
            instagramUrl: res.data.instagramUrl || "",
            whatsAppTemplate: res.data.whatsAppTemplate || "",
          })
        }
      } catch (error) {
        console.error("Ayarlar alınamadı:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [reset])

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await apiClient.put("/settings", values)
      toast.success("Site ayarları başarıyla güncellendi!")
    } catch (error) {
      console.error("Ayarlar güncellenirken hata:", error)
      toast.error("İşlem sırasında bir hata oluştu")
    }
  }

  if (loading) {
    return <div className="text-zinc-500">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Site Ayarları</h2>
        <p className="text-zinc-500 font-medium">İletişim, WhatsApp ve sosyal medya gibi genel site bilgilerini yönetin.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* İletişim Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Genel ve İletişim Bilgileri</CardTitle>
              <CardDescription>Sitenizin kısa açıklaması ve müşterilerin ulaşabileceği iletişim verileri.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Site Açıklaması (Footer)</label>
                <textarea 
                  {...register("description")} 
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Kaliteli kırtasiye malzemeleri..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon Numarası</label>
                <Input 
                  {...register("phone")} 
                  disabled={isSubmitting} 
                  placeholder="0 (555) 123 45 67" 
                  onChange={(e) => {
                    handlePhoneChange(e)
                  }}
                  maxLength={17}
                />
                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp Numarası <span className="text-zinc-400 font-normal">(opsiyonel)</span></label>
                <Input {...register("whatsAppNumber")} disabled={isSubmitting} placeholder="0 (555) 123 45 67 — boş bırakılırsa Telefon numarası kullanılır" />
                {errors.whatsAppNumber && <span className="text-xs text-red-500">{errors.whatsAppNumber.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">WhatsApp Mesaj Şablonu</label>
                <CardDescription className="text-xs mb-1">
                  Müşteri teklif istediğinde gidecek taslak mesaj. Ürün listesinin geleceği yere <strong>{"{urunler}"}</strong> yazınız.
                </CardDescription>
                <textarea 
                  {...register("whatsAppTemplate")} 
                  disabled={isSubmitting}
                  rows={6}
                  placeholder={`Merhaba,\n\nAşağıdaki ürünler için fiyat teklifi rica ediyorum:\n\n{urunler}\n\nİyi çalışmalar.`}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.whatsAppTemplate && <span className="text-xs text-red-500">{errors.whatsAppTemplate.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-Posta Adresi</label>
                <Input {...register("email")} type="email" disabled={isSubmitting} placeholder="info@yasarkirtasiye.com" />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Firma Adresi</label>
                <textarea 
                  {...register("address")} 
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Merkez Mah. Atatürk Cad. No:1 Ankara/Türkiye"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo URL / Dosya Yolu</label>
                <Input {...register("logoUrl")} disabled={isSubmitting} placeholder="/uploads/logo.png" />
                {errors.logoUrl && <span className="text-xs text-red-500">{errors.logoUrl.message}</span>}
              </div>
            </CardContent>
          </Card>

          {/* Sosyal Medya */}
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya Bağlantıları</CardTitle>
              <CardDescription>Sitenin alt kısmında (footer) görünecek sosyal medya sayfalarınızın tam adresleri.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Facebook URL</label>
                <Input {...register("facebookUrl")} disabled={isSubmitting} placeholder="https://facebook.com/yasarkirtasiye" />
                {errors.facebookUrl && <span className="text-xs text-red-500">{errors.facebookUrl.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Twitter URL</label>
                <Input {...register("twitterUrl")} disabled={isSubmitting} placeholder="https://twitter.com/yasarkirtasiye" />
                {errors.twitterUrl && <span className="text-xs text-red-500">{errors.twitterUrl.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instagram URL</label>
                <Input {...register("instagramUrl")} disabled={isSubmitting} placeholder="https://instagram.com/yasarkirtasiye" />
                {errors.instagramUrl && <span className="text-xs text-red-500">{errors.instagramUrl.message}</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Kaydediliyor..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
