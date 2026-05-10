import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Shield, MapPin, Bell, Brain, Smartphone, Lock, Sparkles, ArrowRight, Check } from "lucide-react";

const features = [
  { icon: Shield, title: "Smart App Limits", desc: "Set daily time on every app. Auto-block when the limit is hit." },
  { icon: Brain, title: "AI Content Moderation", desc: "On-device AI flags unsafe images, messages and websites in real time." },
  { icon: MapPin, title: "Live Location & History", desc: "See where your child is now and review the day on a map." },
  { icon: Bell, title: "Instant Alerts", desc: "Push notifications for new installs, risky words, location leaves." },
  { icon: Smartphone, title: "Multi-Device", desc: "Pair multiple Android & iPhone devices per child with one QR scan." },
  { icon: Lock, title: "PIN-Locked Dashboard", desc: "Admin PIN + auto-lock after 1 minute keeps controls private." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* aurora */}
      <div className="absolute inset-0 ge-aurora opacity-70 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      {/* nav */}
      <header className="relative z-10 container flex items-center justify-between py-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth?mode=signup"><Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">Get started</Button></Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 container pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered family safety, redesigned for 2026
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto animate-fade-in">
          Keep them safe.<br />
          <span className="ge-gradient-text">Without watching every screen.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          GuardianEye gives you real-time visibility into your child's digital world — app time, websites, location and AI-flagged risks — across Android and iPhone.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 animate-fade-in">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow h-12 px-8 text-base">
              Start free for 14 days <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="h-12 px-6 text-base">See how it works</Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required · Cancel anytime</p>

        {/* dashboard preview card */}
        <div className="relative mx-auto mt-20 max-w-5xl animate-fade-in">
          <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-3xl" />
          <div className="relative ge-glass rounded-3xl p-2 shadow-glow">
            <div className="rounded-2xl bg-background/80 p-6 grid md:grid-cols-3 gap-4 text-left">
              {[
                { label: "Today's screen time", value: "3h 24m", sub: "−18% vs yesterday", color: "from-primary to-primary-glow" },
                { label: "Apps blocked", value: "12", sub: "TikTok, Discord, +10", color: "from-accent to-primary" },
                { label: "AI alerts", value: "2", sub: "1 unsafe image flagged", color: "from-warning to-primary-glow" },
              ].map((s) => (
                <div key={s.label} className="ge-card p-5 animate-float" style={{ animationDelay: `${Math.random()}s` }}>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className={`mt-2 font-display text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* features */}
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

      {/* pricing */}
      <section id="pricing" className="relative z-10 container py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Simple pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you're ready.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { name: "Free", price: "$0", note: "1 child, 1 device", features: ["App time tracking", "Web filter", "Daily summary"] },
            { name: "Premium", price: "$9.99", note: "per month · unlimited children", features: ["Everything in Free", "AI content moderation", "Live location & history", "Instant alerts", "Priority support"], featured: true },
          ].map((p) => (
            <div key={p.name} className={`ge-card p-8 relative ${p.featured ? "border-primary/60 shadow-glow" : ""}`}>
              {p.featured && <div className="absolute -top-3 right-6 text-xs font-semibold bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full">Most popular</div>}
              <div className="font-display font-semibold">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.note}</div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth?mode=signup" className="block mt-6">
                <Button className={`w-full ${p.featured ? "bg-gradient-primary text-primary-foreground shadow-glow" : ""}`} variant={p.featured ? "default" : "outline"}>
                  Get started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 container py-10 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-muted-foreground">© 2026 GuardianEye. Built with care for families.</p>
      </footer>
    </div>
  );
};

export default Landing;
