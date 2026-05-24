export interface Phase {
  /** Single uppercase letter, A–G. */
  letter: string;
  /** Phase name, e.g. "Analyze". */
  name: string;
  /** Position label, e.g. "01 / 07". */
  idx: string;
  /** One-line italic tagline. */
  what: string;
  /** The work of the phase, as discrete steps. */
  steps: string[];
  /** Exit criterion that lets the next phase begin. */
  exit: string;
}

export const phases: Phase[] = [
  {
    letter: "A",
    name: "Analyze",
    idx: "01 / 07",
    what: "Understand the request, and survey the skills the task needs.",
    steps: [
      "Restate the request; confirm the outcome and acceptance criteria.",
      "Locate relevant files and existing patterns.",
      "Survey ~/.claude skills and decide what's required — framework, testing, browser UI testing, device testing, LSPs, and anything else relevant.",
      "Surface constraints; ask the user — via a structured question — when it's unclear what applies.",
    ],
    exit: "problem, constraints, and required skills/tooling identified.",
  },
  {
    letter: "B",
    name: "Blueprint",
    idx: "02 / 07",
    what: "Design the approach before writing code.",
    steps: [
      "Choose the approach; name components and responsibilities.",
      "Define interfaces and data flow at the boundaries.",
      "List the files to create or change, and in what order.",
      "Note trade-offs; reuse existing patterns first.",
    ],
    exit: "a concrete plan: components, interfaces, files, build order.",
  },
  {
    letter: "C",
    name: "Construct",
    idx: "03 / 07",
    what: "Implement the blueprint.",
    steps: [
      "Build in vertical slices — one working path at a time.",
      "Match the surrounding code's style and idioms.",
      "Implement to the defined interfaces; note any forced changes.",
    ],
    exit: "the change is implemented and runs.",
  },
  {
    letter: "D",
    name: "Debug",
    idx: "04 / 07",
    what: 'Make it correct, and record a "before".',
    steps: [
      "Run it across the happy path and edge cases.",
      "Reproduce failures minimally before fixing; fix root causes.",
      "Add or run tests to lock in behavior.",
      'Capture a "before" baseline — a screenshot for UI work, or recorded output otherwise.',
    ],
    exit: 'behavior verified, tests pass, "before" captured.',
  },
  {
    letter: "E",
    name: "Enhance",
    idx: "05 / 07",
    what: 'Improve beyond "works", and record an "after".',
    steps: [
      "Harden edge cases and failure modes.",
      "Tighten error handling and validation.",
      "Refactor for clarity; address performance where it matters.",
      'Capture an "after" baseline matching the "before" — same viewport and inputs.',
    ],
    exit: 'robust and clear, with an "after" to compare.',
  },
  {
    letter: "F",
    name: "Finalize",
    idx: "06 / 07",
    what: "The gate — is the original request actually met?",
    steps: [
      'Compare the "before" and "after" baselines; confirm the enhancements landed with no regression.',
      "Re-check every part of the original request from Analyze.",
      "If not fully met, loop back to the earliest affected phase and re-gate.",
      "Once it passes: remove dead code, update docs, confirm tests green.",
    ],
    exit: "request verifiably fulfilled; diff tight and green.",
  },
  {
    letter: "G",
    name: "Go",
    idx: "07 / 07",
    what: "Ship the change.",
    steps: [
      "Commit with a clear message; push to the right branch.",
      "Open or merge the PR; confirm CI passes.",
      "Report what shipped — link the commit or PR.",
    ],
    exit: "committed, pushed, and on its way to the target branch.",
  },
];
