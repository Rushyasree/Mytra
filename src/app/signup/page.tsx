"use client";

import { Button } from "@/components/ui/Button";
import { Compass, GraduationCap, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "guide" ? "GUIDE" : "TRAVELER";
  const [role, setRole] = useState<"TRAVELER" | "GUIDE">(defaultRole as "TRAVELER" | "GUIDE");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create account.");
      }

      setSuccess(
        role === "GUIDE"
          ? "Account created. Log in to complete your guide application."
          : "Account created. Redirecting you to login..."
      );

      setTimeout(() => {
        router.push(`/login?signup=success${role === "GUIDE" ? "&role=guide" : ""}`);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Go to Mytra home">
            <Compass className="h-10 w-10 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-secondary dark:text-white">Mytra</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Create Your Account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Join thousands exploring real India</p>

        <div className="grid grid-cols-2 gap-3 mb-8" aria-label="Choose account type">
          <button
            type="button"
            onClick={() => setRole("TRAVELER")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "TRAVELER" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
          >
            <User className="w-6 h-6" />
            <span className="font-semibold text-sm">I&apos;m a Traveler</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("GUIDE")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "GUIDE" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="font-semibold text-sm">I&apos;m a Student Guide</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
              <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Alex" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Johnson" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
            <p className="mt-1 text-xs text-gray-500">Use uppercase, lowercase, and a number.</p>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">{success}</p>}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" disabled={loading} className="w-full h-12 text-lg mt-2 shadow-lg shadow-primary/20">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : role === "GUIDE" ? "Create Guide Account" : "Create Traveler Account"}
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
