---
name: mobile-ux-layout-devices
description: Device-aware layout for mobile apps, grounded in Apple's Human Interface Guidelines Layout + Specifications, with Android/Material window-size-class deltas. The concrete numbers the foundations skill abstracts — screen point sizes per device, safe-area insets (status bar / Dynamic Island / notch / home indicator), layout margins and readable width, the smallest/largest devices to test, orientation and iPad multitasking (Split View, Slide Over, Stage Manager). Use when laying out a screen for real devices, fixing content that collides with the Dynamic Island/notch/home indicator or renders under a transparent nav bar, choosing breakpoints, deciding what to do on iPad vs iPhone, supporting landscape, or reviewing a layout against per-device specs. Read [foundations](../mobile-ux-foundations/SKILL.md) first for the design language; this is the measurements layer. Not framework code — design rules + canonical specs.
tags: [mobile, ux, hig, layout, ios, ipad, android, safe-area, responsive, devices]
---

# Mobile UX — layout & devices

The measurements [foundations](../mobile-ux-foundations/SKILL.md) abstracts: real device point sizes,
safe-area insets, margins, and the per-device traps (Dynamic Island, home indicator, iPad multitasking).
Apple HIG **[Layout](https://developer.apple.com/design/human-interface-guidelines/layout)** +
**[Specifications](https://developer.apple.com/design/human-interface-guidelines/specifications)** are
authoritative; Android deltas flagged. Full device matrix + URLs: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (memorize; commonly missed)

| Rule | Why / value |
|---|---|
| **Read safe-area insets at runtime — never hardcode them** | `useSafeAreaInsets()` / SwiftUI safe area / `WindowInsets`. Insets differ per device *and* orientation; a literal `paddingTop: 44` breaks on the next device. |
| **Keep interactive content inside the safe area** | Backgrounds may bleed to the edges; **controls/text must not** sit under the Dynamic Island, notch, status bar, or home indicator. |
| **Reserve the bottom home-indicator inset** (34 pt portrait) | Don't put tappable controls in the bottom ~34 pt on Face ID devices — the system swipe area eats them. A bottom bar must pad its content above it. |
| **Design to size classes / breakpoints, not device models** | Layout adapts to *available space* (which changes with Split View / Stage Manager), not to a hardcoded device list. |
| **Test the extremes every time** | Smallest = **iPhone SE 375×667**; largest phone = **Pro Max ~440×956**; **iPad** in Split View; **both orientations**; **largest Dynamic Type**. If it survives those four it ships. |
| **A transparent/large-title nav bar overlays content** | Content scrolls *under* it — inset the scroll view or the first row hides behind the bar. (Runtime-only bug; catch it in [screen-review](../mobile-ux-screen-review/SKILL.md).) |

## Design to size classes, not devices

Don't branch on model. Branch on **available space** — it changes under multitasking, so "iPad" ≠ "lots of room".

- **iOS size classes:** `compact` vs `regular` width/height. iPhone portrait = compact width (single column).
  Most iPads, and iPhone Pro Max **landscape**, = regular width (room for split view / sidebar).
- **Breakpoint move:** compact width → single column, tab bar, full-width modals. Regular width → multi-column,
  **sidebar instead of tab bar**, form-sheet modals (centered, not full-screen).
- **Android:** the same idea is **window size classes** — Compact (<600 dp) / Medium (600–840) / Expanded (>840 dp).
  Drive the layout off the class, not the physical device.

## Safe-area insets — the numbers (then read them at runtime)

Reference values (points). **Use them to reason and to sanity-check a review; read the live inset in code.**

| Device class | Portrait top | Portrait bottom | Landscape sides | Landscape bottom |
|---|---|---|---|---|
| **Dynamic Island** (iPhone 14 Pro → 17, 15/16 line) | **59** | **34** | 59 (top), **44** each side | 21 |
| **Notch** (iPhone X–14, 12/13 mini) | 44–47 | 34 | **44** each side | 21 |
| **Home-button** (iPhone SE 2/3, 8) | 20 (status bar) | 0 | 0 | 0 |
| **iPad** (Face ID / home-button) | 24 / 20 | 20 / 0 | 24 / 20 | 20 / 0 |

- **Top** = where your header/content must start. **Bottom** = the home-indicator keep-out.
- **Landscape sides** matter: on Face ID phones a full-width row clips into the notch/Island ears — inset 44 pt.
- The **status bar** is part of the top inset; don't draw your own.

## Layout margins & readable width

- **System content margins ≈ 16 pt** on phones (the default directional layout margins); larger on iPad.
  Align body content and controls to this gutter — don't run text edge-to-edge.
- **Readable content width:** cap long-form text line length (~the readable-content guide) so lines don't
  stretch the full width of a Pro Max / iPad — comfortable measure is ~60–75 characters.
- **Most-important content top + leading** (mirrors in RTL). Group related controls; give touch targets their
  44 pt without crowding (see [foundations](../mobile-ux-foundations/SKILL.md)).

## Per-device traps

- **Dynamic Island (14 Pro+):** never place a status pill, logo, or tappable control under it. The 59 pt top
  inset already accounts for it — respect the inset and you're clear.
- **Home indicator:** the bottom 34 pt is a system gesture zone. Sticky CTAs / toolbars pad their content
  above it (the bar background can extend under; the *label/tap* cannot).
- **Notch in landscape:** content and the back button must clear the 44 pt side inset.
- **Corner radius:** Face ID screens have rounded corners — keep critical content out of the literal corners
  (the safe area already curves in; don't fight it with negative insets).

## iPad — it is not a big iPhone

- **Multitasking:** the app can run at **½, ⅓, or ⅔ width** (Split View / Slide Over) and at arbitrary sizes
  under **Stage Manager**. So a "regular width" iPad layout must also survive *compact* width when shrunk —
  re-check breakpoints at every size, don't assume full screen.
- **Structure:** prefer a **sidebar** (or split view) over a phone tab bar when width is regular; use the extra
  space for multi-column / detail panes, not stretched phone UI.
- **Pointer & keyboard:** support hover/pointer states and key commands; don't assume touch-only.
- **Orientation:** iPad apps should support **all four** orientations unless there's a strong reason; don't lock.

## Orientation & adaptivity

- Support **portrait and landscape** unless a screen genuinely can't (e.g. a camera capture). If you lock,
  lock the *screen*, not the whole app, and say why.
- Layout must **reflow**, not scale-to-fit: relayout on rotation and on size-class change. Test the largest
  **Dynamic Type** at the **smallest** width together — that's where clipping/overlap appears.

## Android deltas

| Concept | iOS | Android / Material |
|---|---|---|
| Adaptivity unit | size classes (compact/regular) | **window size classes** (Compact/Medium/Expanded, dp) |
| Top keep-out | status bar / Dynamic Island | **status bar + display cutout** (`WindowInsets.displayCutout`) |
| Bottom keep-out | home indicator 34 pt | **gesture-nav inset** (`navigationBars` / `systemBars`) |
| Edge-to-edge | safe-area layout guide | **edge-to-edge by default (API 35+)** — you *must* consume `WindowInsets` or content draws under the bars |

Material's edge-to-edge default makes "read insets at runtime" non-optional on modern Android: skip it and
the bottom row sits under the gesture bar. Use `WindowInsets`, not hardcoded dp.

## How this fits the mobile-ux set

[foundations](../mobile-ux-foundations/SKILL.md) gives the design language and the 44 pt / contrast /
nav rules; **this** gives the device measurements those rules land on. When auditing, the
[screen-review](../mobile-ux-screen-review/SKILL.md) skill is what actually *measures* a running screen
against these insets (content-under-header, home-indicator overlap) — pair them.

**Full per-model device table, orientation matrix, and canonical HIG/Material URLs:** **[reference.md](./reference.md)**.
