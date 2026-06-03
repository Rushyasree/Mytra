"use client"
import { Button } from "@/components/ui/Button"
import { Compass } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        alert("Login failed: " + result.error)
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (session?.user?.role === "GUIDE") {
          router.push("/guide-dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Compass className="h-10 w-10 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-secondary dark:text-white">
              Mytra
            </span>
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Log in to continue your journey
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-primary focus:ring-primary" />
              <span>Remember me</span>
            </label>
            <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-lg mt-4 shadow-lg shadow-primary/20"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  )
}
