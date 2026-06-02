"use client"
import { Button } from "@/components/ui/Button"
import { Compass, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const navLinks = [
  { name: "Destinations", href: "/destinations" },
  { name: "Find a Guide", href: "/guides" },
  { name: "Plan Trip", href: "/plan" },
  { name: "Stays", href: "/stays" },
  { name: "Restaurants", href: "/restaurants" },
  { name: "Become a Guide", href: "/become-guide" },
]

import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Compass className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-secondary dark:text-white">Mytra</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium px-3 py-2 rounded-lg hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              {session ? (
                <div className="flex items-center gap-4">
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin/dashboard">
                      <Button variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary/5">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">

                    <img 
                      src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`} 
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                      alt="Avatar"
                    />
                    <span className="text-sm font-medium">{session.user?.name?.split(' ')[0]}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => signOut()}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="font-medium">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="font-medium shadow-md shadow-primary/20">Sign up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-white dark:bg-gray-900 flex flex-col md:hidden">
          <div className="flex flex-col p-6 space-y-2 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-2">
                  <img 
                    src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`} 
                    className="w-10 h-10 rounded-full"
                    alt="Avatar"
                  />
                  <div>
                    <p className="font-bold text-sm">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full h-12 text-base">Dashboard</Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-base text-red-500"
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full h-12 text-base">Log in</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full h-12 text-base shadow-lg shadow-primary/20">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
