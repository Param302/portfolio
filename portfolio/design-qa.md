# Design QA

## Reference visuals

- About layout: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-095baa2e-70d2-4e16-937e-4ab3e7e0068a.png`
- Homepage Wall of Fame: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-5f8677dc-48ef-4b19-a1ac-ca07adf58041.png`
- Gurmat Darbar: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-90a43ed5-5ac0-49fd-b6e5-04e779c3ba77.png`
- Work Experience: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-a66a8c81-6971-4da9-8644-ba3cc788d4c0.png`
- Projects transition: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-84943099-d885-4953-9366-fb99bdc10a8e.png`
- Projects-to-Contact boundary: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-3fdd6761-39be-43e4-8cce-8435590e4d4d.png`
- Contact desktop and dark mode: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-edccd5d9-98f9-4c04-ab98-560543764467.png`, `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-096cf259-48ab-4c77-8628-2ab640f968c4.png`
- Wall of Fame page: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-582030c0-1205-4707-ac3d-fed708c8516e.png`
- Admin login and editor: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-df0a588f-0928-4bde-b28f-642a9e4a64c7.png`, `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-fb6d15b4-d33d-4676-b1a1-0a95dfe5d7a3.png`
- PDF preview chrome: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-516373b1-4fa6-433a-b0f9-8fc0e18e07ef.png`, `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-34c2edad-11d2-47f2-b863-d55cf56dfe20.png`
- Next-token layout: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-8e87d088-9dd4-4736-9c78-59811f5bbe07.png`
- Admin login spacing: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-b25a06e0-7ae6-4ddc-abe2-20cdfa88b6cf.png`
- Variable-height feedback wheel: `C:/Users/PARAMP~1/AppData/Local/Temp/codex-clipboard-7ffe2fc8-f5e4-4ad0-b4bd-d951cc88d200.png`

## Implementation captures

Captured in the Codex in-app browser against the local implementation:

- `http://127.0.0.1:3000/#about` — 1440 × 900
- `http://127.0.0.1:3000/#community` — 1440 × 900
- `http://127.0.0.1:3000/#work` — 1440 × 900
- `http://127.0.0.1:3000/#contact` — 1440 × 900, 1024 × 768, and 390 × 844
- `http://127.0.0.1:3000/walloffame` — 1440 × 900, 390 × 844, and 844 × 390
- `http://127.0.0.1:3000/admin` — 1440 × 900 and 390 × 844
- `http://localhost:3001/definitely-not-a-page` — 1440 × 1000 and 390 × 844
- `http://localhost:3001/admin` — 1440 × 1000 and 390 × 844
- `http://localhost:3001/walloffame#all-feedback` — 390 × 844, including a long focused response
- `http://localhost:3001/#work` — 1440 × 1000, scrolled through the Gurmat Darbar surface

## Responsive and interaction checks

- Desktop (1440 × 900): verified the stacked About copy, unified Gurmat Darbar surface, Work timeline alignment, project stack boundary, guided Contact flow, Wall of Fame motion field, infinite feedback wheel, and Admin login composition.
- Tablet landscape (1024 × 768): verified Contact layout and form transition; document width remained within the viewport.
- Mobile portrait (390 × 844): verified Contact choices and form, Wall of Fame hero and feedback wheel, and Admin login; document width remained within the viewport.
- Rotated mobile (844 × 390): verified Wall of Fame hierarchy and horizontal containment.
- Contact choice selection collapses the choices, reveals the form, and pre-fills the selected subject and opening context. Dark-mode labels, values, borders, and placeholders remain readable.
- Wall of Fame nodes move independently, the focused quote changes without a page-wide orbit jump, and the reading view uses one centered crown-style scroll column.
- The sticky Projects title is hidden once Contact enters the viewport and returns when scrolling back into Projects.
- Reduced-motion branches disable autonomous node and carousel movement; keyboard focus states remain visible.
- Next.js development indicators are disabled by default.
- Admin login was visually verified. The authenticated editor was verified through component review and production compilation without using or changing the owner's credentials.
- The 404 now reveals only three concepts in sequence. Gradient descent exposes readable x, y, and z axes; self-attention uses the floating semantic word field; next-token prediction uses one aligned visual surface at desktop and mobile sizes.
- The resume workspace now has a mobile drawer and Edit/Preview switch so the PDF no longer sits below an endless editor column on smaller screens.

## Iterations made during QA

- The first desktop Contact capture still showed the sticky Projects title. Added a Contact intersection boundary so the title releases before Contact content appears.
- The first mobile Admin capture showed inconsistent translucent input rendering. Replaced it with explicit dark input surfaces and re-captured the screen.
- Reworked Admin login into a light-only, centered form with inset feedback rails; mobile hides the rails and retains a clean single-column form.
- Replaced fixed feedback card heights with content-driven sizing. A long feedback entry was brought into focus at 390 × 844 and displayed without clipping or text overflow.
- Unified the next-token diagram and probability list into one dark surface, eliminating the mismatched two-card composition.

## Automated verification

- `npm run lint` — passed with zero warnings.
- `npm run build` — passed; all 17 static/dynamic routes completed.
- `npm run test:ml` — passed all 13 math and interaction tests.

final result: passed
