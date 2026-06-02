import Link from "next/link"
import { Compass, Globe, MessageCircle, Camera, Play, Send } from "lucide-react"
import { Button } from "@/components/ui/Button"

const footerLinks = {
  Explore: [
    { name: "Destinations", href: "/destinations" },
    { name: "Find a Guide", href: "/guides" },
    { name: "Stays", href: "/stays" },
    { name: "Restaurants", href: "/restaurants" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Become a Guide", href: "/become-guide" },
    { name: "Blog", href: "/blog" },
    { name: "Partners", href: "/partners" },
  ],
  Support: [
    { name: "Help Center", href: "/help" },
    { name: "Safety", href: "/safety" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

const socials = [
  { icon: Globe, href: "https://twitter.com", label: "Twitter" },
  { icon: Camera, href: "https://instagram.com", label: "Instagram" },
  { icon: MessageCircle, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Play, href: "https://youtube.com", label: "YouTube" },
]

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      {/* Newsletter Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Stay in the Loop 🌍</h3>
            <p className="text-gray-400 text-sm">Get travel tips, hidden gems, and student guide stories in your inbox.</p>
          </div>
          <form className="flex w-full md:w-auto gap-2 max-w-sm">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button className="rounded-xl shrink-0 px-5 shadow-lg shadow-primary/30">
              <Send className="w-4 h-4 mr-2" /> Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-5">
              <Compass className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-xl tracking-tight">Mytra</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Connecting international travelers with verified Indian college students for authentic local experiences.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-5 text-gray-300">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:text-primary text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Mytra Technologies. All rights reserved. Support: support@getmytra.com</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
