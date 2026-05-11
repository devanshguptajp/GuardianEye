import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Shield, MapPin, Bell, Brain, Smartphone, Lock, Sparkles, ArrowRight, Check, Star, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const features = [
  { icon: Shield, title: "Smart App Limits", desc: "Set daily time on every app. Auto-block enforced when limit is hit (Pro)." },
  { icon: Brain, title: "AI Content Moderation", desc: "On-device AI flags unsafe images, messages and websites in real time (Pro)." },
  { icon: MapPin, title: "Live Location & History", desc: "See where your child is now and review the day on a map (Pro)." },
  { icon: Bell, title: "Instant Alerts", desc: "Push notifications for new installs, risky words and location events (Pro)." },
  { icon: Smartphone, title: "Multi-Device", desc: "Pair up to 5 Android & iPhone devices per child with one QR scan." },
  { icon: Lock, title: "PIN-Locked Dashboard", desc: "Admin PIN keeps parent controls private, even on a shared device." },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Sign up for free and get 14 days of Pro features instantly — no credit card needed." },
  { n: "02", title: "Add a child profile", desc: "Enter your child's name and a few details. You can add up to 5 children on Pro." },
  { n: "03", title: "Pair their device", desc: "Open GuardianEye on their phone and scan the QR code. Done in under a minute." },
  { n: "04", title: "Monitor & protect", desc: "Set time limits, block sites, receive AI alerts, and track location from one dashboard." },
];

const reviews = [
  { name: "Priya Sharma", role: "Mother of 2, Mumbai", text: "GuardianEye gave me real peace of mind. I can see exactly what my kids are doing online without invading their privacy. The AI alerts caught something worrying before it became a problem.", rating: 5 },
  { name: "Rahul Mehta", role: "Father, Bangalore", text: "The app time limits actually work. My son used to spend hours on YouTube Shorts — now he gets his daily limit and the app locks. No arguments, the phone does it automatically.", rating: 5 },
  { name: "Deepa Krishnan", role: "Parent, Chennai", text: "Setup took less than 5 minutes. The QR pairing is brilliant. I have both my kids' phones connected and I get a daily summary every evening. Exactly what I needed.", rating: 5 },
  { name: "Vikram Singh", role: "Father of 3, Delhi", text: "Finally an app that doesn't feel creepy. GuardianEye shows me the important stuff — screen time, location, alerts — without logging every single keystroke. Great balance.", rating: 5 },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    note: "1 child · 1 device",
    features: [
      "App time tracking (no auto-lock)",
      "Web filter — specific domains only",
      "Daily summary report",
    ],
    cta: "Get started free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "3 months",
    note: "Up to 5 children · 5 devices",
    badge: "Most popular",
    features: [
      "Everything in Free",
      "Auto-lock when daily limit is hit",
      "AI content moderation",
      "Live location & history",
      "Instant alerts",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Pro Annual",
    price: "₹1,299",
    period: "year",
    note: "Up to 5 children · 5 devices",
    badge: "Best value",
    features: [
      "Everything in Pro",
      "Save over 56% vs monthly",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: false,
    highlight: true,
  },
];

const Landing = () => {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 ge-aurora opacity-70 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 container flex items-center justify-between py-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="h-8 w-8 rounded-lg border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/sign-in"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/sign-up"><Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">Get started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 container pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered family safety · Free 14-day Pro trial
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto animate-fade-in">
          Keep them safe.<br />
          <span className="ge-gradient-text">Without watching every screen.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          GuardianEye gives you real-time visibility into your child's digital world — app time, websites, location and AI-flagged risks — across Android and iPhone.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
          <Link to="/sign-up">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow h-12 px-8 text-base">
              Start free for 14 days <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how">
            <Button size="lg" variant="outline" className="h-12 px-6 text-base">See how it works</Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required · Cancel anytime</p>

        <div className="relative mx-auto mt-20 max-w-5xl animate-fade-in">
          <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-3xl" />
          <div className="relative ge-glass rounded-3xl p-2 shadow-glow">
            <div className="rounded-2xl bg-background/80 p-6 grid md:grid-cols-3 gap-4 text-left">
              {[
                { label: "Today's screen time", value: "3h 24m", sub: "−18% vs yesterday", color: "from-primary to-primary-glow" },
                { label: "Apps blocked", value: "12", sub: "TikTok, Discord, +10", color: "from-accent to-primary" },
                { label: "AI alerts", value: "2", sub: "1 unsafe image flagged", color: "from-warning to-primary-glow" },
              ].map((s) => (
                <div key={s.label} className="ge-card p-5 animate-float">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className={`mt-2 font-display text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Everything you need.<br />Nothing creepy.</h2>
          <p className="mt-4 text-muted-foreground">Built mobile-first, privacy-first, with the kind of UI you actually want to open.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="ge-card p-6 hover:border-primary/40 transition-all hover:-translate-y-1 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary/10 grid place-items-center mb-4 group-hover:shadow-glow transition-shadow">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Up and running<br /><span className="ge-gradient-text">in under 5 minutes.</span></h2>
          <p className="mt-4 text-muted-foreground">No technical skills needed. Just sign up, add your child and scan a QR code.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.n} className="ge-card p-6 relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-border z-10" />
              )}
              <div className="font-display text-4xl font-bold ge-gradient-text mb-4">{s.n}</div>
              <h3 className="font-display font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Trusted by families<br />across India</h2>
          <p className="mt-4 text-muted-foreground">Real parents, real peace of mind.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((r) => (
            <div key={r.name} className="ge-card p-6 flex flex-col gap-3 hover:border-primary/40 transition-all">
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground flex-1">"{r.text}"</p>
              <div>
                <div className="font-medium text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Simple, honest pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you're ready. All plans include a 14-day Pro trial.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`ge-card p-8 relative flex flex-col ${p.featured ? "border-primary/60 shadow-glow" : p.highlight ? "border-accent/40" : ""}`}>
              {p.badge && (
                <div className={`absolute -top-3 right-6 text-xs font-semibold px-3 py-1 rounded-full ${p.featured ? "bg-gradient-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                  {p.badge}
                </div>
              )}
              <div className="font-display font-semibold text-lg">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/{p.period}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.note}</div>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/sign-up" className="block mt-8">
                <Button
                  className={`w-full ${p.featured ? "bg-gradient-primary text-primary-foreground shadow-glow" : ""}`}
                  variant={p.featured ? "default" : "outline"}
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Prices in Indian Rupees (INR) · Payment coming soon · All trials include full Pro access
        </p>
      </section>

      <footer className="relative z-10 container py-10 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-muted-foreground">© 2026 GuardianEye. Built with care for families.</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
