import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Shield, MapPin, Bell, Brain, Smartphone, Lock, Sparkles, ArrowRight, Check, Star, Sun, Moon, ChevronDown, Mail, MessageSquare } from "lucide-react";
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
    cta: "Start 14-day free trial",
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
      "Save over 56% vs quarterly",
      "Priority support",
    ],
    cta: "Start 14-day free trial",
    featured: false,
    highlight: true,
  },
];

const faqs = [
  { q: "How do I set up GuardianEye on my child's phone?", a: "Create your account, add a child profile, then open GuardianEye on your child's device and scan the QR code shown on your dashboard under 'Pair Device'. The whole process takes under 5 minutes." },
  { q: "Does app blocking work on Android?", a: "GuardianEye uses Android's Usage Stats and Accessibility APIs to monitor foreground apps and enforce time limits. When a limit is hit, a lock overlay appears — the child cannot bypass it without your parent PIN." },
  { q: "What is the Parent PIN and why do I need it?", a: "The Parent PIN is a 4–6 digit code you set in Settings. It protects sensitive actions — changing restrictions, unpairing devices, unlocking blocked apps — so your child can't undo your settings." },
  { q: "How long is the free trial and do I need a credit card?", a: "Every new account gets a full 14-day Pro trial with no credit card required. When the trial ends, your account reverts to the Free plan. You can upgrade any time." },
  { q: "How many children and devices can I add?", a: "The Free plan supports 1 child and 1 device. Pro plans (Quarterly and Annual) support up to 5 children and 5 devices." },
  { q: "Does GuardianEye work on iPhones?", a: "The parent dashboard works on any device including iPhone. Full child-side monitoring (app blocking, screen time enforcement) is currently Android-focused. iPhone support with Screen Time API integration is planned for a future update." },
  { q: "What websites and searches does it monitor?", a: "GuardianEye can log visited domains and flag searches matching harmful keyword categories — adult content, violence, self-harm and more. You can also manually block specific domains or entire categories like social media or gaming sites." },
  { q: "What are AI Safety Alerts?", a: "Our AI monitoring system scans app usage patterns, search behaviour and flagged keywords in real time. If it detects something concerning — such as self-harm searches or contact with strangers — it sends you an instant push notification." },
  { q: "Can I track my child's location?", a: "Yes. Pro users can see a live map with the child's current location, location history for the day, and set geofencing alerts that notify you when they arrive at or leave a location." },
  { q: "What is screen time tracking?", a: "GuardianEye logs daily, weekly and monthly usage per app. You see which apps your child uses most, for how long, and at what times — so you can make informed decisions about limits." },
  { q: "Can my child see that they're being monitored?", a: "Children can see their own screen time, blocked apps and daily limits through a friendly Child View. They cannot see alert details or parent settings. GuardianEye is transparent — not hidden — to encourage healthy conversations." },
  { q: "How do I give a family member free Pro access?", a: "After deployment, go to your Replit database console and run: UPDATE profiles SET subscription_tier = 'premium' WHERE id = '<their_clerk_user_id>'; Their account will immediately show 'Pro · Lifetime' access with no expiry." },
  { q: "What happens when a screen time limit is reached?", a: "The app displays a GuardianEye lock overlay on the child's device. The app is inaccessible until the parent grants a temporary unlock using their PIN, or until the next day's limit resets." },
  { q: "Is my family's data private and secure?", a: "All data is encrypted in transit using TLS. Your database is isolated per account. We do not sell your data or share it with third parties. Contact us at guardianeye.family@gmail.com for our full privacy policy." },
  { q: "How do I contact support?", a: "Email us at guardianeye.family@gmail.com or websitemakerdevu@gmail.com. We typically respond within 24 hours. You can also use the feedback form on the Support page." },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ge-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

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
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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
          <Link to="/sign-up">
            <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 container pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered family safety · Free 14-day Pro trial — no credit card needed
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
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow h-12 px-6 text-base">
              See how it works
            </Button>
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
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you're ready. All accounts get a 14-day Pro trial.</p>
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
                <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Prices in Indian Rupees (INR) · Payment coming soon · All accounts include a 14-day free Pro trial
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Frequently asked<br /><span className="ge-gradient-text">questions</span></h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about GuardianEye.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Contact / Support */}
      <section className="relative z-10 container py-16">
        <div className="ge-card p-8 md:p-12 max-w-3xl mx-auto text-center relative overflow-hidden">
          <div className="absolute inset-0 ge-aurora opacity-20 pointer-events-none" />
          <div className="relative">
            <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold">Need help?</h2>
            <p className="mt-3 text-muted-foreground">Our support team responds within 24 hours. Reach us at either address below.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:guardianeye.family@gmail.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4 text-primary" />
                guardianeye.family@gmail.com
              </a>
              <a
                href="mailto:websitemakerdevu@gmail.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4 text-primary" />
                websitemakerdevu@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 container py-10 border-t border-border/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-xs text-muted-foreground text-center">© 2026 GuardianEye. Built with care for families.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="mailto:guardianeye.family@gmail.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
