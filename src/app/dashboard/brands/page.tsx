"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Pencil, Trash2, ArrowLeft, ArrowRight, Image as ImageIcon, Download, UploadCloud } from "lucide-react"

import { apiClient } from "@/lib/api/axios"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { getImageUrl } from "@/lib/utils"

// Typings
export interface Brand {
  id: string
  name: string
  imageUrl?: string | null
  isShowMainPage: boolean
}

interface PaginatedResponse {
  data: Brand[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

// Validation Schema
const brandSchema = z.object({
  name: z.string().min(2, "Marka adı en az 2 karakter olmalıdır"),
  isShowMainPage: z.boolean().default(false),
})

type BrandFormValues = z.infer<typeof brandSchema>

export default function BrandsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  // Bulk Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      isShowMainPage: false
    }
  })

  const isShowMainPageVal = watch("isShowMainPage");

  const loadBrands = async (pageNumber: number = 1) => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/brands?pageNumber=${pageNumber}&pageSize=10`)
      const responseData = res.data?.data || res.data?.items || res.data || []
      
      if (res.data && res.data.totalRecords !== undefined) {
        setData(res.data)
      } else {
        const arr = Array.isArray(responseData) ? responseData : []
        setData({
          data: arr,
          pageNumber: 1,
          pageSize: arr.length,
          totalRecords: arr.length,
          totalPages: 1
        })
      }
    } catch (error) {
      console.error("Markalar yüklenemedi:", error)
      toast.error("Markalar yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands(page)
  }, [page])

  const handleOpenCreateModal = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setRemoveImage(false)
    setEditingId(null)
    reset({
      name: "",
      isShowMainPage: false
    })
    setIsModalOpen(true)
  }

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id)
    setSelectedImage(null)
    setImagePreview(brand.imageUrl || null)
    setRemoveImage(false)
    setValue("name", brand.name)
    setValue("isShowMainPage", brand.isShowMainPage)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu markayı silmek istediğinize emin misiniz?")) {
      try {
        await apiClient.delete(`/brands/${id}`)
        toast.success("Marka başarıyla silindi")
        loadBrands(page)
      } catch (error) {
        toast.error("Silinirken bir hata oluştu")
      }
    }
  }

  const onSubmit = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("isShowMainPage", values.isShowMainPage.toString())
      formData.append("removeImage", removeImage.toString())
      if (selectedImage) {
         formData.append("image", selectedImage)
      }

      if (editingId) {
        formData.append("id", editingId)
        await apiClient.put(`/brands/${editingId}`, formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await apiClient.post("/brands", formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      setIsModalOpen(false)
      toast.success(editingId ? "Marka başarıyla güncellendi" : "Yeni marka eklendi")
      loadBrands(editingId ? page : 1)
      if (!editingId) setPage(1)
    } catch (error) {
      console.error("Kaydetme hatası:", error)
      toast.error("İşlem sırasında bir hata oluştu")
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/brands/template', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Marka_Sablonu.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Şablon indirildi")
    } catch (error) {
      toast.error("Şablon indirilirken bir hata oluştu")
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      toast.error("Lütfen bir Excel dosyası seçin")
      return
    }

    const formData = new FormData()
    formData.append("file", importFile)

    try {
      setIsImporting(true)
      const res = await apiClient.post('/brands/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(res.data.message || "İçe aktarım başarılı")
      setIsImportModalOpen(false)
      setImportFile(null)
      loadBrands(1)
      setPage(1)
    } catch (error: any) {
      const apiError = error.response?.data?.message || "İçe aktarım sırasında bir hata oluştu"
      toast.error(apiError)
      if (error.response?.data?.errors?.length > 0) {
        error.response.data.errors.forEach((err: string) => toast.error(err))
      }
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Markalar</h2>
          <p className="text-zinc-500 font-medium">Sistemdeki tüm markaları görüntüleyin ve vitrinde gösterimini yönetin.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" onClick={handleDownloadTemplate} className="group">
            <Download className="w-4 h-4 mr-2 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            Şablon İndir
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="group">
            <UploadCloud className="w-4 h-4 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
            İçe Aktar
          </Button>
          <Button onClick={handleOpenCreateModal} className="group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Yeni Marka
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Görsel</th>
                  <th className="px-6 py-4">Marka Adı</th>
                  <th className="px-6 py-4">Vitrin Gösterimi</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-zinc-500">Yükleniyor...</td></tr>
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((brand) => (
                    <tr key={brand.id} className="border-b last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4">
                        {brand.imageUrl ? (
                           <img src={getImageUrl(brand.imageUrl)} alt={brand.name} className="w-10 h-10 object-contain rounded border" />
                        ) : (
                           <div className="w-10 h-10 bg-zinc-100 rounded border flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-zinc-400" />
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{brand.name}</td>
                      <td className="px-6 py-4">
                        {brand.isShowMainPage ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                Gösteriliyor
                            </span>
                        ) : (
                            <span className="text-zinc-400 text-xs">Gizli</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(brand)}>
                            <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-8 text-zinc-500">Marka bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Details */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500">
              Toplam <span className="font-semibold">{data.totalRecords}</span> kayıttan <span className="font-semibold">{(page - 1) * 10 + 1}-{Math.min(page * 10, data.totalRecords)}</span> arası gösteriliyor.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Önceki
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Sonraki <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Marka Düzenle" : "Yeni Marka Ekle"}
        description={editingId ? "Marka bilgilerini güncelleyin." : "Sisteme yeni bir marka tanımlayın."}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Marka Adı</label>
            <Input {...register("name")} disabled={isSubmitting} placeholder="Epson, Faber-Castell vb." />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Marka Logosu</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative inline-block group">
                    <img 
                      src={getImageUrl(imagePreview)} 
                      alt="Brand Preview" 
                    className="w-16 h-16 object-contain bg-zinc-50 border rounded-md" 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                       setImagePreview(null)
                       setSelectedImage(null)
                       setRemoveImage(true)
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0]
                    if (file.size > 2 * 1024 * 1024) {
                       toast.error(`${file.name} boyutu 2MB'dan büyük olamaz.`);
                       e.target.value = '';
                       return;
                    }

                    setSelectedImage(file)
                    setRemoveImage(false)
                    const reader = new FileReader()
                    reader.onloadend = () => setImagePreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }
                }}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isShowMainPage" 
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              {...register("isShowMainPage")} 
            />
            <label htmlFor="isShowMainPage" className="text-sm font-medium text-zinc-700">
              Anasayfada Vitrinde Göster
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>İptal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="Markaları İçe Aktar"
        description="Örnek şablonu doldurarak çok sayıda markayı tek seferde sisteme yükleyebilirsiniz."
      >
        <form onSubmit={handleImport} className="space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
            <UploadCloud className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-medium mb-1">.xlsx formatında Excel dosyası seçin</p>
            <p className="text-xs text-zinc-500 mb-4">Maksimum dosya boyutu: 2MB</p>
            <Input 
              type="file" 
              accept=".xlsx" 
              className="max-w-[250px] mx-auto cursor-pointer"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}>İptal</Button>
            <Button type="submit" disabled={isImporting || !importFile}>
              {isImporting ? "Yükleniyor..." : "Yükle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
