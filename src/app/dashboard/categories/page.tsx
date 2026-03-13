"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Pencil, Trash2, Search, ArrowLeft, ArrowRight, Download, UploadCloud } from "lucide-react"

import { apiClient } from "@/lib/api/axios"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"

// Typings
interface Category {
  id: string
  name: string
}

interface PaginatedResponse {
  data: Category[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

// Validation Schema
const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoriesPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Bulk Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema)
  })

  const fetchCategories = async (pageNumber: number = 1) => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/categories?pageNumber=${pageNumber}&pageSize=10`)
      // Not: PagedResult API'dan gelme şeklini backend'e göre maplemek gerek (şu an PagedResult yapısında)
      if (res.data.data) {
        setData(res.data)
      } else {
        // Fallback for non-paginated or un-wrapped data (örneğin sadece dizi dönerse)
        setData({ data: Array.isArray(res.data) ? res.data : [], pageNumber: 1, pageSize: 10, totalRecords: res.data.length || 0, totalPages: 1 })
      }
    } catch (error) {
      console.error("Kategoriler alınamadı:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories(page)
  }, [page])

  const handleOpenCreateModal = () => {
    setEditingId(null)
    reset({ name: "" })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (category: Category) => {
    setEditingId(category.id)
    setValue("name", category.name)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      try {
        await apiClient.delete(`/categories/${id}`)
        toast.success("Kategori başarıyla silindi")
        fetchCategories(page)
      } catch (error) {
        toast.error("Silinirken bir hata oluştu")
      }
    }
  }

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingId) {
        await apiClient.put(`/categories/${editingId}`, { id: editingId, ...values })
      } else {
        await apiClient.post("/categories", values)
      }
      setIsModalOpen(false)
      toast.success(editingId ? "Kategori başarıyla güncellendi" : "Yeni kategori eklendi")
      fetchCategories(editingId ? page : 1)
      if (!editingId) setPage(1)
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu")
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/categories/template', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Kategori_Sablonu.xlsx')
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
      const res = await apiClient.post('/categories/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(res.data.message || "İçe aktarım başarılı")
      setIsImportModalOpen(false)
      setImportFile(null)
      fetchCategories(1)
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
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Kategoriler</h2>
          <p className="text-zinc-500 font-medium">Sistemdeki tüm kategorileri görüntüleyin ve yönetin.</p>
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
            Yeni Kategori
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input className="pl-9 bg-white dark:bg-zinc-950" placeholder="Kategori ara..." />
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Kategori Adı</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} className="text-center py-8 text-zinc-500">Yükleniyor...</td></tr>
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((category) => (
                    <tr key={category.id} className="border-b last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{category.name}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(category)}>
                            <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="text-center py-8 text-zinc-500">Kategori bulunamadı.</td></tr>
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
        title={editingId ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
        description={editingId ? "Kategori bilgilerini güncelleyin." : "Sisteme yeni bir kategori tanımlayın."}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori Adı</label>
            <Input {...register("name")} disabled={isSubmitting} placeholder="Kırtasiye, Teknoloji vb." />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>İptal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="Kategorileri İçe Aktar"
        description="Örnek şablonu doldurarak çok sayıda kategoriyi tek seferde sisteme yükleyebilirsiniz."
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
