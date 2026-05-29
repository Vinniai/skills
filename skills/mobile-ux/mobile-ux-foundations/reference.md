# mobile-ux-foundations — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md). Apple HIG is authoritative; Android/Material deltas follow.

## Canonical HIG references

- Foundations: [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) ·
  [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) ·
  [Color](https://developer.apple.com/design/human-interface-guidelines/color) ·
  [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) ·
  [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) ·
  [SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) ·
  [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) ·
  [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion) ·
  [Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left) ·
  [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Navigation: [Navigation bars](https://developer.apple.com/design/human-interface-guidelines/navigation-bars) ·
  [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) ·
  [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) ·
  [Modality](https://developer.apple.com/design/human-interface-guidelines/modality) ·
  [Searching](https://developer.apple.com/design/human-interface-guidelines/searching) ·
  [Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)

## Android / Material 3 deltas (detailed)

| Concept | iOS | Material 3 delta | URL |
|---|---|---|---|
| Touch target | 44×44 pt | **48×48 dp** | [a11y](https://m3.material.io/foundations/accessibility/overview) |
| Bottom nav | tab bar ≤5 | **navigation bar**, hard range **3–5** | [nav bar](https://m3.material.io/components/navigation-bar/overview) |
| Mid-size nav | adaptive tab→sidebar | **navigation rail** (3–7) | [rail](https://m3.material.io/components/navigation-rail/overview) |
| Large nav | sidebar | **drawer** → being replaced by expandable rail | [drawer](https://m3.material.io/components/navigation-drawer/overview) |
| Type | text styles, body 17 pt | 15-role **type scale** (sp) | [type scale](https://m3.material.io/styles/typography/type-scale-tokens) |
| Color / dark | semantic, base/elevated | **dynamic color (Material You)** | [color](https://m3.material.io/styles/color/system/overview) |
| Adaptivity | size classes | **window size classes** | [layout](https://m3.material.io/foundations/layout/applying-layout/window-size-classes) |

Contrast minimums are identical on both (4.5:1 / 3:1, WCAG AA).

## Specifics worth keeping

- iOS body text 17 pt default, 11 pt minimum; use Regular/Medium/Semibold/Bold weights.
- Touch target absolute floor 28×28 pt; aim for the 44 pt default. ~12 pt padding around bezeled controls.
- Liquid Glass (iOS 26) is a controls/navigation-layer material — Regular (text-heavy UI) vs Clear (over
  media, add ~35% dim layer over bright content); don't use it in the content layer.
