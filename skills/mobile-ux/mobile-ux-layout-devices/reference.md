# mobile-ux-layout-devices — device matrix & canonical references

Supporting material for [SKILL.md](./SKILL.md). All sizes are **logical points** (portrait) — the
coordinate space you lay out in, not physical pixels. Multiply by the scale for pixels. **Always read the
live safe-area inset at runtime**; the inset columns below are reference/sanity-check values, and Apple
revises them per model.

## iPhone — point sizes & safe areas

| Device(s) | Points (P) | Scale | Top type | Top inset | Bottom inset |
|---|---|---|---|---|---|
| iPhone SE (1st) | 320 × 568 | @2x | status bar | 20 | 0 |
| iPhone 8 / SE 2 / SE 3 | 375 × 667 | @2x | status bar | 20 | 0 |
| iPhone 8 Plus | 414 × 736 | @3x | status bar | 20 | 0 |
| iPhone X / XS / 11 Pro | 375 × 812 | @3x | notch | 44 | 34 |
| iPhone 12 mini / 13 mini | 375 × 812 | @3x | notch | 50 | 34 |
| iPhone XR / 11 | 414 × 896 | @2x | notch | 48 | 34 |
| iPhone XS Max / 11 Pro Max | 414 × 896 | @3x | notch | 44 | 34 |
| iPhone 12 / 12 Pro / 13 / 13 Pro / 14 | 390 × 844 | @3x | notch | 47 | 34 |
| iPhone 14 Plus / 12 Pro Max / 13 Pro Max | 428 × 926 | @3x | notch | 47 | 34 |
| iPhone 14 Pro / 15 / 15 Pro / 16 / 17 | 393 × 852 | @3x | **Dynamic Island** | 59 | 34 |
| iPhone 16 Pro / 17 Pro | 402 × 874 | @3x | **Dynamic Island** | 59 | 34 |
| iPhone 15 Plus / 15 Pro Max / 16 Plus | 430 × 932 | @3x | **Dynamic Island** | 59 | 34 |
| iPhone 16 Pro Max / 17 Pro Max | 440 × 956 | @3x | **Dynamic Island** | 59 | 34 |

**Landscape (Face ID phones):** top inset ~0 (Island/notch moves to a side ear), **left+right 44**, bottom **21**.
**Smallest to test:** iPhone SE **375 × 667**. **Largest:** Pro Max **440 × 956**.

## iPad — point sizes & safe areas

| Device(s) | Points (P) | Scale | Top inset | Bottom inset |
|---|---|---|---|---|
| iPad mini (6th) | 744 × 1133 | @2x | 24 | 20 |
| iPad (10th) / iPad Air 11" | 820 × 1180 | @2x | 24 | 20 |
| iPad Pro 11" (M4) | 834 × 1210 | @2x | 24 | 20 |
| iPad Air 13" / iPad Pro 12.9" | 1024 × 1366 | @2x | 24 | 20 |
| iPad Pro 13" (M4) | 1032 × 1376 | @2x | 24 | 20 |
| Older home-button iPads | (varies) | @2x | 20 | 0 |

iPads are **regular width** at full screen, but drop to **compact width** at ⅓/½ split — design to the size
class, not the model. Multitasking widths: Split View ⅓ / ½ / ⅔; Slide Over a phone-width overlay; Stage
Manager = arbitrary resizable windows.

## Size / window classes

| Platform | Classes | Breakpoint | Layout move |
|---|---|---|---|
| iOS | compact / regular **width** & **height** | iPhone portrait = compact width | regular width → sidebar + multi-column; compact → tab bar + single column |
| Material | Compact / Medium / Expanded **width** | <600 / 600–840 / >840 dp | Compact → bottom nav; Medium → nav rail; Expanded → nav drawer/rail + panes |

## Canonical references

**Apple HIG**
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — safe areas, margins, readable width, adaptivity
- [Specifications](https://developer.apple.com/design/human-interface-guidelines/specifications) — per-device screen sizes & scales (authoritative, kept current by Apple)
- [Multitasking](https://developer.apple.com/design/human-interface-guidelines/multitasking) — Split View, Slide Over, Stage Manager
- [iPad](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados) · [iPhone](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios)
- [Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left) — leading/trailing mirroring

**Android / Material 3**
- [Window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)
- [Layout / canonical layouts](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [Edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge) + [WindowInsets](https://developer.android.com/develop/ui/views/layout/insets) — required from API 35

## Notes / gotchas

- **Don't hardcode `44` or `34`.** A new device or a future OS shifts them; multitasking changes them live.
  Read `useSafeAreaInsets()` (react-native-safe-area-context), SwiftUI `safeAreaInsets`, or Android `WindowInsets`.
- **@2x vs @3x** changes pixels, not your point layout — design once in points. The exception is hairlines
  (1 px = 0.33 pt on @3x) and asset crispness.
- **mini devices have a taller top inset (50 pt)** than their bigger siblings — another reason to read it.
- The point sizes here are stable references; Apple's [Specifications](https://developer.apple.com/design/human-interface-guidelines/specifications)
  page is the live source when a new model ships.
