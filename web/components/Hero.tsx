"use client";

import { useEffect, useState } from "react";
import { formatLifeYears } from "@/lib/types";

interface HeroProps {
  trialCount: number;
  totalLifeYears: number;
}

function useCountUp(target: number, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export function Hero({ trialCount, totalLifeYears }: HeroProps) {
  const animatedTotal = useCountUp(totalLifeYears, 1800);
  const animatedCount = useCountUp(trialCount, 1200);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-8 pt-24 pb-16">
      <p className={`smallcaps text-ink-muted mb-8 reveal ${mounted ? "reveal-visible" : ""}`}>
        An Atlas · Vol. 1 · Updated Weekly
      </p>

      <h1
        className={`font-serif text-6xl md:text-7xl leading-[0.95] tracking-tight font-light text-ink reveal reveal-delay-1 ${
          mounted ? "reveal-visible" : ""
        }`}
      >
        The Frontier of
        <br />
        <span className="italic font-normal">Human Health.</span>
      </h1>

      <hr
        className={`rule my-10 w-24 reveal reveal-delay-2 ${
          mounted ? "reveal-visible" : ""
        }`}
      />

      <div
        className={`reveal reveal-delay-2 ${mounted ? "reveal-visible" : ""}`}
      >
        <p className="font-serif text-2xl leading-snug text-ink max-w-2xl">
          <span className="numeral">{animatedCount}</span> clinical trials are running
          right now that could change everything.
        </p>

        <p className="font-serif text-2xl leading-snug text-ink-muted max-w-2xl mt-3">
          We rank them by what's at stake — measured in years of healthy human life.
        </p>
      </div>

      <div
        className={`mt-12 flex items-baseline gap-6 reveal reveal-delay-3 ${
          mounted ? "reveal-visible" : ""
        }`}
      >
        <div>
          <p className="font-serif text-5xl md:text-6xl font-light numeral text-accent leading-none">
            {formatLifeYears(animatedTotal)}
          </p>
          <p className="smallcaps text-ink-muted mt-3">
            Life-years at stake, annually
          </p>
        </div>
      </div>
    </section>
  );
}
