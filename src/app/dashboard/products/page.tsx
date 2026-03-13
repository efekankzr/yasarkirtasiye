"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
  X,
  ImagePlus,
  ArrowLeftCircle,
  ArrowRightCircle,
  Download,
  UploadCloud,
} from "lucide-react";

import { apiClient } from "@/lib/api/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

// Typings
interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  imagePath: string;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  barcode?: string;
  categoryId: string;
  brandId?: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  packageQuantity: number;
  boxQuantity: number;
  images?: ProductImage[];
}

interface PaginatedResponse {
  data: Product[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// Validation Schema
const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır"),
  barcode: z.string().optional(),
  categoryId: z.string().uuid("Lütfen geçerli bir kategori seçiniz"),
  brandId: z.string().uuid("Lütfen geçerli bir marka seçiniz").optional().or(z.literal("")),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  packageQuantity: z.coerce.number().min(1, "Paket içi adet en az 1 olmalıdır").default(1),
  boxQuantity: z.coerce.number().min(1, "Koli içi adet en az 1 olmalıdır").default(1),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Image states
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Bulk Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
  });

  const loadData = async (pageNumber: number = 1) => {
    try {
      setLoading(true);

      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        apiClient.get(`/products?pageNumber=${pageNumber}&pageSize=10`),
        apiClient.get(`/categories?pageNumber=1&pageSize=100`),
        apiClient.get(`/brands`),
      ]);

      if (productsRes.data.data) {
        setData(productsRes.data);
      } else {
        setData({
          data: Array.isArray(productsRes.data) ? productsRes.data : [],
          pageNumber: 1,
          pageSize: 10,
          totalRecords: productsRes.data.length || 0,
          totalPages: 1,
        });
      }

      setCategories(
        categoriesRes.data.data
          ? categoriesRes.data.data
          : Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : [],
      );

      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : []);
    } catch (error) {
      console.error("Veriler alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setExistingImages([]);
    setNewImages([]);
    setNewImagePreviews([]);
    reset({
      name: "",
      description: "",
      barcode: "",
      categoryId: "",
      brandId: "",
      isBestSeller: false,
      isFeatured: false,
      packageQuantity: 1,
      boxQuantity: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingId(product.id);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("barcode", product.barcode || "");
    setValue("categoryId", product.categoryId);
    setValue("brandId", product.brandId || "");
    setValue("isBestSeller", product.isBestSeller);
    setValue("isFeatured", product.isFeatured);
    setValue("packageQuantity", product.packageQuantity || 1);
    setValue("boxQuantity", product.boxQuantity || 1);

    // Sort existing images by displayOrder before setting state
    if (product.images && product.images.length > 0) {
      const sorted = [...product.images].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      setExistingImages(sorted);
    } else {
      setExistingImages([]);
    }

    setNewImages([]);
    setNewImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try {
        await apiClient.delete(`/products/${id}`);
        toast.success("Ürün başarıyla silindi");
        loadData(page);
      } catch (error) {
        toast.error("Silinirken hata oluştu.");
      }
    }
  };

  // Image Management Methods
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`${file.name} boyutu 2MB'dan büyük olamaz.`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setNewImages((prev) => [...prev, ...validFiles]);
        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
        setNewImagePreviews((prev) => [...prev, ...newPreviews]);
      }
      
      // Reset input value so same files can be selected again if needed
      e.target.value = '';
    }
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]); // Cleanup memory
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveExistingImage = (idx: number, direction: "left" | "right") => {
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= existingImages.length) return;

    const updated = [...existingImages];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setExistingImages(updated);
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (values.barcode) formData.append("barcode", values.barcode);
      formData.append("categoryId", values.categoryId);
      if (values.brandId) formData.append("brandId", values.brandId);
      formData.append("isBestSeller", values.isBestSeller.toString());
      formData.append("isFeatured", values.isFeatured.toString());
      formData.append("packageQuantity", values.packageQuantity.toString());
      formData.append("boxQuantity", values.boxQuantity.toString());

      if (editingId) {
        formData.append("id", editingId);

        // Ensure accurate order computation starting at 1
        const keptImages = existingImages.map((img, index) => ({
          id: img.id,
          displayOrder: index + 1,
        }));
        formData.append("existingImagesJson", JSON.stringify(keptImages));

        newImages.forEach((file) => {
          formData.append("newImages", file);
        });

        await apiClient.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        newImages.forEach((file) => {
          formData.append("images", file);
        });

        await apiClient.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsModalOpen(false);
      toast.success(
        editingId ? "Ürün başarıyla güncellendi" : "Yeni ürün eklendi",
      );
      loadData(editingId ? page : 1);
      if (!editingId) setPage(1);
    } catch (error) {
      console.error(error);
      toast.error("İşlem sırasında hata oluştu");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/products/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Urun_Sablonu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Şablon indirildi");
    } catch (error) {
      toast.error("Şablon indirilirken bir hata oluştu");
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Lütfen bir ZIP dosyası seçin");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      setIsImporting(true);
      const res = await apiClient.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || "İçe aktarım başarılı");
      setIsImportModalOpen(false);
      setImportFile(null);
      loadData(1);
      setPage(1);
    } catch (error: any) {
      const apiError = error.response?.data?.message || "İçe aktarım sırasında bir hata oluştu";
      toast.error(apiError);
      if (error.response?.data?.errors?.length > 0) {
        error.response.data.errors.forEach((err: string) => toast.error(err));
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ürünler
          </h2>
          <p className="text-zinc-500 font-medium">
            Sistemdeki tüm ürünleri görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" onClick={handleDownloadTemplate} className="group">
            <Download className="w-4 h-4 mr-2 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            Şablon İndir
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="group">
            <UploadCloud className="w-4 h-4 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
            İçe Aktar (ZIP)
          </Button>
          <Button onClick={handleOpenCreateModal} className="group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              className="pl-9 bg-white dark:bg-zinc-950"
              placeholder="Ürün ara..."
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Görsel</th>
                  <th className="px-6 py-4">Ürün Adı</th>
                  <th className="px-6 py-4">Barkod</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((product) => {
                    const mainImage =
                      product.images && product.images.length > 0
                        ? product.images.sort(
                            (a, b) => a.displayOrder - b.displayOrder,
                          )[0]
                        : null;

                    return (
                      <tr
                        key={product.id}
                        className="border-b last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {mainImage ? (
                            <img
                              src={mainImage.imagePath}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-md border flex items-center justify-center">
                              <ImagePlus className="w-5 h-5 text-zinc-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {product.barcode || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                            {categories.find((c) => c.id === product.categoryId)
                              ?.name || "Bilinmiyor"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(product)}
                            >
                              <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-500">
                      Ürün bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Details */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500">
              Toplam <span className="font-semibold">{data.totalRecords}</span>{" "}
              kayıttan{" "}
              <span className="font-semibold">
                {(page - 1) * 10 + 1}-{Math.min(page * 10, data.totalRecords)}
              </span>{" "}
              arası gösteriliyor.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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
        title={editingId ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
        description={
          editingId
            ? "Ürün detaylarını ve görsellerini güncelleyin."
            : "Sisteme yeni bir ürün tanımlayın."
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-dashed">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Ürün Görselleri</label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" size="sm" variant="secondary" className="bg-zinc-100 hover:bg-zinc-200">
                    <Plus className="w-4 h-4 mr-1" /> Fotoğraf Ekle
                  </Button>
                </div>
              </div>
              <ul className="text-[11px] text-zinc-500 list-disc pl-4 space-y-1">
                <li>Tercihen kare (1:1) formatında görseller yükleyiniz.</li>
                <li>Geçerli formatlar: <b>JPG, PNG, WEBP</b>.</li>
                <li>Görsel başına maksimum boyut <b>2MB</b> olmalıdır.</li>
              </ul>
            </div>

            {/* Existing Images Gallery */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-medium">
                  Mevcut Görseller (Sıralamayı Değiştirebilirsiniz)
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative group shrink-0 bg-white dark:bg-zinc-950 p-1 rounded-md border shadow-sm"
                    >
                      <img
                        src={img.imagePath}
                        alt="Product"
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex justify-between items-center mt-1">
                        <button
                          type="button"
                          onClick={() => moveExistingImage(idx, "left")}
                          disabled={idx === 0}
                          className="p-1 disabled:opacity-30 hover:bg-zinc-100 rounded dark:hover:bg-zinc-800"
                        >
                          <ArrowLeftCircle className="w-3.5 h-3.5 text-zinc-600" />
                        </button>
                        <span className="text-[10px] font-medium text-zinc-400">
                          {idx === 0 ? "Ana" : idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveExistingImage(idx, "right")}
                          disabled={idx === existingImages.length - 1}
                          className="p-1 disabled:opacity-30 hover:bg-zinc-100 rounded dark:hover:bg-zinc-800"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5 text-zinc-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                  <Plus className="w-3 h-3 mr-1" /> Yeni Eklenecekler
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {newImagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative group shrink-0 bg-white dark:bg-zinc-950 p-1 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm"
                    >
                      <img
                        src={src}
                        alt="New Preview"
                        className="w-16 h-16 object-cover rounded opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingImages.length === 0 && newImagePreviews.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                <ImagePlus className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">Henüz görsel eklenmemiş</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Satılacak Ürün Adı</label>
              <Input
                {...register("name")}
                disabled={isSubmitting}
                placeholder="Örn: 100'lü A4 Kağıt"
              />
              {errors.name && (
                <span className="text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Barkod Numarası</label>
              <Input
                {...register("barcode")}
                disabled={isSubmitting}
                placeholder="Örn: 8691234567890"
              />
              {errors.barcode && (
                <span className="text-xs text-red-500">
                  {errors.barcode.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paket İçi Adet</label>
              <Input
                type="number"
                min="1"
                {...register("packageQuantity")}
                disabled={isSubmitting}
                placeholder="Örn: 10"
              />
              {errors.packageQuantity && (
                <span className="text-xs text-red-500">
                  {errors.packageQuantity.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Koli İçi Adet</label>
              <Input
                type="number"
                min="1"
                {...register("boxQuantity")}
                disabled={isSubmitting}
                placeholder="Örn: 100"
              />
              {errors.boxQuantity && (
                <span className="text-xs text-red-500">
                  {errors.boxQuantity.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <select
                {...register("categoryId")}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-red-500">
                  {errors.categoryId.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Marka / Üretici</label>
              <select
                {...register("brandId")}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">(Belirtilmemiş)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <span className="text-xs text-red-500">
                  {errors.brandId.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-zinc-950 border rounded-md px-3 py-3">
              <input
                type="checkbox"
                id="isBestSeller"
                {...register("isBestSeller")}
                disabled={isSubmitting}
                className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-600"
              />
              <label
                htmlFor="isBestSeller"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Çok Satanlarda Göster
              </label>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-zinc-950 border rounded-md px-3 py-3">
              <input
                type="checkbox"
                id="isFeatured"
                {...register("isFeatured")}
                disabled={isSubmitting}
                className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-600"
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
              >
                Öne Çıkanlarda Göster
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ürün Açıklaması</label>
            <textarea
              {...register("description")}
              disabled={isSubmitting}
              rows={3}
              placeholder="Ürün bilgilerini detaylandırın..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <span className="text-xs text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-zinc-950 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        title="Ürünleri İçe Aktar (ZIP)"
        description="Ürün bilgilerini içeren Excel dosyasını ve ürün görsellerini aynı klasöre koyup ZIP formatında sisteme yükleyebilirsiniz."
      >
        <form onSubmit={handleImport} className="space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
            <UploadCloud className="w-10 h-10 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-medium mb-1">.zip formatında arşiv dosyası seçin</p>
            <p className="text-xs text-zinc-500 mb-4 flex flex-col items-center">
               <span>Arşiv içeriği: 1 adet .xlsx dosyası ve ona ait ürün görselleri.</span>
               <span>Maksimum dosya boyutu: 50MB</span>
            </p>
            <Input 
              type="file" 
              accept=".zip,application/zip" 
              className="max-w-[250px] mx-auto cursor-pointer"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}>İptal</Button>
            <Button type="submit" disabled={isImporting || !importFile}>
              {isImporting ? "Yüklendi Bekleniyor..." : "Yükle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
