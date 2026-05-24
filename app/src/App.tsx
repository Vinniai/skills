import { useCallback, useEffect, useState } from "react";
import { phases } from "./data/phases";
import { PhaseRail } from "./components/PhaseRail";
import { PhaseDetail } from "./components/PhaseDetail";

/** Resolve a URL hash like "#finalize" to a phase index; -1 if unknown. */
function indexFromHash(hash: string): number {
  const slug = hash.replace(/^#/, "").toLowerCase();
  return phases.findIndex((p) => p.name.toLowerCase() === slug);
}

export default function App() {
  const [active, setActive] = useState(() => {
    const i = indexFromHash(window.location.hash);
    return i >= 0 ? i : 0;
  });

  // Selecting a phase updates the hash so it's shareable and reload-stable.
  const select = useCallback((i: number) => {
    setActive(i);
    const slug = phases[i].name.toLowerCase();
    if (window.location.hash !== `#${slug}`) {
      window.history.replaceState(null, "", `#${slug}`);
    }
  }, []);

  // Arrow keys walk the sequence; clamp at the ends.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActive((i) => {
          const next = Math.min(i + 1, phases.length - 1);
          window.history.replaceState(null, "", `#${phases[next].name.toLowerCase()}`);
          return next;
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActive((i) => {
          const next = Math.max(i - 1, 0);
          window.history.replaceState(null, "", `#${phases[next].name.toLowerCase()}`);
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Respond to back/forward navigation and manual hash edits.
  useEffect(() => {
    const onHash = () => {
      const i = indexFromHash(window.location.hash);
      if (i >= 0) setActive(i);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Reflect the active phase in the document title.
  useEffect(() => {
    document.title = `${phases[active].letter} · ${phases[active].name} — abcdefg`;
  }, [active]);

  const phase = phases[active];

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">Vinniai · engineering skills</p>
          <h1 className="wordmark">
            abcdefg<span className="dot">.</span>
          </h1>
          <p className="lead">
            An end-to-end feature-development workflow. Seven sequential phases carry a
            change from request to shipped — each finished before the next begins.
          </p>
          <PhaseRail phases={phases} active={active} onSelect={select} />
          <p className="hint hint--keys">
            <kbd>←</kbd> <kbd>→</kbd> to walk the sequence
          </p>
          <p className="hint hint--touch">Tap a phase · swipe the rail for more</p>
        </div>
      </header>

      <main className="detail-wrap">
        <div className="wrap">
          <PhaseDetail phase={phase} />
        </div>
      </main>

      <footer>
        <div className="wrap">
          Part of the <code>Vinniai/skills</code> repo. The parent <code>abcdefg</code>{" "}
          skill auto-triggers; the seven phases are internal steps it invokes in turn.
        </div>
      </footer>
    </>
  );
}
