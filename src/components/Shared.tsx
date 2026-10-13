import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { agency, navLinks } from "../content/site";

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Routes ("/", "/work") navigate inside the app. Section links ("/#services") are plain anchors:
 * on the homepage the browser scrolls to the section, from any other page it loads the homepage
 * and App.tsx scrolls to the section once it exists.
 */
export function SiteLink({ href, className, children, onClick }: { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  if (href.startsWith("/") && !href.includes("#"))
    return (
      <Link to={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

/** Wordmark with a small "north light" window glyph. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 20 20" className="size-[1.05em]" aria-hidden>
        <path d="M2 18V8a8 8 0 0 1 16 0v10z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 1v17M2 10.5h16" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {agency.name}
    </span>
  );
}

/** Full-screen mobile menu. */
export function MobileMenu({ className = "", linkClassName = "", cta }: { className?: string; linkClassName?: string; cta: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="relative grid size-10 place-items-center">
        <span className="relative block h-3 w-6">
          <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${open ? "translate-y-[0.375rem] rotate-45" : ""}`} />
          <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${open ? "-translate-y-[0.3125rem] -rotate-45" : ""}`} />
        </span>
      </button>
      {/* Portalled so a blurred or transformed header cannot trap the fixed overlay; sits just under the header. */}
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className={`fixed inset-0 z-[49] flex flex-col justify-between px-6 pb-24 pt-28 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((l, i) => (
                <motion.li key={l.href} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: EASE }}>
                  <SiteLink href={l.href} onClick={() => setOpen(false)} className={`block py-2 ${linkClassName}`}>
                    {l.label}
                  </SiteLink>
                </motion.li>
              ))}
            </ul>
            <div onClick={() => setOpen(false)}>{cta}</div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
