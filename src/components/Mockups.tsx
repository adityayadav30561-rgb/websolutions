import { useRef, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Img } from "./Media";
import { photos } from "../content/media";
import type { ProjectId } from "../content/site";

/*
 * Interface mockups. Everything inside a frame is sized in cqw (1cqw = 1% of the
 * frame's width) so a mockup renders identically at any size.
 *
 * A frame's viewport is a size container, so a mock's `.mock-pan` layer can scroll
 * to exactly its own end (100% - 100cqh). Frames pan only while on screen.
 */

type FrameProps = {
  url: string;
  children: ReactNode;
  /** Aspect ratio of the page viewport inside the chrome. */
  ratio?: string;
  /** Keep the page at the top instead of auto-scrolling it. */
  still?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function BrowserFrame({ url, children, ratio = "16 / 10", still, className = "", style }: FrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  return (
    <div ref={ref} className={`mock keep-light react ${inView && !still ? "is-live" : ""} ${className}`} style={style}>
      <div className="overflow-hidden rounded-[1.3cqw] bg-white shadow-[0_0.2cqw_0.6cqw_rgb(20_24_32/0.06),0_3cqw_6cqw_-2cqw_rgb(20_24_32/0.22)] ring-1 ring-black/[0.07]">
        <div className="flex h-[4.2cqw] items-center gap-[0.7cqw] border-b border-black/[0.06] bg-[#f5f5f3] px-[1.6cqw]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[1.05cqw] rounded-full bg-black/[0.13]" />
          ))}
          <span className="mx-auto flex h-[2.3cqw] w-[42%] items-center justify-center rounded-full bg-white font-geist text-[1.05cqw] text-black/45 ring-1 ring-black/[0.05]">
            {url}
          </span>
          <span className="w-[4.5cqw]" />
        </div>
        <div className="relative overflow-hidden" style={{ aspectRatio: ratio, containerType: "size" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PhoneFrame({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  return (
    <div ref={ref} className={`mock keep-light react ${inView ? "is-live" : ""} ${className}`} style={style}>
      <div className="rounded-[14cqw] bg-[#1b1c1f] p-[2.6cqw] shadow-[0_10cqw_18cqw_-8cqw_rgb(20_24_32/0.4),0_1cqw_2cqw_rgb(20_24_32/0.12)] ring-1 ring-black/20">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[11.6cqw] bg-white" style={{ containerType: "size" }}>
          {children}
          <span className="absolute left-1/2 top-[2.4cqw] h-[6.4cqw] w-[26cqw] -translate-x-1/2 rounded-full bg-[#1b1c1f]" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Maison Alder — e-commerce ───────────────────────── */

const storeProducts = [
  { photo: photos.armchair, name: "Sören armchair", price: "€640", tag: "New" },
  { photo: photos.stool, name: "Alba stool", price: "€180" },
  { photo: photos.chairBlack, name: "Ines side chair", price: "€240" },
  { photo: photos.lamp, name: "Corvo wall lamp", price: "€210", tag: "Low stock" },
];

export function StoreMock() {
  return (
    <div className="mock-pan bg-[#f6f2ea] font-geist text-[#27241f]">
      <div className="bg-[#27241f] py-[0.7cqw] text-center text-[0.95cqw] text-[#f6f2ea]/80">Free delivery over €400 across the EU</div>
      <header className="flex items-center justify-between px-[3.2cqw] py-[1.7cqw] text-[1.1cqw]">
        <span className="font-serif text-[2cqw] tracking-tight">Maison Alder</span>
        <nav className="flex gap-[2.6cqw] text-[#27241f]/70">
          <span className="text-[#27241f]">Living</span>
          <span>Dining</span>
          <span>Bedroom</span>
          <span>Lighting</span>
          <span>Journal</span>
        </nav>
        <span className="flex items-center gap-[1.8cqw]">
          <span className="text-[#27241f]/70">Search</span>
          <span className="rounded-full bg-[#27241f] px-[1.3cqw] py-[0.5cqw] text-[#f6f2ea]">Bag 2</span>
        </span>
      </header>

      <section className="grid grid-cols-[0.9fr_1.3fr] gap-[2.4cqw] px-[3.2cqw] pb-[3cqw]">
        <div className="flex flex-col justify-between pt-[2cqw]">
          <div>
            <h3 className="font-serif text-[5.4cqw] font-[350] leading-[0.98] tracking-[-0.02em]">Furniture for slower living</h3>
            <p className="mt-[1.6cqw] max-w-[30cqw] text-[1.2cqw] leading-[1.5] text-[#27241f]/65">
              Solid oak, wool and linen, made to order in Porto and delivered in four weeks.
            </p>
          </div>
          <div className="flex items-center gap-[1.6cqw] text-[1.15cqw]">
            <span className="rounded-full bg-[#27241f] px-[2cqw] py-[1cqw] text-[#f6f2ea]">Shop the living room</span>
            <span className="border-b border-[#27241f]/40 pb-[0.2cqw]">Book a showroom visit</span>
          </div>
        </div>
        <div className="relative aspect-[5/3.6] overflow-hidden rounded-[0.9cqw] bg-[#d9d2c4]">
          <Img photo={photos.sofaGreen} sizes="(min-width:1024px) 40vw, 60vw" decorative eager />
          <div className="absolute bottom-[1.4cqw] left-[1.4cqw] flex items-center gap-[1.2cqw] rounded-[0.8cqw] bg-white/85 px-[1.3cqw] py-[0.9cqw] text-[1.05cqw] backdrop-blur-md">
            <span className="size-[0.9cqw] rounded-full bg-[#2f5d50]" />
            <span>
              <span className="block font-medium">Oda sofa, moss velvet</span>
              <span className="text-[#27241f]/60">€1,890 · 3 seats</span>
            </span>
          </div>
        </div>
      </section>

      <section className="px-[3.2cqw] pb-[3.4cqw]">
        <div className="mb-[1.5cqw] flex items-baseline justify-between text-[1.1cqw]">
          <span className="font-serif text-[2.2cqw]">New this season</span>
          <span className="text-[#27241f]/60">View all 48</span>
        </div>
        <div className="grid grid-cols-4 gap-[1.5cqw]">
          {storeProducts.map((it) => (
            <div key={it.name}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[0.7cqw] bg-[#e7e1d5]">
                <Img photo={it.photo} sizes="20vw" decorative />
                {it.tag && <span className="absolute left-[0.8cqw] top-[0.8cqw] rounded-full bg-white/90 px-[0.9cqw] py-[0.3cqw] text-[0.9cqw]">{it.tag}</span>}
              </div>
              <div className="mt-[0.9cqw] flex justify-between text-[1.08cqw]">
                <span>{it.name}</span>
                <span className="text-[#27241f]/60">{it.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-[3.2cqw] mb-[3.2cqw] aspect-[16/6] overflow-hidden rounded-[0.9cqw] bg-[#d9d2c4]">
        <Img photo={photos.roomBeige} sizes="60vw" decorative />
        <div className="absolute inset-y-0 left-0 flex w-[42%] flex-col justify-center bg-[#f6f2ea]/88 px-[3cqw] backdrop-blur-sm">
          <span className="font-serif text-[3cqw] leading-[1.05]">Shop the room</span>
          <span className="mt-[0.9cqw] text-[1.1cqw] leading-[1.5] text-[#27241f]/65">Nine pieces from the Lisbon apartment, styled together.</span>
          <span className="mt-[1.4cqw] w-fit border-b border-[#27241f]/50 text-[1.1cqw]">See all nine</span>
        </div>
      </section>

      <footer className="flex justify-between border-t border-[#27241f]/10 px-[3.2cqw] py-[2cqw] text-[1cqw] text-[#27241f]/55">
        <span>Maison Alder, Rua das Flores 28, Porto</span>
        <span>Delivery · Care · Trade</span>
      </footer>
    </div>
  );
}

/* ───────────────────────── Ledgerly — SaaS finance ───────────────────────── */

const invoices = [
  { client: "Atelier Brandt", no: "INV-2041", due: "12 Nov", amount: "€8,400", status: "Paid", tone: "bg-emerald-500/12 text-emerald-700" },
  { client: "Fold Coffee Co.", no: "INV-2040", due: "09 Nov", amount: "€3,150", status: "Sent", tone: "bg-indigo-500/12 text-indigo-700" },
  { client: "Okafor & Lind", no: "INV-2038", due: "02 Nov", amount: "€12,900", status: "Overdue", tone: "bg-rose-500/12 text-rose-700" },
  { client: "Studio Marén", no: "INV-2037", due: "30 Oct", amount: "€5,600", status: "Paid", tone: "bg-emerald-500/12 text-emerald-700" },
];

const expenses: [string, string, number][] = [
  ["Payroll", "€31,400", 82],
  ["Freelancers", "€6,300", 48],
  ["Software", "€4,120", 34],
  ["Studio rent", "€3,800", 30],
  ["Travel", "€1,950", 16],
];
const clients = [
  ["Atelier Brandt", "€48,200", "€0", "12 Nov"],
  ["Okafor & Lind", "€36,750", "€12,900", "02 Nov"],
  ["Studio Marén", "€22,400", "€0", "30 Oct"],
  ["Fold Coffee Co.", "€14,900", "€3,150", "09 Nov"],
  ["Halden Bikes", "€9,600", "€5,600", "21 Oct"],
];

/** App shell: the sidebar stays put while the main column scrolls. */
export function LedgerMock() {
  const card = "rounded-[0.9cqw] bg-white p-[1.3cqw] ring-1 ring-black/[0.06]";
  return (
    <div className="absolute inset-0 flex bg-[#fafafa] font-geist text-[#191b22]">
      <aside className="flex w-[17%] flex-col border-r border-black/[0.06] bg-white px-[1.4cqw] py-[1.8cqw] text-[1.08cqw]">
        <span className="mb-[2.2cqw] flex items-center gap-[0.7cqw] text-[1.4cqw] font-semibold tracking-tight">
          <span className="grid size-[2.1cqw] place-items-center rounded-[0.55cqw] bg-[#4338ca] text-[1.1cqw] text-white">L</span>
          Ledgerly
        </span>
        {["Overview", "Invoices", "Expenses", "Clients", "Reports"].map((l, i) => (
          <span key={l} className={`mb-[0.3cqw] rounded-[0.6cqw] px-[0.9cqw] py-[0.7cqw] ${i === 0 ? "bg-[#4338ca]/8 font-medium text-[#4338ca]" : "text-black/55"}`}>
            {l}
          </span>
        ))}
        <span className="mt-auto rounded-[0.8cqw] bg-[#f4f4f6] p-[1cqw] text-[0.95cqw] leading-[1.4] text-black/55">
          <span className="block font-medium text-black/80">VAT return</span>
          Due in 9 days
        </span>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">
        <div className="mock-pan flex flex-col gap-[1.3cqw] p-[1.8cqw]">
          <div className="flex items-center justify-between">
            <span className="text-[1.9cqw] font-semibold tracking-tight">Good morning, Inês</span>
            <span className="flex gap-[0.8cqw] text-[1.05cqw]">
              <span className="rounded-[0.6cqw] bg-white px-[1.2cqw] py-[0.7cqw] ring-1 ring-black/[0.08]">Oct 2026</span>
              <span className="rounded-[0.6cqw] bg-[#191b22] px-[1.2cqw] py-[0.7cqw] text-white">New invoice</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-[1.2cqw]">
            {[
              ["Cash in bank", "€84,210", "+6.2%"],
              ["Outstanding", "€21,650", "7 invoices"],
              ["Runway", "8.4 months", "+0.6"],
            ].map(([k, v, d]) => (
              <div key={k} className={card}>
                <span className="block text-[1cqw] text-black/50">{k}</span>
                <span className="mt-[0.4cqw] flex items-baseline justify-between">
                  <span className="text-[2.2cqw] font-semibold tracking-tight tabular-nums">{v}</span>
                  <span className="text-[0.95cqw] text-emerald-600">{d}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="grid h-[38cqw] grid-cols-[1.5fr_1fr] gap-[1.2cqw]">
            <div className={`flex flex-col ${card}`}>
              <div className="flex justify-between text-[1cqw] text-black/50">
                <span className="font-medium text-black/80">Cash flow</span>
                <span>Money in vs. out, 12 weeks</span>
              </div>
              <svg viewBox="0 0 400 130" className="mt-[0.8cqw] min-h-0 w-full flex-1" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="lg-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#4338ca" stopOpacity="0.22" />
                    <stop offset="1" stopColor="#4338ca" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[30, 65, 100].map((y) => (
                  <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#000" strokeOpacity="0.06" />
                ))}
                <path d="M0,96 C30,88 50,66 80,70 S130,90 160,64 S220,24 250,40 S310,62 340,32 S385,16 400,20 L400,130 L0,130Z" fill="url(#lg-fill)" />
                <path d="M0,96 C30,88 50,66 80,70 S130,90 160,64 S220,24 250,40 S310,62 340,32 S385,16 400,20" fill="none" stroke="#4338ca" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d="M0,108 C40,104 60,96 100,100 S170,92 210,96 S290,82 330,88 S380,80 400,82" fill="none" stroke="#191b22" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className={card}>
              <span className="text-[1cqw] font-medium text-black/80">Recent invoices</span>
              <div className="mt-[0.7cqw] text-[0.98cqw]">
                {invoices.map((r) => (
                  <div key={r.no} className="flex items-center justify-between border-t border-black/[0.05] py-[0.75cqw]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.client}</span>
                      <span className="text-black/45">
                        {r.no} · due {r.due}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block tabular-nums">{r.amount}</span>
                      <span className={`inline-block rounded-full px-[0.7cqw] text-[0.85cqw] ${r.tone}`}>{r.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1.5fr] gap-[1.2cqw]">
            <div className={card}>
              <span className="text-[1cqw] font-medium text-black/80">Expenses this month</span>
              <div className="mt-[1cqw] flex flex-col gap-[1.1cqw] text-[0.98cqw]">
                {expenses.map(([name, amount, pct]) => (
                  <div key={name}>
                    <div className="flex justify-between">
                      <span>{name}</span>
                      <span className="tabular-nums text-black/55">{amount}</span>
                    </div>
                    <span className="mt-[0.4cqw] block h-[0.5cqw] overflow-hidden rounded-full bg-black/[0.06]">
                      <span className="block h-full rounded-full bg-[#4338ca]" style={{ width: `${pct}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={card}>
              <div className="flex justify-between text-[1cqw] text-black/50">
                <span className="font-medium text-black/80">Clients</span>
                <span>Year to date</span>
              </div>
              <div className="mt-[0.8cqw] grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-y-[0.2cqw] text-[0.98cqw]">
                {["Client", "Billed", "Outstanding", "Last invoice"].map((h) => (
                  <span key={h} className="pb-[0.6cqw] text-black/45">
                    {h}
                  </span>
                ))}
                {clients.flatMap((row) =>
                  row.map((cell, i) => (
                    <span key={row[0] + i} className={`border-t border-black/[0.05] py-[0.8cqw] tabular-nums ${i === 0 ? "font-medium" : "text-black/65"} ${i === 2 && cell !== "€0" ? "text-rose-600" : ""}`}>
                      {cell}
                    </span>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ───────────────────────── Harbor & Vale — corporate ───────────────────────── */

export function CorporateMock() {
  return (
    <div className="mock-pan bg-white font-geist text-[#1b1d1f]">
      <section className="relative aspect-[16/9.4] overflow-hidden bg-[#cfd6dc]">
        <Img photo={photos.whiteBlock} sizes="60vw" decorative eager />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 to-transparent" />
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-[3.2cqw] py-[2cqw] text-[1.1cqw]">
          <span className="text-[1.5cqw] font-medium tracking-[0.02em]">Harbor &amp; Vale</span>
          <nav className="flex gap-[2.6cqw]">
            <span>Projects</span>
            <span>Practice</span>
            <span>People</span>
            <span>News</span>
          </nav>
          <span className="rounded-full border border-[#1b1d1f]/50 px-[1.4cqw] py-[0.5cqw]">Enquire</span>
        </header>
        <div className="absolute bottom-[3.4cqw] left-[3.2cqw] max-w-[46cqw]">
          <h3 className="text-[4.8cqw] font-light leading-[1.02] tracking-[-0.03em]">Buildings that give something back to the street</h3>
          <p className="mt-[1.4cqw] text-[1.2cqw] text-[#1b1d1f]/70">Architecture and urban design, Rotterdam and Lisbon.</p>
        </div>
        <span className="absolute bottom-[3.4cqw] right-[3.2cqw] text-[1cqw] text-[#1b1d1f]/70">Casa Branca housing, 2025</span>
      </section>
      <section className="grid grid-cols-4 border-b border-black/[0.08] px-[3.2cqw] py-[2.2cqw]">
        {[
          ["62", "Completed buildings"],
          ["14", "Countries"],
          ["31", "People"],
          ["2009", "Founded"],
        ].map(([n, l]) => (
          <div key={l}>
            <span className="block text-[2.8cqw] font-light tracking-tight">{n}</span>
            <span className="text-[1cqw] text-black/55">{l}</span>
          </div>
        ))}
      </section>
      <section className="px-[3.2cqw] py-[3cqw]">
        <div className="mb-[1.6cqw] flex items-baseline justify-between text-[1.1cqw]">
          <span className="text-[2.2cqw] font-light tracking-tight">Selected projects</span>
          <span className="text-black/55">Housing · Civic · Workplace</span>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-[1.4cqw]">
          {[
            { photo: photos.houseDusk, name: "Vale House", meta: "Residential, Cascais" },
            { photo: photos.blueCurves, name: "Maas Quarter", meta: "Workplace, Rotterdam" },
            { photo: photos.facade, name: "Tide Hall", meta: "Civic, Aarhus" },
          ].map((it) => (
            <div key={it.name}>
              <div className="aspect-[4/3] overflow-hidden bg-[#dfe3e6]">
                <Img photo={it.photo} sizes="25vw" decorative />
              </div>
              <span className="mt-[0.8cqw] block text-[1.2cqw]">{it.name}</span>
              <span className="text-[1cqw] text-black/50">{it.meta}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Tidewatch — operations dashboard ───────────────────────── */

const sites = [
  { name: "Dogger East", mw: "412 MW", pct: 92, state: "Nominal" },
  { name: "Horns Rev 4", mw: "268 MW", pct: 74, state: "Nominal" },
  { name: "Viana Float", mw: "96 MW", pct: 41, state: "Curtailed" },
  { name: "Skagen Deep", mw: "0 MW", pct: 3, state: "Service" },
];
// Deterministic pseudo-data for the 14-day output grid.
const heat = Array.from({ length: 14 * 6 }, (_, i) => 0.12 + 0.88 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31)));

const alerts = [
  ["Viana Float", "Grid operator curtailment until 15:30", "Curtailed", "text-amber-600"],
  ["Skagen Deep", "Turbine 14 gearbox inspection, crew on site", "Service", "text-rose-600"],
  ["Dogger East", "Gusts above 24 m/s forecast from 21:00", "Watch", "text-[#0e8388]"],
];
const windows = [
  ["Horns Rev 4", "Blade inspection", "Tue 20 Oct", "6 h"],
  ["Dogger East", "Cable survey", "Thu 22 Oct", "9 h"],
  ["Skagen Deep", "Gearbox swap", "Mon 26 Oct", "2 d"],
  ["Viana Float", "Mooring check", "Wed 28 Oct", "5 h"],
];

export function TidewatchMock() {
  const card = "rounded-[1cqw] bg-white p-[1.4cqw] ring-1 ring-black/[0.05]";
  return (
    <div className="mock-pan flex flex-col gap-[1.2cqw] bg-[#f1f5f5] p-[1.8cqw] font-geist text-[#12262a]">
      <div className="flex items-center justify-between text-[1.05cqw]">
        <span className="flex items-center gap-[0.8cqw] text-[1.5cqw] font-semibold tracking-tight">
          <svg viewBox="0 0 24 24" className="size-[2cqw]" aria-hidden>
            <path d="M2 15c3-4 5-4 8 0s5 4 8 0 3-3 4-3" fill="none" stroke="#0e8388" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Tidewatch
        </span>
        <span className="flex gap-[0.4cqw] rounded-full bg-white p-[0.35cqw] ring-1 ring-black/[0.06]">
          {["Live", "24h", "14d", "Year"].map((t, i) => (
            <span key={t} className={`rounded-full px-[1.2cqw] py-[0.4cqw] ${i === 0 ? "bg-[#12262a] text-white" : "text-black/55"}`}>
              {t}
            </span>
          ))}
        </span>
        <span className="flex items-center gap-[0.6cqw] text-black/60">
          <span className="size-[0.8cqw] rounded-full bg-[#0e8388]" />
          38 of 40 sites reporting
        </span>
      </div>
      <div className="grid h-[54cqw] grid-cols-[1.55fr_1fr] gap-[1.2cqw]">
        <div className="flex min-h-0 flex-col gap-[1.2cqw]">
          <div className={`flex min-h-0 flex-1 flex-col ${card}`}>
            <div className="flex items-end justify-between">
              <span>
                <span className="block text-[1cqw] text-black/50">Fleet output now</span>
                <span className="text-[3.4cqw] font-semibold leading-none tracking-tight tabular-nums">
                  2.84<span className="ml-[0.4cqw] text-[1.4cqw] font-normal text-black/50">GW</span>
                </span>
              </span>
              <span className="text-right text-[1cqw] text-black/55">
                Forecast peak 3.1 GW at 16:00
                <span className="block text-[#0e8388]">Wind 11.2 m/s, WSW</span>
              </span>
            </div>
            <svg viewBox="0 0 400 110" className="mt-[0.8cqw] min-h-0 w-full flex-1" preserveAspectRatio="none" aria-hidden>
              {Array.from({ length: 40 }, (_, i) => {
                const h = 22 + 70 * Math.abs(Math.sin(i * 0.33 + 0.6)) * (0.65 + 0.35 * Math.cos(i * 1.3));
                return <rect key={i} x={i * 10 + 1.5} y={110 - h} width="7" height={h} rx="2" fill="#0e8388" fillOpacity={i > 31 ? 0.25 : 0.85} />;
              })}
              <line x1="318" x2="318" y1="0" y2="110" stroke="#12262a" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className={card}>
            <div className="mb-[0.8cqw] flex justify-between text-[1cqw] text-black/50">
              <span className="font-medium text-black/80">Capacity factor, last 14 days</span>
              <span>4-hour blocks</span>
            </div>
            <div className="grid grid-cols-[repeat(14,1fr)] gap-[0.35cqw]">
              {heat.map((v, i) => (
                <span key={i} className="h-[1.25cqw] rounded-[0.25cqw] bg-[#0e8388]" style={{ opacity: v }} />
              ))}
            </div>
          </div>
        </div>
        <div className={`flex min-h-0 flex-col ${card}`}>
          <span className="text-[1cqw] font-medium text-black/80">Sites</span>
          <div className="mt-[0.6cqw] flex flex-1 flex-col justify-between text-[1cqw]">
            {sites.map((s) => (
              <div key={s.name} className="border-t border-black/[0.05] pt-[0.8cqw]">
                <div className="flex justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span className="tabular-nums text-black/60">{s.mw}</span>
                </div>
                <div className="mt-[0.5cqw] flex items-center gap-[0.8cqw]">
                  <span className="h-[0.5cqw] flex-1 overflow-hidden rounded-full bg-black/[0.07]">
                    <span className="block h-full rounded-full bg-[#0e8388]" style={{ width: `${s.pct}%` }} />
                  </span>
                  <span className={`w-[6.5cqw] text-right text-[0.9cqw] ${s.state === "Nominal" ? "text-[#0e8388]" : s.state === "Service" ? "text-rose-600" : "text-amber-600"}`}>{s.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_1.2fr] gap-[1.2cqw]">
        <div className={card}>
          <span className="text-[1cqw] font-medium text-black/80">Open alerts</span>
          <div className="mt-[0.6cqw] text-[1cqw]">
            {alerts.map(([site, note, state, tone]) => (
              <div key={site} className="flex items-start justify-between gap-[1.4cqw] border-t border-black/[0.05] py-[1cqw]">
                <span>
                  <span className="block font-medium">{site}</span>
                  <span className="text-black/55">{note}</span>
                </span>
                <span className={`shrink-0 text-[0.9cqw] ${tone}`}>{state}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={card}>
          <div className="flex justify-between text-[1cqw] text-black/50">
            <span className="font-medium text-black/80">Maintenance windows</span>
            <span>Next 14 days</span>
          </div>
          <div className="mt-[0.8cqw] grid grid-cols-[1.2fr_1.4fr_1fr_0.5fr] text-[1cqw]">
            {windows.flatMap((row) =>
              row.map((cell, i) => (
                <span key={row[0] + i} className={`border-t border-black/[0.05] py-[1cqw] ${i === 0 ? "font-medium" : "text-black/60"}`}>
                  {cell}
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Kindred — booking web app (phone) ───────────────────────── */

const stays = [
  { photo: photos.houseWood, name: "Cedar House", place: "Sintra hills", price: "€190" },
  { photo: photos.roomPlants, name: "The Glasshouse", place: "Comporta", price: "€240" },
  { photo: photos.houseDusk, name: "Dusk House", place: "Arrábida coast", price: "€310" },
  { photo: photos.roomWarm, name: "Casa Palma", place: "Ericeira", price: "€170" },
];

function KindredHome() {
  return (
    <div className="mock-pan flex flex-col bg-[#faf8f5] px-[6cqw] pb-[10cqw] pt-[13cqw] font-geist text-[#22201c]">
      <span className="text-[4cqw] text-black/50">Good evening, Tomás</span>
      <span className="mt-[1cqw] text-[8.4cqw] font-semibold leading-[1.05] tracking-tight">Where to, this weekend?</span>
      <div className="mt-[5cqw] flex items-center justify-between rounded-full bg-white px-[5cqw] py-[3.6cqw] text-[4cqw] text-black/50 ring-1 ring-black/[0.06]">
        Near Lisbon · 2 guests
        <span className="size-[3cqw] rounded-full bg-[#c96f4a]" />
      </div>
      <div className="mt-[5cqw] flex flex-col gap-[4.5cqw]">
        {stays.map((s) => (
          <div key={s.name}>
            <div className="aspect-[16/10.5] overflow-hidden rounded-[5cqw] bg-[#e6e0d6]">
              <Img photo={s.photo} sizes="240px" decorative eager />
            </div>
            <div className="mt-[2.4cqw] flex justify-between text-[4.2cqw]">
              <span>
                <span className="block font-medium">{s.name}</span>
                <span className="text-[3.6cqw] text-black/50">{s.place}</span>
              </span>
              <span className="text-black/70">{s.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KindredDetail() {
  return (
    <div className="flex h-full flex-col bg-[#faf8f5] font-geist text-[#22201c]">
      <div className="aspect-[1/0.95] shrink-0 overflow-hidden bg-[#e6e0d6]">
        <Img photo={photos.bedroom} sizes="240px" decorative eager />
      </div>
      <div className="-mt-[6cqw] flex flex-1 flex-col rounded-t-[7cqw] bg-[#faf8f5] px-[6cqw] pt-[6cqw]">
        <span className="text-[7cqw] font-semibold tracking-tight">Cedar House</span>
        <span className="text-[3.8cqw] text-black/50">Sintra hills · sleeps 4 · wood stove</span>
        <div className="mt-[5cqw] grid grid-cols-5 gap-[1.8cqw] text-center text-[3.6cqw]">
          {["Thu", "Fri", "Sat", "Sun", "Mon"].map((d, i) => (
            <span key={d} className={`rounded-[3.4cqw] py-[2.6cqw] ${i > 0 && i < 4 ? "bg-[#22201c] text-white" : "bg-white text-black/55 ring-1 ring-black/[0.06]"}`}>
              {d}
              <span className="block text-[4.6cqw] font-medium">{14 + i}</span>
            </span>
          ))}
        </div>
        <div className="mt-[5cqw] flex justify-between text-[4cqw]">
          <span className="text-black/55">3 nights</span>
          <span className="font-medium">€570</span>
        </div>
        <span className="mb-[7cqw] mt-auto rounded-full bg-[#c96f4a] py-[4.2cqw] text-center text-[4.4cqw] font-medium text-white">Reserve Cedar House</span>
      </div>
    </div>
  );
}

function KindredDone() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#22201c] px-[8cqw] text-center font-geist text-[#faf8f5]">
      <span className="grid size-[20cqw] place-items-center rounded-full bg-[#c96f4a]">
        <svg viewBox="0 0 24 24" className="size-[10cqw]" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="mt-[7cqw] text-[8cqw] font-semibold leading-[1.05] tracking-tight">Cedar House is yours</span>
      <span className="mt-[3cqw] text-[4cqw] text-white/60">Fri 15 to Mon 18 Nov. The key code arrives on Thursday.</span>
      <span className="mt-[8cqw] rounded-full bg-white/10 px-[7cqw] py-[3.4cqw] text-[4cqw]">Add to calendar</span>
    </div>
  );
}

const kindredScreens = [KindredHome, KindredDetail, KindredDone];
export const KINDRED_SCREENS = kindredScreens.length;

/** Phone screen that cross-slides between booking states. */
export function KindredMock({ screen = 0 }: { screen?: number }) {
  const Screen = kindredScreens[screen % kindredScreens.length];
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={screen}
        className="absolute inset-0"
        initial={{ x: "100%", opacity: 1 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-30%", opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────────────── Lookup ───────────────────────── */

/** Renders a project's page content for use inside a BrowserFrame. */
export function ProjectScreen({ id }: { id: Exclude<ProjectId, "kindred"> }) {
  if (id === "alder") return <StoreMock />;
  if (id === "ledgerly") return <LedgerMock />;
  if (id === "harbor") return <CorporateMock />;
  return <TidewatchMock />;
}
