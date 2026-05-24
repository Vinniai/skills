import type { Phase } from "../data/phases";

interface PhaseRailProps {
  phases: Phase[];
  active: number;
  onSelect: (index: number) => void;
}

/** The persistent A–G navigation strip. Each step selects a phase. */
export function PhaseRail({ phases, active, onSelect }: PhaseRailProps) {
  return (
    <nav className="rail" aria-label="Workflow phases">
      {phases.map((phase, i) => (
        <button
          key={phase.letter}
          type="button"
          className="rail-step"
          aria-current={i === active}
          onClick={() => onSelect(i)}
        >
          <span className="rl">{phase.letter}</span>
          <span className="rn">{phase.name}</span>
        </button>
      ))}
    </nav>
  );
}
