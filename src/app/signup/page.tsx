"use client";
import { Button } from "@/components/ui/Button";
import { Compass, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignupForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "guide" ? "guide" : "traveler";
  const [role, setRole] = useState<"traveler" | "guide">(defaultRole as "traveler" | "guide");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Compass className="h-10 w-10 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-secondary dark:text-white">Mytra</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Create Your Account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Join thousands exploring real India</p>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setRole("traveler")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "traveler" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
          >
            <User className="w-6 h-6" />
            <span className="font-semibold text-sm">I'm a Traveler</span>
          </button>
          <button
            onClick={() => setRole("guide")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "guide" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="font-semibold text-sm">I'm a Student Guide</span>
          </button>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" placeholder="Alex" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" placeholder="Johnson" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" placeholder="alex@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
          </div>

          {role === "guide" && (
            <div>
              <label className="block text-sm font-medium mb-1">University / College</label>
              <input type="text" placeholder="Delhi University" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
          </p>

          <Button className="w-full h-12 text-lg mt-2 shadow-lg shadow-primary/20">
            {role === "guide" ? "Apply as a Student Guide" : "Create Traveler Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
