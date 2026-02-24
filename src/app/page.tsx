import DemoSection from "@/components/demo-section";
import { ArrowRight, Check, X } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-2.5 text-center bg-surface">
        <p className="text-muted text-xs">
          Open Source &ndash; AI-Powered Lead Qualification Bot
        </p>
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-accent text-sm font-semibold tracking-wide mb-6">
          Lead Intelligence Bot
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-[1.1] mb-6">
          Your sales team is great.
          <br />
          But they can&apos;t work 24/7.
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
          Prospects ask questions in the evening, on weekends, exactly when
          motivation is highest. Without an instant response, they leave
          before your team is back online.
        </p>
      </header>

      {/* Problem Stats */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {[
            { number: "~30%", label: "of leads are unqualified" },
            { number: "5 min", label: "vs. 24h — 21x higher conversion" },
            { number: "24/7", label: "availability with AI qualification" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface p-8 text-center">
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="border-y border-border bg-surface py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See it in action
            </h2>
            <p className="text-muted max-w-xl mx-auto leading-relaxed">
              Alex knows your product, your value proposition, your success
              stories. Responds instantly and qualifies the lead automatically.
            </p>
          </div>
          <DemoSection />
        </div>
      </section>

      {/* Process Flow */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          From click to qualified lead
        </h2>
        <p className="text-muted text-center mb-16 text-sm">
          Fully automated. No manual steps.
        </p>
        <div className="space-y-0">
          {[
            {
              step: "01",
              title: "Prospect asks a question",
              text: "On your website, via chat or video avatar — around the clock.",
            },
            {
              step: "02",
              title: "AI responds instantly",
              text: "Empathetic, based on your knowledge base. Builds trust.",
            },
            {
              step: "03",
              title: "Lead gets qualified",
              text: "Automatic scoring: HOT, WARM, or COLD. Summary generated.",
            },
            {
              step: "04",
              title: "Sales team gets notified",
              text: "Slack notification + CRM entry. Only pre-qualified leads.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`flex gap-6 py-6 ${i < 3 ? "border-b border-border" : ""}`}
            >
              <span className="text-sm font-mono text-muted/40 pt-0.5 shrink-0">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {[
            "Make.com",
            "HubSpot",
            "Slack",
            "Claude AI",
            "Anam AI",
            "Next.js",
            "Vercel",
          ].map((tech) => (
            <span
              key={tech}
              className="text-xs text-muted bg-muted-light px-3 py-1.5 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <section className="bg-dark-bg py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-14 text-center">
            Before vs. After
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                Today
              </p>
              <ul className="space-y-4">
                {[
                  "Lead asks a question — waits hours for a callback",
                  "Sales rep asks basic qualifying questions manually",
                  "~30% of conversations are unqualified",
                  "No lead scoring, no prioritization",
                  "Evenings & weekends: nobody available",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-zinc-500 text-sm"
                  >
                    <X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-6">
                With Lead Intelligence Bot
              </p>
              <ul className="space-y-4">
                {[
                  "Instant response, 24/7, including video",
                  "AI answers FAQs and builds trust",
                  "Automatic qualification (HOT / WARM / COLD)",
                  "Sales team only gets pre-qualified leads",
                  "Lead score + summary before the call",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-zinc-300 text-sm"
                  >
                    <Check
                      className="w-4 h-4 text-accent mt-0.5 shrink-0"
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
          Concrete Impact
        </h2>
        <p className="text-muted text-sm text-center mb-14">
          Based on ~50 initial conversations/week, 5-10 sales reps, ~30%
          unqualified leads
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {[
            { value: "~15", label: "Conversations/week pre-qualified" },
            { value: "~4h", label: "Sales time saved per week" },
            { value: "24/7", label: "Availability" },
            { value: "~$50", label: "API cost per month" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted/50 mt-4">
          ROI: 4-12x &middot; Payback from month 1 &middot; Conservative
          estimate
        </p>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            What you can build with this
          </h2>
          <p className="text-muted text-sm text-center mb-16">
            Fully customizable. Open source. Deploy in minutes.
          </p>

          <div className="space-y-0">
            {[
              {
                title: "Conversational Lead Qualification",
                text: "AI asks qualifying questions naturally, not as a form. Builds trust through real conversation.",
              },
              {
                title: "Configurable Scoring Engine",
                text: "Define your own scoring weights, thresholds, and qualification criteria in simple JSON config files.",
              },
              {
                title: "Webhook Integration",
                text: "Forward qualified leads to Make.com, n8n, Zapier — or directly to your CRM via webhooks.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`py-6 ${i < 2 ? "border-b border-border" : ""}`}
              >
                <h3 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <p className="text-xs text-muted/50">
            lead-intelligence-bot &middot; Open Source &middot; MIT License
          </p>
        </div>
      </footer>
    </main>
  );
}
