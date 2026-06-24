import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

export function Cinematic({ trials }: { trials: Trial[] }) {
  const totalLY = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);
  const top = trials[0];
  const rest = trials.slice(1, 3);

  return (
    <div className="bg-[#0a0a0f] text-white p-12 relative overflow-hidden">
      {/* Atmospheric glow */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #d946ef 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        <p
          className="uppercase tracking-[0.2em] text-xs text-white/40 mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ▲  the frontier
        </p>

        <h1
          className="text-5xl font-light leading-tight mb-6 max-w-xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          500 trials.<br />
          <span
            className="font-medium"
            style={{
              background: "linear-gradient(135deg, #f0abfc 0%, #c084fc 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            one ranking.
          </span>
        </h1>

        <p className="text-white/60 text-lg max-w-md mb-10" style={{ fontFamily: "var(--font-sans)" }}>
          The clinical research that could most change humanity, ranked by what's at stake.
        </p>

        <div className="inline-block px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <p
            className="text-5xl font-light"
            style={{
              background: "linear-gradient(135deg, #f0abfc 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "var(--font-display)",
            }}
          >
            {formatLifeYears(totalLY)}
          </p>
          <p className="uppercase tracking-[0.15em] text-xs text-white/50 mt-2">
            life-years · annually
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/40 font-mono text-sm">01</span>
            <span className="uppercase tracking-[0.15em] text-xs text-white/60">
              Gene Therapy · Sickle Cell
            </span>
            <span className="ml-auto px-2 py-0.5 text-xs rounded border border-fuchsia-500/30 text-fuchsia-300">
              Phase 3
            </span>
          </div>
          <p className="text-2xl text-white/95 leading-snug mb-4 max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {top.tagline ?? top.title}
          </p>
          <div
            className="h-1.5 rounded-full max-w-md mb-2"
            style={{
              background: "linear-gradient(90deg, #f0abfc 0%, #c084fc 50%, #818cf8 100%)",
              boxShadow: "0 0 20px rgba(192, 132, 252, 0.5)",
            }}
          />
          <p
            className="text-fuchsia-300 font-mono text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatLifeYears(lifeYearsAtStake(top))} life-years at stake
          </p>
        </div>

        {rest.map((t, i) => {
          const ly = lifeYearsAtStake(t);
          const pct = (ly / lifeYearsAtStake(top)) * 100;
          return (
            <div key={t.nct_id} className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white/30 font-mono text-sm">0{i + 2}</span>
                <span className="uppercase tracking-[0.15em] text-xs text-white/50">
                  {t.conditions.split(";")[0].trim()}
                </span>
              </div>
              <p className="text-lg text-white/85 leading-snug mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {t.tagline ?? t.title}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${Math.max(20, pct)}%`,
                    maxWidth: "20rem",
                    background: "linear-gradient(90deg, #f0abfc 0%, #818cf8 100%)",
                    opacity: 0.7,
                  }}
                />
                <p className="text-fuchsia-300/80 font-mono text-xs">{formatLifeYears(ly)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
