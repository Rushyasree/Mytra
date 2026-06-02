"use client";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { ShieldCheck, Star, Clock, Check, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const steps = ["Guide & Date", "Add-ons", "Review & Pay"];

const addons = [
  { id: "translator", label: "Professional Translator", price: 1500, desc: "Certified translation for Hindi, Tamil, Telugu" },
  { id: "airport", label: "Airport Pickup", price: 1200, desc: "Door-to-door comfortable cab from airport" },
  { id: "hotel", label: "Hotel Booking Assistance", price: 800, desc: "Guide helps you find & book the best stay" },
  { id: "restaurant", label: "Restaurant Reservations", price: 400, desc: "Pre-book tables at curated local spots" },
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const experienceId = searchParams.get("experienceId");
  const guideIdParam = searchParams.get("guideId");
  const priceParam = searchParams.get("price");

  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [hours, setHours] = useState(3);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Mocking guide data for now if guideId is present, in reality we'd fetch it
  const [guide, setGuide] = useState<any>({
    name: "Rahul Sharma",
    university: "Delhi University",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.9,
    reviewsCount: 42,
    pricePerHour: priceParam ? parseInt(priceParam) : 1250,
    city: "Delhi"
  });

  const hourlyRate = guide.pricePerHour;
  const basePrice = hourlyRate * hours;
  const addonTotal = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = basePrice + addonTotal;

  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleBook = async () => {
    if (!date) {
      setError("Please select a date.");
      setStep(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guideIdParam || "placeholder-id", // In real app, we need a real ID
          date: `${date}T${startTime === "10:00 AM" ? "10:00:00" : "12:00:00"}Z`, // Simplified
          duration: hours,
          totalPrice: total,
          experienceId: experienceId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setIsBooked(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isBooked) {
    return (
      <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
        <Navbar />
        <section className="py-24 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-4 text-center">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
              <Check className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Booking Confirmed! 🎉</h1>
            <p className="text-gray-500 mb-8">Your request has been sent to {guide.name}. You'll receive a confirmation email shortly.</p>
            
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-left mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono font-bold">#TM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Guide</span>
                <span className="font-bold">{guide.name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">Go to Dashboard</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full h-12 rounded-xl">Back to Home</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col pt-16 bg-gray-50 dark:bg-black">
      <Navbar />

      <section className="py-12 flex-1">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Book Your Experience</h1>
          <p className="text-gray-500 mb-8">with {guide.name} · {guide.city}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i <= step ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-500 whitespace-nowrap hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Step 0: Guide & Date */}
              {step === 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h2 className="text-xl font-bold">Select Date & Duration</h2>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <select 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Duration: <span className="text-primary font-bold">{hours} hours</span>
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {[2, 3, 4, 6, 8].map((h) => (
                        <button
                          key={h}
                          onClick={() => setHours(h)}
                          className={`px-5 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                            hours === h
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                          }`}
                        >
                          {h === 8 ? "Full Day" : `${h} hrs`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20" onClick={() => setStep(1)}>
                    Continue to Add-ons →
                  </Button>
                </div>
              )}

              {/* Step 1: Add-ons */}
              {step === 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                  <h2 className="text-xl font-bold">Enhance Your Experience</h2>
                  <p className="text-sm text-gray-500">Add optional services to your booking.</p>

                  {addons.map((addon) => {
                    const selected = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          selected ? "border-primary bg-primary/5" : "border-gray-100 dark:border-gray-800 hover:border-primary/40"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          selected ? "border-primary bg-primary" : "border-gray-300"
                        }`}>
                          {selected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-semibold">{addon.label}</span>
                            <span className="text-primary font-bold">+₹{addon.price.toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{addon.desc}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(0)}>← Back</Button>
                    <Button className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20" onClick={() => setStep(2)}>Review Booking →</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Review & Pay */}
              {step === 2 && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h2 className="text-xl font-bold">Review & Pay</h2>

                  <div className="bg-gray-50 dark:bg-black rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Guide: {guide.name}</span>
                      <span className="font-medium">Heritage Walk</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{hours} hours @ ₹{hourlyRate}/hr</span>
                    </div>
                    {addons.filter(a => selectedAddons.includes(a.id)).map(a => (
                      <div key={a.id} className="flex justify-between text-sm">
                        <span className="text-gray-500">{a.label}</span>
                        <span className="font-medium">+₹{a.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Details</h3>
                    <input type="text" placeholder="Cardholder Name" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                    <input type="text" placeholder="Card Number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM / YY" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                      <input type="text" placeholder="CVV" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-500 bg-accent/5 border border-accent/20 rounded-xl p-4">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>Your payment is secured and encrypted. Funds are held until your experience is completed to your satisfaction.</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(1)}>← Back</Button>
                    <Button 
                      className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
                      onClick={handleBook}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Confirm & Pay ₹${total.toLocaleString('en-IN')}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                <h3 className="font-bold mb-5">Your Guide</h3>
                <div className="flex gap-4 items-center mb-5">
                  <img src={guide.image} alt={guide.name} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow" />
                  <div>
                    <p className="font-bold">{guide.name}</p>
                    <p className="text-sm text-primary">{guide.university}</p>
                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{guide.rating} ({guide.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base rate</span>
                    <span className="font-medium">₹{hourlyRate.toLocaleString('en-IN')} / hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{hours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  {addonTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Add-ons</span>
                      <span className="font-medium">+₹{addonTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-5 bg-gray-50 dark:bg-black rounded-xl p-4 text-sm text-gray-500 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Free cancellation up to 48 hours before your experience.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
