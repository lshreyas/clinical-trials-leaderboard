import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

export function Editorial({ trials }: { trials: Trial[] }) {
  const totalLY = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);
  const top = trials[0];
  const rest = trials.slice(1, 3);
  const topLY = lifeYearsAtStake(top);

  return (
    <div className="bg-[#faf8f3] text-[#1a1815] p-12" style={{ fontFamily: "var(--font-sans)" }}>
      <p className="uppercase tracking-[0.12em] text-[#6b6660] text-xs font-medium mb-6">
        An Atlas · Vol. 1
      </p>
      <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-5xl font-light leading-[0.95] mb-6">
        The Frontier of<br />
        <em className="font-normal">Human Health.</em>
      </h1>
      <hr className="border-[#d6cfc0] w-20 my-6" />
      <p style={{ fontFamily: "var(--font-serif)" }} className="text-xl text-[#1a1815] leading-snug">
        500 trials are running right now that could change everything.
      </p>
      <p style={{ fontFamily: "var(--font-serif)" }} className="text-4xl font-light text-[#a8321a] mt-8">
        {formatLifeYears(totalLY)}
      </p>
      <p className="uppercase tracking-[0.12em] text-[#6b6660] text-xs font-medium mt-2">
        Life-years at stake, annually
      </p>

      <hr className="border-[#d6cfc0] my-10" />

      <div className="pb-8 border-b border-[#d6cfc0]">
        <p className="font-serif text-3xl text-[#6b6660] mb-4" style={{ fontFamily: "var(--font-serif)" }}>01.</p>
        <p style={{ fontFamily: "var(--font-serif)" }} className="text-2xl text-[#1a1815] mb-4 max-w-xl">
          {top.tagline ?? top.title}
        </p>
        <p className="uppercase tracking-[0.12em] text-[#6b6660] text-xs font-medium">
          <span className="text-[#a8321a] font-semibold normal-case tracking-normal text-sm">
            {formatLifeYears(topLY)}
          </span>
          <span className="ml-2">life-years at stake · Phase 3</span>
        </p>
      </div>

      {rest.map((t, i) => (
        <div key={t.nct_id} className="py-6 border-b border-[#d6cfc0]">
          <p className="uppercase tracking-[0.12em] text-[#6b6660] text-xs font-medium mb-1">
            0{i + 2} · {t.conditions.split(";")[0].trim()}
          </p>
          <p style={{ fontFamily: "var(--font-serif)" }} className="text-lg text-[#1a1815]">
            {t.tagline ?? t.title}
          </p>
        </div>
      ))}
    </div>
  );
}
