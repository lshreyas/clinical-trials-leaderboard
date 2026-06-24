import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

export function Storytelling({ trials }: { trials: Trial[] }) {
  const top = trials[0];

  return (
    <div className="bg-stone-100 text-stone-900 relative overflow-hidden">
      {/* Hero panel with atmospheric gradient */}
      <div
        className="relative h-[28rem] flex items-end p-12"
        style={{
          background: `
            radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse at bottom left, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #1c1917 0%, #292524 100%)
          `,
        }}
      >
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 text-stone-50 max-w-2xl">
          <p
            className="uppercase tracking-[0.3em] text-xs text-amber-400/80 mb-6"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            ◇ chapter one
          </p>
          <h1
            className="text-5xl md:text-6xl font-light leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Right now,<br />
            in 500 labs<br />
            across the world,<br />
            <em className="font-normal text-amber-300">someone is trying.</em>
          </h1>
        </div>
      </div>

      {/* Reveal panel */}
      <div className="px-12 py-20 max-w-3xl mx-auto">
        <p
          className="uppercase tracking-[0.2em] text-xs text-stone-500 mb-6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          The trial that could change the most
        </p>
        <p
          className="text-4xl font-light leading-snug mb-10"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          "<em>{top.tagline ?? top.title}</em>"
        </p>

        <div className="flex items-baseline gap-12 mb-12">
          <div>
            <p
              className="text-7xl font-light text-red-700 leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {formatLifeYears(lifeYearsAtStake(top))}
            </p>
            <p
              className="uppercase tracking-[0.15em] text-xs text-stone-500 mt-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              life-years at stake
            </p>
          </div>
          <div className="border-l border-stone-300 pl-6">
            <p className="text-sm text-stone-600 max-w-xs leading-relaxed">
              That's how much suffering — measured in healthy human years — would lift from the world if this single trial works.
            </p>
          </div>
        </div>
      </div>

      {/* Second chapter teaser */}
      <div className="px-12 py-16 bg-stone-200/60 border-t border-stone-300">
        <p
          className="uppercase tracking-[0.3em] text-xs text-stone-500 mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ◇ chapter two
        </p>
        <p
          className="text-3xl font-light leading-snug text-stone-800"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          But this trial is only one of 499 others.<br />
          <span className="text-stone-500">Some matter more than you think.</span>
        </p>
        <p
          className="uppercase tracking-[0.15em] text-xs text-stone-500 mt-8 inline-flex items-center gap-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Scroll to enter the atlas <span className="text-amber-700">↓</span>
        </p>
      </div>
    </div>
  );
}
