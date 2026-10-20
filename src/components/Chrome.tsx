import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MobileMenu, SiteLink, Wordmark } from "./Shared";
import { agency, mailto, navLinks, socials } from "../content/site";
import { useScrolled } from "../lib/hooks";
import { WorldToggle } from "../world/World";
import { SoundToggle } from "../lib/sound";

/* Site chrome shared by the homepage and the work pages. */

const buttonSkin = {
  solid: "bg-b-cobalt text-white shadow-[0_8px_24px_-8px_var(--color-b-cobalt)] hover:bg-[#1a30d6]",
  ghost: "keep-light bg-white text-b-ink ring-1 ring-b-line hover:ring-b-ink/40",
};

type ButtonProps = {
  /** Routes starting with "/" (but not "/#") stay in the app; anything else is a plain link. */
  href: string;
  children: ReactNode;
  kind?: keyof typeof buttonSkin;
  external?: boolean;
};

export function Button({ href, children, kind = "solid", external }: ButtonProps) {
  const className = `inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium transition-[background-color,box-shadow,transform] duration-300 active:scale-[0.98] ${buttonSkin[kind]}`;
  if (href.startsWith("/") && !href.startsWith("/#"))
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

/** Floating glass bar; tightens once the page has scrolled. */
export function Nav() {
  const scrolled = useScrolled(40);
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-5">
      <div className={`mx-auto flex h-14 items-center justify-between rounded-full pl-5 pr-2 transition-[max-width] duration-700 ease-out-expo ${scrolled ? "glass-solid max-w-3xl" : "glass max-w-5xl"}`}>
        <SiteLink href="/" className="text-[1.0625rem] font-semibold tracking-tight">
          <Wordmark />
        </SiteLink>
        <nav className="hidden items-center text-[0.9375rem] md:flex">
          {navLinks.map((l) => (
            <SiteLink key={l.href} href={l.href} className="rounded-full px-4 py-2 text-b-ink/70 transition-colors duration-300 hover:bg-b-ink/10 hover:text-b-ink">
              {l.label}
            </SiteLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <SoundToggle />
          <WorldToggle />
          <Link to="/contact" className="hidden h-10 items-center rounded-full bg-b-cobalt px-5 text-[0.9375rem] font-medium text-white transition-colors duration-300 hover:bg-[#1a30d6] md:inline-flex">
            Start a project
          </Link>
          <MobileMenu className="bg-b-white/85 font-geist text-b-ink backdrop-blur-2xl" linkClassName="text-5xl font-medium tracking-[-0.04em]" cta={<Button href="/contact">Start a project</Button>} />
        </div>
      </div>
    </header>
  );
}

/** The three lines of work the studio is hired for. */
const footerServices = ["Websites and online stores", "Web and mobile apps", "Search growth"];

const footerLinks = [
  { label: "All work", href: "/work" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
  { label: "Questions", href: "/#questions" },
];

export function Footer() {
  const heading = "mb-4 text-[0.8125rem] text-b-mute";
  const link = "block py-1.5 transition-colors hover:text-b-amber";
  return (
    // Its own surface, so the links never sit on a bright part of the planet or a passing meteor.
    <footer className="footer-surface -mx-4 mt-24 overflow-hidden rounded-t-[1.75rem] px-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-12 text-[0.9375rem] md:-mx-8 md:mt-36 md:px-8 md:pt-16">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <Wordmark className="text-[1.25rem] font-semibold tracking-tight" />
          <p className="mt-4 max-w-xs leading-relaxed text-b-mute">{agency.footerLine}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="/contact">Start a project</Button>
            <a href={mailto} className="text-b-amber decoration-1 underline-offset-4 [overflow-wrap:anywhere] hover:underline">
              {agency.email}
            </a>
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-7">
          <p className={heading}>Services</p>
          {footerServices.map((name) => (
            <a key={name} href="/#services" className={link}>
              {name}
            </a>
          ))}
        </div>

        <div className="md:col-span-2">
          <p className={heading}>Studio</p>
          {footerLinks.map((l) => (
            <SiteLink key={l.href} href={l.href} className={link}>
              {l.label}
            </SiteLink>
          ))}
        </div>

        <div className="col-span-2 border-t border-b-line pt-8 md:col-span-2 md:border-0 md:pt-0">
          <p className={heading}>Based in</p>
          <p className="py-1.5">{agency.location}</p>
          {socials.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-4">
              {socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className={link}>
                  {s.label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>

      {/* The name, set across the full width. */}
      <p aria-hidden className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-display text-[15.2vw] font-extrabold uppercase leading-[0.8] tracking-[-0.02em] text-b-ink/[0.07] md:mt-20">
        {agency.name}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-b-line pt-5 text-[0.8125rem] text-b-mute">
        <p>
          © 2026 {agency.name}. {agency.descriptor}.
        </p>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 transition-colors hover:text-b-ink">
          Back to top
          <span aria-hidden>↑</span>
        </button>
      </div>
    </footer>
  );
}
