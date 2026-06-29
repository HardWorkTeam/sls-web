import Header from "./components/Header";
import TemplatePreview from "./components/TemplatePreview";
import {
  featuredPackageId,
  formatPrice,
  getPackages,
  getStats,
  getTemplates,
} from "./lib/catalog";
import { LOGIN_URL, REGISTER_URL, templatePreviewUrl } from "./site-config";

// Signature brand gradient (green → yellow), expressed with Tailwind utilities.
const BRAND_GRADIENT = "bg-linear-to-r from-emerald via-[#2f7a57] to-gold";
const BRAND_TEXT_GRADIENT = `${BRAND_GRADIENT} bg-clip-text text-transparent`;

const FEATURES = [
  {
    title: "Digital Invitations",
    desc: "Choose from elegant, designer templates and share a personalised invite in minutes.",
    icon: "M4 4h16v12H5.17L4 17.17V4zm2 3v2h12V7H6zm0 4v2h8v-2H6z",
  },
  {
    title: "RSVP Tracking",
    desc: "Guests reply with one tap. Watch confirmations roll in on a live dashboard.",
    icon: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  },
  {
    title: "Seating Planner",
    desc: "Drag guests onto tables and design the perfect arrangement for your reception.",
    icon: "M4 11h16v2H4zm2 4h12v5H6zM6 4h12v5H6z",
  },
  {
    title: "Guest List",
    desc: "Keep every name, contact and dietary note organised in one tidy place.",
    icon: "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  },
  {
    title: "Photo Gallery",
    desc: "Collect engagement and event photos in a shared album everyone can enjoy.",
    icon: "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z",
  },
  {
    title: "Gift Tracking",
    desc: "Record gifts and contributions, with KHQR support, and send thank-yous on time.",
    icon: "M20 7h-3.17A3 3 0 0 0 12 3.17 3 3 0 0 0 7.17 7H4v4h1v9h14v-9h1V7zm-8-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM11 19H7v-7h4v7zm6 0h-4v-7h4v7z",
  },
  {
    title: "Expense Tracking",
    desc: "Set a budget, log every cost and always know exactly where you stand.",
    icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1H6.32c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  },
  {
    title: "Wedding Timeline",
    desc: "Map out the day's schedule so the whole party knows what happens next.",
    icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your wedding",
    desc: "Sign up, add your names and your date. Your couple portal is ready in seconds.",
  },
  {
    n: "02",
    title: "Design & invite",
    desc: "Pick a template, personalise it, and share your digital invitation with guests.",
  },
  {
    n: "03",
    title: "Manage every detail",
    desc: "Track RSVPs, plan seating, log gifts and expenses — all from one dashboard.",
  },
];

function titleCase(value?: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-gold"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default async function Home() {
  const [packages, templates, stats] = await Promise.all([
    getPackages(),
    getTemplates(),
    getStats(),
  ]);
  const featuredId = featuredPackageId(packages);

  // Hero social-proof stats. The couples count comes from the live platform;
  // if it's unavailable (0), fall back to a generic "effortless dashboard" stat.
  const heroStats: [string, string][] = [
    [String(FEATURES.length), "Planning tools"],
    [
      templates.length > 0 ? String(templates.length) : "6",
      "Designer templates",
    ],
    stats.couples > 0
      ? [`${stats.couples.toLocaleString()}+`, "Couples"]
      : ["1", "Effortless dashboard"],
  ];

  return (
    <div id="top" className="flex flex-1 flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 70% 0%, rgba(231,210,154,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 10% 20%, rgba(232,180,184,0.25) 0%, transparent 55%)",
            }}
          />
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 text-xs font-medium text-emerald shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              The all-in-one wedding platform
            </span>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
              Your wedding,{" "}
              <span className={`${BRAND_TEXT_GRADIENT} italic`}>
                beautifully
              </span>{" "}
              managed.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              From the first invitation to the final thank-you, Srolanh brings
              every part of your big day together — invitations, RSVPs, seating,
              guests, gifts and budget — in one elegant place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={REGISTER_URL}
                className={`${BRAND_GRADIENT} rounded-full px-7 py-3.5 text-base font-medium text-white shadow-md transition-opacity hover:opacity-90`}
              >
                Plan your wedding free
              </a>
              <a
                href="#features"
                className="rounded-full border border-line bg-card px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:border-gold"
              >
                Explore features
              </a>
            </div>
            <p className="mt-5 text-sm text-muted">
              No credit card required · Free plan available
            </p>

            {/* Stats */}
            <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-6 border-t border-line pt-10">
              {heroStats.map(([num, label]) => (
                <div key={label}>
                  <div
                    className={`${BRAND_TEXT_GRADIENT} font-serif text-3xl font-semibold sm:text-4xl`}
                  >
                    {num}
                  </div>
                  <div className="mt-1 text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              Everything in one place
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Tools for every part of the journey
            </h2>
            <p className="mt-4 text-lg text-muted">
              Replace the spreadsheets and group chats. Srolanh keeps your whole
              celebration organised, from save-the-date to the last dance.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-line bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-white">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="bg-emerald-deep py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-soft">
                Invitation templates
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Designs as memorable as the moment
              </h2>
              <p className="mt-4 text-lg text-white/70">
                From traditional Khmer artistry to modern editorial elegance —
                find a style that feels like you.
              </p>
            </div>

            {templates.length > 0 ? (
              <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                  <a
                    key={t.id}
                    href={templatePreviewUrl(t.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-gold-soft/60 hover:shadow-xl"
                  >
                    <div className="relative">
                      <TemplatePreview
                        src={templatePreviewUrl(t.slug)}
                        title={t.name}
                        ratio={4 / 3}
                      />
                      {/* Hover affordance — the thumbnail itself is inert */}
                      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="mb-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-emerald-deep">
                          View full invitation →
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <span className="font-medium text-white">{t.name}</span>
                      {t.config?.layout && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gold-soft">
                          {titleCase(t.config.layout)}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-14 text-center text-white/60">
                Our designer templates are on their way — check back soon.
              </p>
            )}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Up and running in three steps
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative text-center md:text-left">
                <div className="font-serif text-5xl font-semibold text-gold-soft">
                  {s.n}
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-card/60 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                Simple pricing
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                One payment per wedding
              </h2>
              <p className="mt-4 text-lg text-muted">
                Choose the plan that fits your celebration. Start free and
                upgrade anytime.
              </p>
            </div>

            {packages.length > 0 ? (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {packages.map((p) => {
                  const featured = p.id === featuredId;
                  const isFree = (p.price ?? 0) === 0;
                  return (
                    <div
                      key={p.id}
                      className={`relative flex flex-col rounded-2xl border p-7 ${
                        featured
                          ? "border-emerald bg-emerald text-white shadow-xl lg:-translate-y-3"
                          : "border-line bg-card text-foreground shadow-sm"
                      }`}
                    >
                      {featured && (
                        <span
                          className={`${BRAND_GRADIENT} absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white`}
                        >
                          Most popular
                        </span>
                      )}
                      <h3
                        className={`font-serif text-xl font-semibold ${
                          featured ? "text-white" : "text-emerald"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-serif text-4xl font-semibold">
                          {formatPrice(p.price, p.currency)}
                        </span>
                        <span
                          className={featured ? "text-white/70" : "text-muted"}
                        >
                          / wedding
                        </span>
                      </div>
                      {p.description && (
                        <p
                          className={`mt-3 text-sm ${
                            featured ? "text-white/80" : "text-muted"
                          }`}
                        >
                          {p.description}
                        </p>
                      )}
                      <ul className="mt-6 flex-1 space-y-3">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex gap-2.5 text-sm">
                            <Check />
                            <span className={featured ? "text-white/90" : ""}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={REGISTER_URL}
                        className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-medium transition-opacity ${
                          featured
                            ? "bg-white text-emerald hover:bg-gold-soft"
                            : `${BRAND_GRADIENT} text-white hover:opacity-90`
                        }`}
                      >
                        {isFree ? "Start for free" : `Choose ${p.name}`}
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-14 text-center text-muted">
                Pricing is being updated. Please check back shortly.
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-emerald px-8 py-16 text-center text-white sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(50% 80% at 50% 0%, rgba(231,210,154,0.4) 0%, transparent 70%)",
              }}
            />
            <h2 className="relative mx-auto max-w-2xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Start planning the wedding you&apos;ve always imagined
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/80">
              Join couples using Srolanh to bring calm, beauty and order to
              their big day.
            </p>
            <a
              href={REGISTER_URL}
              className="relative mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-base font-medium text-emerald shadow-md transition-colors hover:bg-gold-soft"
            >
              Create your free account
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <img
              src="/srolanh-logo.png"
              alt="Srolanh"
              className="h-auto w-24 object-contain"
            />
            <span className="text-sm text-muted">
              · Wedding Management Platform
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <a href="#features" className="hover:text-emerald">
              Features
            </a>
            <a href="#templates" className="hover:text-emerald">
              Invitations
            </a>
            <a href="#pricing" className="hover:text-emerald">
              Pricing
            </a>
            <a href={LOGIN_URL} className="hover:text-emerald">
              Log in
            </a>
          </nav>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Srolanh
          </p>
        </div>
      </footer>
    </div>
  );
}
