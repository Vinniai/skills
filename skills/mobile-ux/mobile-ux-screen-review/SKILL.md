---
name: mobile-ux-screen-review
description: Review a RUNNING mobile screen against the mobile-ux foundations — the visual half of an audit, done on the rendered UI, not the source. Uses Argent MCP (`describe` for the accessibility frame tree + `screenshot` for the pixels) to MEASURE what code can't show: tap-target sizes in points, color/contrast, color-only state, safe-area/header overlap and occlusion, nav structure, and Dynamic-Type reflow. Produces per-element findings with the measured value, the violated rule + HIG citation, and a fix. Use when you have a screen up in the simulator/emulator and want it checked (tap targets, contrast, dark mode, layout/overlap, "does this control meet 44pt"), when a screenshot "looks off", or as the screen-grounded companion to [mobile-ux-audit](../mobile-ux-audit/SKILL.md) (which audits the code). Rules come from [foundations](../mobile-ux-foundations/SKILL.md); the flow skills cover per-screen anatomy. Requires a booted device + the argent tools.
tags: [mobile, ux, screen-review, accessibility, tap-targets, contrast, argent, hig, ios, android]
---

# Mobile UX screen review

Judge the **rendered** screen, not the code. An audit reads files; this looks at what the user
actually sees and **measures** it. The two are complementary — run [mobile-ux-audit](../mobile-ux-audit/SKILL.md)
on the source, run this on the screen. Rules: [foundations](../mobile-ux-foundations/SKILL.md) ⚡ block.

## ⚡ Read first

1. **You need a booted device with the screen already up.** Setup/navigation is the argent stack's job
   (`argent-simulator-setup`, `argent-device-interact`) — this skill assumes you're on the target screen.
2. **`describe` is the measuring tape.** It returns every element's frame in **normalized [0,1]** of the
   screen. That's what lets you compute tap-target size, detect overlap, and check alignment — things a
   screenshot alone can't quantify and code can't show at all.
3. **One screen at a time.** Re-`describe` after every navigation/state change (positions shift).

## Steps

1. **Capture the screen:** `screenshot` (pixels — for contrast, color-only, hierarchy) **and**
   `describe` (frames — for measurement). For React Native you can also use
   `debugger-component-tree` to tie findings back to component names.
2. **Get the device's logical size in points** (needed to convert frames → pt). Per device, e.g.
   iPhone 17/16 Pro = **402 × 874 pt**, iPhone SE = 375 × 667. Call this `W × H`. Full per-device sizes
   **and the safe-area insets** (Island 59 / home indicator 34 pt) you'll check overlap against are in
   [layout-devices](../mobile-ux-layout-devices/SKILL.md).
3. **Run the checks below**, each against its evidence (frame math, or the screenshot).
4. **Write findings** in the [format](#finding-format) — include the measured value, not just a verdict.

## The checks

### Tap targets (frame math — the headline capability)
For each interactive element (`AXButton`/tappable `AXGroup`/control), convert its frame:
`width_pt = frame.width × W`, `height_pt = frame.height × H`.
- **Fail if `width_pt < 44` or `height_pt < 44`** (iOS HIG; use **48dp** on Android). Icon-only square
  controls are the usual offenders.
- Shortcut thresholds (no pt needed): on a `W×H` screen, **min normalized width = 44/W**, **height = 44/H**.
  (iPhone 17 Pro → width ≥ **0.1095**, height ≥ **0.0503**.)
- Report the measured pt size either way — a *passing* measurement is a real result, not noise.

### Spacing / overlap / occlusion (frame math)
- **Overlap:** two interactive frames whose rects intersect → likely a z-order/occlusion bug. A common
  one: a **sticky CTA whose frame covers scrollable content** (the content below it is hidden at rest →
  verify the scroll view has bottom padding ≥ the CTA height).
- **Safe-area / header collision:** content frames with `y` *above* the nav-title/back-button `y` (or
  inside the status-bar band, `y < ~0.06`) → content is rendering **under** a transparent header. *(This
  is exactly the kind of bug a screenshot makes obvious and source review misses.)*
- **Edge crowding:** interactive frames flush to `x≈0` / `x≈1` with no inset.

### Color, contrast & state (screenshot)
- **Color-only state:** is selection/error/success conveyed *only* by hue? (e.g. a selected chip shown
  by background fill with **no checkmark/border/icon**, a red-only error border.) Foundations
  non-negotiable — pair color with an icon/text/shape.
- **Contrast:** body text **< 4.5:1**, or large/bold text **< 3:1**, against its background → fail.
- **Dark mode:** if testing dark, check nothing is hard-coded light (white cards on black, invisible
  text). Confirm the screen *follows the system* rather than forcing a mode.

### Structure & type (screenshot + frames)
- **Nav:** tab bar ≤ 5, no "More" overflow; top-level = sections not actions; modal has an obvious dismiss.
- **Dynamic Type:** if you can bump the simulator text size, re-`describe` and check for clipping/overlap
  (frames colliding) at the largest accessibility size.

## Finding format

```
[SEV] check — element / short title
  evidence: <measured value> (e.g. "frame 0.045×0.038 → 18×33pt" or "screenshot: selected = black fill only")
  rule: <foundations rule> (<citation, e.g. HIG 44pt / WCAG 4.5:1 / no color-only state>)
  fix: the concrete change
```
SEV: **HIGH** = unusable/inaccessible (sub-30pt control, unreadable contrast, content behind a bar) ·
**MED** = real a11y/HIG gap (sub-44pt, color-only state) · **LOW** = polish.

## Worked example (from a live Debrief capture screen, iPhone 17 Pro 402×874)

- Mood buttons `0.164×0.084` → **66×73pt** ✅ · Camera/Library `0.435×0.100` → **175×88pt** ✅ ·
  "Update memory" `0.900×0.060` → **362×52pt** ✅ — *tap targets pass, measured.*
- ⚠️ MED color-only: selected mood signaled by **black fill, no checkmark/ring** → add an icon/border.
- ⚠️ MED occlusion: sticky "Update memory" frame `0.903–0.963` overlaps the voice-note row `0.928–1.0`
  → the Pro upsell is hidden behind the CTA; add bottom inset.
- (Sister catch on another screen: a Notifications settings screen whose "DAILY REMINDER" section frame
  sat at `y≈0.018`, *above* the "Notifications" nav title at `y≈0.084` → content under the transparent
  header. Pure frame-overlap finding; invisible in source.)

## Notes

- **Model tiering — identify cheap, verify frontier.** The measuring work here (convert frames → pt, flag
  sub-44pt targets, detect overlap/occlusion) is mechanical and the skill carries the thresholds — a
  **small/fast model** reading this skill does it at frontier accuracy. Run the per-screen sweep on the
  cheap model; escalate only the flagged elements to a stronger model for the judgment call (is the
  color-only state really ambiguous? severity? fix). See [mobile-ux-audit](../mobile-ux-audit/SKILL.md#model-tiering--identify-cheap-verify-frontier).
- Pairs with [mobile-ux-audit](./../mobile-ux-audit/SKILL.md): audit the code, screen-review the render.
  Run both for full coverage of one flow.
- Never derive tap coordinates or sizes from a screenshot's pixels — use `describe` frames (per the
  argent tapping rule). The screenshot is for color/contrast/hierarchy only.
