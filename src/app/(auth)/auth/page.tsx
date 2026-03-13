"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LogIn, UserPlus, CheckCircle2 } from "lucide-react"

import { apiClient } from "@/lib/api/axios"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- SCHEMAS ---
const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  captcha: z.boolean().refine((val) => val === true, "Robot olmadığınızı doğrulayın."),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

function AuthForms() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginAction = useAuthStore((state) => state.login)
  
  // Decide which tab to show based on ?tab= URL param
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login"
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const [loginError, setLoginError] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)
  
  // Custom Captcha State
  const [isHuman, setIsHuman] = useState(false)

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // Register Form
  const {
    register: registerSignUp,
    handleSubmit: handleRegisterSubmit,
    setValue: setRegisterValue,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { captcha: false }
  })

  // --- HANDLERS ---
  async function onLogin(data: LoginFormValues) {
    try {
      setLoginError(null)
      const response = await apiClient.post("/auth/login", data)
      const { token, email, firstName, lastName, userId, roles } = response.data
      
      const userObj = { id: userId, email, firstName, lastName, roles }
      loginAction(userObj, token)
      
      if (roles && roles.includes("Admin")) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Giriş başarısız. Bilgilerinizi kontrol ediniz.")
    }
  }

  async function onRegister(data: RegisterFormValues) {
    try {
      setRegisterError(null)
      // We don't send `captcha` to backend since it's a simulated frontend check for now
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      }
      
      const response = await apiClient.post("/auth/register", payload)
      const { token, email, firstName, lastName, userId } = response.data
      
      loginAction({ id: userId, email, firstName, lastName }, token)
      router.push("/dashboard")
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || "Kayıt olurken bir hata oluştu.")
    }
  }

  return (
    <Card className="border-zinc-200 shadow-xl w-full max-w-md mx-auto bg-white">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Yaşar Kırtasiye" className="h-16 w-auto" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-blue-900">Kullanıcı İşlemleri</CardTitle>
        <CardDescription className="text-zinc-500">
          Yaşar Kırtasiye sistemine giriş yapın veya hesap oluşturun
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100 p-1 rounded-md">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded">Kayıt Ol</TabsTrigger>
          </TabsList>

          {/* LOGIN CONTENT */}
          <TabsContent value="login" className="space-y-4 outline-none">
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {loginError && (
                <div className="p-3 text-sm rounded-md bg-red-100 text-red-600">
                  {loginError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="login-email">E-posta</label>
                <Input id="login-email" placeholder="ornek@yasarkirtasiye.com" type="email" disabled={isLoginSubmitting} {...registerLogin("email")} />
                {loginErrors.email && <p className="text-sm text-red-500">{loginErrors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none text-zinc-700" htmlFor="login-password">Şifre</label>
                  <Button variant="link" className="p-0 h-auto text-sm text-red-900 hover:text-red-700" type="button">
                    Şifremi Unuttum
                  </Button>
                </div>
                <Input id="login-password" type="password" disabled={isLoginSubmitting} {...registerLogin("password")} className="bg-white text-zinc-900 border-zinc-300 focus-visible:ring-blue-600" />
                {loginErrors.password && <p className="text-sm text-red-500">{loginErrors.password.message}</p>}
              </div>
              
              <Button type="submit" className="w-full h-11 text-base mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isLoginSubmitting}>
                {isLoginSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER CONTENT */}
          <TabsContent value="register" className="space-y-4 outline-none">
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {registerError && (
                <div className="p-3 text-sm rounded-md bg-red-100 text-red-600">
                  {registerError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor="firstName">Ad</label>
                  <Input id="firstName" placeholder="Ahmet" disabled={isRegisterSubmitting} {...registerSignUp("firstName")} />
                  {registerErrors.firstName && <p className="text-sm text-red-500">{registerErrors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor="lastName">Soyad</label>
                  <Input id="lastName" placeholder="Yılmaz" disabled={isRegisterSubmitting} {...registerSignUp("lastName")} />
                  {registerErrors.lastName && <p className="text-sm text-red-500">{registerErrors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="register-email">E-posta</label>
                <Input id="register-email" placeholder="ornek@yasarkirtasiye.com" type="email" disabled={isRegisterSubmitting} {...registerSignUp("email")} />
                {registerErrors.email && <p className="text-sm text-red-500">{registerErrors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="register-password">Şifre</label>
                <Input id="register-password" type="password" disabled={isRegisterSubmitting} {...registerSignUp("password")} />
                {registerErrors.password && <p className="text-sm text-red-500">{registerErrors.password.message}</p>}
              </div>

              {/* Simulated reCAPTCHA */}
              <div className="pt-2">
                <div 
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${isHuman ? 'bg-green-50/50 border-green-200' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                  onClick={() => {
                    const newValue = !isHuman
                    setIsHuman(newValue)
                    setRegisterValue('captcha', newValue, { shouldValidate: true })
                  }}
                >
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isHuman ? 'bg-green-500 border-green-500' : 'bg-white border-zinc-300'}`}>
                    {isHuman && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700">Ben robot değilim</span>
                  </div>
                  <div className="w-8 flex justify-center">
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-6 opacity-60 grayscale" />
                  </div>
                </div>
                {registerErrors.captcha && <p className="text-sm text-red-500 mt-2">{registerErrors.captcha.message}</p>}
              </div>
              
              <Button type="submit" className="w-full h-11 text-base mt-4 bg-red-900 hover:bg-red-800 text-white font-semibold" disabled={isRegisterSubmitting || !isHuman}>
                {isRegisterSubmitting ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Suspense wrap since we use useSearchParams
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /></div>}>
      <AuthForms />
    </Suspense>
  )
}
