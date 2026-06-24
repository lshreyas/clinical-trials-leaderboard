import { getTrials } from "@/lib/data";
import { TrialList } from "@/components/TrialList";
import { TerminalHeader } from "@/components/TerminalHeader";

export default async function Home() {
  const trials = await getTrials();

  return (
    <main className="min-h-screen bg-paper">
      <TerminalHeader trials={trials} />
      <TrialList trials={trials} />

      <footer className="border-t border-rule mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-[10px] text-ink-faint">
          source:{" "}
          <a
            href="https://clinicaltrials.gov"
            className="text-ink-muted underline hover:text-ink"
            target="_blank"
          >
            clinicaltrials.gov/api/v2
          </a>
          {" · "}
          burden:{" "}
          <a
            href="https://www.healthdata.org/gbd"
            className="text-ink-muted underline hover:text-ink"
            target="_blank"
          >
            ihme.gbd_2021
          </a>
          {" · "}
          enrichment: claude-sonnet-4-6 · refresh: weekly · build: 2026.06.23
        </div>
      </footer>
    </main>
  );
}
