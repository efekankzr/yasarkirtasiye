"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Search, Calendar, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata oluştu", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users?.filter((u: UserDto) => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / 10);
  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Kullanıcılar
          </h2>
          <p className="text-zinc-500 mt-1">Sisteme kayıtlı tüm firma ve yetkilileri görüntüleyin</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg">Kullanıcı Listesi</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="İsim veya e-posta ara..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1) // Reset page on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Ad Soyad</th>
                  <th className="px-6 py-4 font-semibold">E-Posta</th>
                  <th className="px-6 py-4 font-semibold">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user: UserDto) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {user.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" />
                           {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Details */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500">
              Toplam <span className="font-semibold">{totalRecords}</span> kayıttan <span className="font-semibold">{(page - 1) * 10 + 1}-{Math.min(page * 10, totalRecords)}</span> arası gösteriliyor.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
