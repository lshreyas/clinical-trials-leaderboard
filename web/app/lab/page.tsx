import { getTrials } from "@/lib/data";
import { Editorial } from "@/components/identities/Editorial";
import { Brutalist } from "@/components/identities/Brutalist";
import { Cinematic } from "@/components/identities/Cinematic";
import { DataViz } from "@/components/identities/DataViz";
import { Storytelling } from "@/components/identities/Storytelling";
import Link from "next/link";

const IDENTITIES = [
  {
    id: "editorial",
    name: "Editorial",
    desc: "Newsreader serif on cream, brick red accent. Magazine-style restraint. (Current direction.)",
  },
  {
    id: "brutalist",
    name: "Brutalist",
    desc: "Massive type, raw black/white, hard borders. Aggressive, opinionated, hard to ignore.",
  },
  {
    id: "cinematic",
    name: "Cinematic Dark",
    desc: "Black background with luminous magenta-violet gradients. Premium, atmospheric, focused.",
  },
  {
    id: "dataviz",
    name: "Data Terminal",
    desc: "Monospace, dense, sparklines + comparative bars. Bloomberg / Our World in Data energy.",
  },
  {
    id: "storytelling",
    name: "Cinematic Storytelling",
    desc: "Scroll-driven chapters with full-bleed gradient panels. Pudding.cool / NYT longform.",
  },
];

export default async function Lab() {
  const all = await getTrials();
  const trials = all.slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sticky lab header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-slate-500">
            ← Back to site
          </Link>
          <p className="text-sm font-semibold text-slate-900">Identity Lab</p>
          <nav className="ml-auto flex gap-1 text-xs">
            {IDENTITIES.map((i) => (
              <a
                key={i.id}
                href={`#${i.id}`}
                className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {i.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Identity Lab</h1>
        <p className="text-slate-600 leading-relaxed">
          Five different visual identities, all rendering the same top trials.
          Scroll through to compare. Each is a full sample — header treatment,
          hero entry, two list entries. Note: these are isolated mocks; only
          the surrounding chrome is shared. When you pick one, I'll apply it
          to the full site.
        </p>
      </div>

      {/* Each identity gets a section */}
      {IDENTITIES.map((identity, idx) => {
        const Component = {
          editorial: Editorial,
          brutalist: Brutalist,
          cinematic: Cinematic,
          dataviz: DataViz,
          storytelling: Storytelling,
        }[identity.id]!;

        return (
          <section key={identity.id} id={identity.id} className="border-t border-slate-200">
            {/* Label */}
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-300 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{identity.name}</h2>
              </div>
              <p className="text-slate-500 text-sm mt-2 max-w-2xl">{identity.desc}</p>
            </div>

            {/* The mock itself, framed like a card */}
            <div className="max-w-6xl mx-auto px-6 pb-16">
              <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-lg shadow-slate-900/5">
                <Component trials={trials} />
              </div>
            </div>
          </section>
        );
      })}

      {/* Footer / how to pick */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Pick a number (or mix elements from multiple) and I'll apply it to the full site.
          </p>
        </div>
      </footer>
    </main>
  );
}
