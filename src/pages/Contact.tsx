import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Footer, Nav } from "../components/Chrome";
import { EASE } from "../components/Shared";
import { agency, faqs, nextSteps } from "../content/site";

/*
 * Contact. There is no server behind the site, so the form does the honest thing: it checks
 * the fields, then opens the visitor's email app with the message already written and addressed.
 * To send through a form service instead, replace `send` with a fetch to that service.
 */

const NEEDS = ["Website", "Online store", "Web or mobile app", "Search growth", "Something else"];

type Fields = { name: string; email: string; company: string; message: string };
const empty: Fields = { name: "", email: "", company: "", message: "" };

const field = "h-12 w-full rounded-xl border border-b-line bg-b-white px-4 text-[1rem] text-b-ink outline-none transition-colors placeholder:text-b-mute focus:border-b-cobalt";

export default function Contact() {
  const [values, setValues] = useState(empty);
  const [needs, setNeeds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const toggle = (need: string) => setNeeds((n) => (n.includes(need) ? n.filter((x) => x !== need) : [...n, need]));

  const send = (e: FormEvent) => {
    e.preventDefault();
    const found: Partial<Fields> = {};
    if (!values.name.trim()) found.name = "Tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = "Enter an email address we can reply to.";
    if (values.message.trim().length < 10) found.message = "Add a sentence or two about what you need.";
    setErrors(found);
    if (Object.keys(found).length) return;

    const lines = [`Name: ${values.name}`, `Email: ${values.email}`];
    if (values.company.trim()) lines.push(`Company: ${values.company}`);
    if (needs.length) lines.push(`Looking for: ${needs.join(", ")}`);
    lines.push("", values.message);
    const body = lines.join("\n");
    window.location.href = `mailto:${agency.email}?subject=${encodeURIComponent(`New project from ${values.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(agency.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address is on screen to copy by hand */
    }
  };

  const label = "mb-2 block text-[0.875rem] text-b-mute";
  const error = "mt-2 text-[0.8125rem] text-b-amber";

  return (
    <div className="min-h-screen font-geist text-b-ink">
      <Nav />
      <main className="px-4 md:px-8">
        <section className="grid grid-cols-1 gap-12 pt-32 md:pt-44 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <h1 className="text-[clamp(2.6rem,10vw,4.8rem)] leading-[0.86]">
              {["Tell us what", "you are", "building."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.12em]">
                  <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.1 }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}>
              <p className="mt-6 max-w-md text-[1.0625rem] font-medium leading-snug">A few lines is enough to start. A person reads every message and replies within two working days.</p>

              <dl className="mt-10 max-w-md text-[0.9375rem]">
                <div className="flex items-center justify-between gap-6 border-t border-b-line py-4">
                  <dt className="text-b-mute">Email</dt>
                  <dd className="flex items-center gap-3">
                    <a href={`mailto:${agency.email}`} className="text-b-amber decoration-1 underline-offset-4 hover:underline">
                      {agency.email}
                    </a>
                    <button type="button" onClick={copy} className="rounded-full bg-b-fog px-3 py-1 text-[0.8125rem] transition-colors hover:bg-b-line">
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </dd>
                </div>
                <div className="flex justify-between gap-6 border-t border-b-line py-4">
                  <dt className="text-b-mute">Based in</dt>
                  <dd>{agency.location}</dd>
                </div>
                <div className="flex justify-between gap-6 border-y border-b-line py-4">
                  <dt className="text-b-mute">Reply time</dt>
                  <dd>Within two working days</dd>
                </div>
              </dl>
            </motion.div>
          </div>

          <motion.div className="lg:col-span-6 lg:col-start-7" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
            {sent ? (
              <div className="panel rounded-[1.75rem] p-8 md:p-12" role="status">
                <span className="grid size-12 place-items-center rounded-full bg-b-cobalt text-white">
                  <svg viewBox="0 0 16 16" className="size-5" aria-hidden>
                    <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className="mt-8 text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold leading-tight tracking-[-0.03em]">Your email app should now be open with the message ready.</p>
                <p className="mt-4 max-w-md text-[1rem] leading-relaxed text-b-mute">
                  Press send there and it is on its way. If nothing opened, write to <span className="text-b-amber">{agency.email}</span> directly.
                </p>
                <button type="button" onClick={() => setSent(false)} className="mt-8 inline-flex h-11 items-center rounded-full bg-b-fog px-5 text-[0.9375rem] font-medium transition-colors hover:bg-b-line">
                  Back to the form
                </button>
              </div>
            ) : (
              <form onSubmit={send} noValidate className="panel rounded-[1.75rem] p-6 md:p-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={label}>
                      Your name
                    </label>
                    <input id="name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className={field} />
                    {errors.name && (
                      <p id="name-error" className={error}>
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className={label}>
                      Email
                    </label>
                    <input id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={field} />
                    {errors.email && (
                      <p id="email-error" className={error}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="company" className={label}>
                      Company or project name <span className="opacity-70">(optional)</span>
                    </label>
                    <input id="company" autoComplete="organization" value={values.company} onChange={set("company")} className={field} />
                  </div>
                </div>

                <fieldset className="mt-7">
                  <legend className={label}>What do you need? Pick any that apply.</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {NEEDS.map((need) => {
                      const on = needs.includes(need);
                      return (
                        <button key={need} type="button" aria-pressed={on} onClick={() => toggle(need)} className={`h-10 rounded-full px-4 text-[0.9375rem] font-medium transition-colors ${on ? "bg-b-cobalt text-white" : "bg-b-fog hover:bg-b-line"}`}>
                          {need}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-7">
                  <label htmlFor="message" className={label}>
                    About the project
                  </label>
                  <textarea id="message" rows={6} value={values.message} onChange={set("message")} placeholder="What it is, who it is for, and when you need it." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} className={`${field} h-auto resize-y py-3 leading-relaxed`} />
                  {errors.message && (
                    <p id="message-error" className={error}>
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button type="submit" className="inline-flex h-12 items-center rounded-full bg-b-cobalt px-7 text-[1rem] font-medium text-white shadow-[0_8px_24px_-8px_var(--color-b-cobalt)] transition-[background-color,transform] duration-300 hover:bg-[#1a30d6] active:scale-[0.98]">
                    Send message
                  </button>
                  <p className="max-w-[16rem] text-[0.8125rem] leading-snug text-b-mute">Opens your email app with this message written and addressed. Nothing is stored on this site.</p>
                </div>
              </form>
            )}
          </motion.div>
        </section>

        <section className="pt-24 md:pt-36">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
            <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3.6rem)]">What happens next.</h2>
            <p className="max-w-xs text-[0.9375rem] leading-relaxed text-b-mute">From your message to a quote you can say yes or no to.</p>
          </div>
          <ol className="swipe-row grid grid-cols-1 gap-5 md:grid-cols-3">
            {nextSteps.map((s, i) => (
              <li key={s.name} className="panel rounded-[1.75rem] p-7">
                <span className="grid size-9 place-items-center rounded-full bg-b-cobalt text-[0.9375rem] font-medium tabular-nums text-white">{i + 1}</span>
                <p className="mt-8 text-[1.5rem] font-semibold tracking-[-0.02em]">{s.name}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-b-mute">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid grid-cols-1 gap-10 pt-24 md:pt-36 lg:grid-cols-12 lg:gap-6">
          <h2 className="text-[clamp(2rem,4.2vw,3.6rem)] lg:col-span-4">Before you write.</h2>
          <dl className="border-b border-b-line lg:col-span-7 lg:col-start-6">
            {faqs.slice(0, 3).map((f) => (
              <div key={f.q} className="border-t border-b-line py-6">
                <dt className="text-[clamp(1.125rem,1.6vw,1.375rem)] font-medium tracking-[-0.01em]">{f.q}</dt>
                <dd className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-b-mute">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Footer />
      </main>
    </div>
  );
}
