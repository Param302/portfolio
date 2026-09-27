# Design QA

## Coverage

- Desktop: 1440 × 900
- Tablet landscape: 1024 × 768
- Mobile: 390 × 844
- Pages: homepage, Wall of Fame, resume, and admin login

## Verified

- Hero retains the authored “I’m the AI Engineer” identity and keeps navigation clear at all tested widths.
- Community, Teaching Impact, Gurmat Darbar, Work Experience, Projects, and Contact remain readable without horizontal overflow.
- Community and Gurmat Darbar media preserve their intended 16:9 presentation.
- Project stacking keeps its heading below the desktop navbar and falls back to ordinary cards on short tablet/landscape viewports.
- Wall of Fame uses animated feedback nodes on desktop and a static, touch-friendly grid on mobile/reduced-motion layouts.
- Resume restores the portrait sidebar and displays “AI Engineer” consistently.
- Admin login is private in tone, responsive, and uses non-sensitive feedback as ambient motion.
- Focusable controls have visible labels, interactive media can be paused or selected, and reduced-motion fallbacks are present.

## Final refinements from QA

- Increased the mobile Teaching Impact overlay contrast so foreground copy remains readable over the angled channel image.
- Removed sticky behavior from the compact admin tab bar to prevent header overlap on small screens.
- Expanded the short-viewport project fallback through 820px height for rotated tablets and small laptops.
- Confirmed the document width never exceeds the viewport at the tested tablet and mobile sizes.

