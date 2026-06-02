"use client";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { CheckCircle2, IndianRupee, Star, Users, Calendar, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const perks = [
  { icon: IndianRupee, title: "Earn ₹800–₹2000/hr", desc: "Set your own price. Get paid weekly via UPI, bank or wallet." },
  { icon: Calendar, title: "Flexible Schedule", desc: "Work weekends, holidays, or whenever you're free between classes." },
  { icon: Star, title: "Build Your Portfolio", desc: "Get reviews, build a real-world profile that looks great on your resume." },
  { icon: Users, title: "Meet the World", desc: "Connect with travelers from France, USA, Japan, Australia and more." },
  { icon: Shield, title: "Safe & Supported", desc: "24/7 support team. We handle payments and protect every booking." },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Sign up with your college email, upload your ID & a selfie." },
  { num: "02", title: "Complete Verification", desc: "Our team verifies your university enrollment and documents in 24–48 hrs." },
  { num: "03", title: "Set Your Packages", desc: "Define what you offer — food walks, heritage tours, shopping, transport." },
  { num: "04", title: "Start Earning", desc: "Receive booking requests, confirm availability, and get paid instantly." },
];

export default function BecomeGuidePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-secondary text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
              🎓 For College Students
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Turn Your City Knowledge<br />
              Into <span className="text-primary">Real Income</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Join 2,000+ verified student guides earning ₹15,000–₹50,000/month while helping international travelers explore India authentically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?role=guide">
                <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/30">
                  Apply as a Guide <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg border-white/30 text-white hover:bg-white/10 hover:text-white bg-white/5">
                  How it works
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Earnings counter strip */}
      <section className="bg-primary text-white py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Avg. Monthly Earnings", value: "₹22,000" },
            { label: "Active Student Guides", value: "2,000+" },
            { label: "Cities Available", value: "50+" },
            { label: "Avg. Guide Rating", value: "4.87 ★" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-sm text-primary-foreground/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Why Students Love Mytra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <perk.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{perk.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Get Started in 4 Easy Steps</h2>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-6 items-start bg-white dark:bg-black p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="text-5xl font-black text-primary/20 leading-none w-16 shrink-0">{step.num}</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">Eligibility Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              "Currently enrolled in any Indian college or university",
              "Age 18 or above",
              "Valid government-issued ID",
              "Basic proficiency in English or regional languages",
              "Smartphone with internet access",
              "Good knowledge of your city",
            ].map((req) => (
              <div key={req} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{req}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/signup?role=guide">
              <Button size="lg" className="h-14 px-12 rounded-full text-lg shadow-lg shadow-primary/20">
                Apply Now — It's Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="bg-secondary text-white py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">© 2026 Mytra. All rights reserved.</p>
      </div>
    </footer>
  );
}
