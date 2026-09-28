# Interactive avatar and portrait

The homepage introduces the avatar, then a name styled with the same HeroAccent component as the main heading. After the 850ms entrance and a one-second hold, the avatar and name travel into the navbar chip over 850ms. Reduced motion, navigation and a bounded initialization fallback keep the page usable. The original navbar cartoon is the homepage's static fallback.

FameCharacter probes actual WebGL2 support before loading Three.js. Module loading, texture decoding, geometry and the first render share a one-second deadline. Late initialization is cancelled. Optimized WebP textures preserve the approved portrait, turban creases, black under-turban, beard and clothes. The avatar stays front-facing; its irises and highlights follow the cursor, and it blinks every 3.1–5.9 seconds. Wall of Fame also controls its reactions.

AboutPortrait starts with the real photo as its server-rendered fallback. Supported browsers upgrade to the avatar and enable a 600ms right-to-left card flip. The photo reveals through 650ms of softened grain based on the original denoising implementation. The avatar pauses while the photo is visible, offscreen, or in a hidden tab. Unsupported, slow, reduced-motion and data-saving devices keep the normal photo.

Source reference images remain in public, with runtime textures in public/avatar-optimized. Local generation experiments and screenshots remain in output and are ignored by Git.

Validation: ESLint on the changed components and avatar modules; 39 cases in scripts/avatar-enhancement.test.mjs; browser checks of desktop/mobile intro handoff, gaze, card flips and grain reveal.
