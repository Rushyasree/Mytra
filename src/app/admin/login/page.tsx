"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Compass, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials or unauthorized access.");
      } else {
        // Fetch session to check role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          setError("You do not have administrative access.");
          // Optionally sign out if they shouldn't be logged in at all here
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Compass className="h-10 w-10 text-primary" />
            <span className="font-bold text-3xl tracking-tight text-secondary dark:text-white">Mytra</span>
          </Link>
          <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest border border-primary/20">
            <ShieldCheck className="w-3 h-3" />
            Admin Portal
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-bold mb-2 text-center">System Login</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">Enter your administrative credentials</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@getmytra.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-lg mt-4 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Enter"}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-gray-400 text-xs">
          Unauthorized access is strictly prohibited and logged.
        </p>
      </div>
    </div>
  );
}
