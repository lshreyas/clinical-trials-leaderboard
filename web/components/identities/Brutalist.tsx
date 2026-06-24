import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

export function Brutalist({ trials }: { trials: Trial[] }) {
  const totalLY = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);
  const top = trials[0];
  const rest = trials.slice(1, 3);

  return (
    <div className="bg-white text-black p-12 font-sans" style={{ fontFamily: "var(--font-sans)" }}>
      <p className="text-xs font-bold uppercase tracking-tight mb-2">
        Vol. 1 ╱ 2026
      </p>

      <p
        className="font-black leading-[0.85] tracking-[-0.04em] text-[8rem] md:text-[10rem]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {formatLifeYears(totalLY)}
      </p>
      <p className="text-3xl font-black uppercase leading-none tracking-tight mt-2">
        Years
      </p>
      <p className="text-3xl font-black uppercase leading-none tracking-tight">
        At stake.
      </p>

      <div className="h-2 bg-black w-full my-8" />

      <p className="text-lg font-bold uppercase tracking-tight max-w-md mb-2">
        The 500 trials that<br />could rewrite human health.
      </p>

      <div className="h-2 bg-black w-full mt-8" />

      <div className="border-b-2 border-black py-8">
        <p className="font-black text-7xl leading-none mb-4">01</p>
        <p
          className="font-black uppercase leading-[0.9] tracking-tight text-4xl md:text-5xl mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {(top.tagline ?? top.title).slice(0, 60).toUpperCase()}.
        </p>
        <div className="flex items-baseline gap-3 mt-4">
          <div className="h-3 bg-black flex-1" />
          <p className="text-lg font-black tabular-nums">
            {formatLifeYears(lifeYearsAtStake(top))}
          </p>
        </div>
        <p className="text-xs font-bold uppercase tracking-tight mt-2">
          GENE THERAPY ╱ SICKLE CELL ╱ PHASE 3
        </p>
      </div>

      {rest.map((t, i) => (
        <div key={t.nct_id} className="border-b-2 border-black py-6">
          <div className="flex items-baseline gap-6">
            <p className="font-black text-4xl">0{i + 2}</p>
            <div className="flex-1">
              <p className="font-black uppercase tracking-tight text-2xl leading-tight">
                {(t.tagline ?? t.title).slice(0, 60).toUpperCase()}
              </p>
              <p className="text-xs font-bold uppercase tracking-tight mt-2">
                {t.conditions.split(";")[0].trim().toUpperCase()} ╱ {formatLifeYears(lifeYearsAtStake(t))}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
