import type { Phase } from "../data/phases";

interface PhaseDetailProps {
  phase: Phase;
}

/** Editorial detail panel for the active phase. */
export function PhaseDetail({ phase }: PhaseDetailProps) {
  return (
    // key forces a remount per phase so the crossfade replays on switch
    <article className="detail" key={phase.letter}>
      <div className="marker" aria-hidden="true">
        <span className="big">{phase.letter}</span>
        <span className="idx">{phase.idx}</span>
      </div>
      <div>
        <h2>{phase.name}</h2>
        <p className="what">{phase.what}</p>
        <ul className="steps">
          {phase.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
        <p className="exit">
          <b>Exit</b> — {phase.exit}
        </p>
      </div>
    </article>
  );
}
