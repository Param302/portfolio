const lightColors = {
  foreground: "#1A2235",
  muted: "#1A2235",
  border: "rgba(26, 34, 53, .18)",
  pointer: "rgba(248, 250, 252, .88)",
  pointerText: "#1A2235",
  button: "#1A2235",
  buttonText: "#F8FAFC",
};

const darkColors = {
  foreground: "#F8FAFC",
  muted: "#E2E8F0",
  border: "rgba(248, 250, 252, .24)",
  pointer: "rgba(248, 250, 252, .1)",
  pointerText: "#F8FAFC",
  button: "#F8FAFC",
  buttonText: "#1A2235",
};

export const projectPalette = [
  { label: "Ink", color: "#0B0F19" },
  { label: "Navy", color: "#1A2235" },
  { label: "Sky", color: "#1BB6E0" },
  { label: "Snow", color: "#F8FAFC" },
  { label: "Sand", color: "#FFEDD4" },
  { label: "Mist", color: "#E2E8F0" },
];

export const defaultProjectGradient = {
  type: "linear", angle: 135, shape: "ellipse", center: { x: 50, y: 50 },
  stops: [{ color: "#E2E8F0", position: 0 }, { color: "#1BB6E0", position: 100 }],
  textMode: "auto",
};

const hexColor = /^#[0-9a-f]{6}$/i;
const clamp = (value, minimum, maximum, fallback) => Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;

// Draft previews use the same bounded values as saved content, even during incomplete edits.
export function normalizeProjectGradient(value) {
  const gradient = value && typeof value === "object" ? value : {};
  const stops = Array.isArray(gradient.stops) && gradient.stops.length >= 2 ? gradient.stops.slice(0, 5) : defaultProjectGradient.stops;
  return {
    type: ["linear", "radial", "conic"].includes(gradient.type) ? gradient.type : defaultProjectGradient.type,
    angle: clamp(gradient.angle, 0, 360, defaultProjectGradient.angle),
    shape: gradient.shape === "circle" ? "circle" : "ellipse",
    center: { x: clamp(gradient.center?.x, 0, 100, 50), y: clamp(gradient.center?.y, 0, 100, 50) },
    stops: stops.map((stop, index) => ({ color: hexColor.test(stop?.color) ? stop.color.toUpperCase() : defaultProjectGradient.stops[index % 2].color, position: clamp(stop?.position, 0, 100, index / (stops.length - 1) * 100) })),
    textMode: ["light", "dark"].includes(gradient.textMode) ? gradient.textMode : "auto",
  };
}

export function projectGradientCss(value) {
  const gradient = normalizeProjectGradient(value);
  const stops = [...gradient.stops].sort((first, second) => first.position - second.position)
    .map((stop) => `${stop.color} ${stop.position}%`).join(", ");
  if (gradient.type === "radial") return `radial-gradient(${gradient.shape} at ${gradient.center.x}% ${gradient.center.y}%, ${stops})`;
  if (gradient.type === "conic") return `conic-gradient(from ${gradient.angle}deg at ${gradient.center.x}% ${gradient.center.y}%, ${stops})`;
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

const channels = (hex) => hex.slice(1).match(/../g).map((value) => parseInt(value, 16));
function luminance(hex) {
  const [red, green, blue] = channels(hex).map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return red * .2126 + green * .7152 + blue * .0722;
}
function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + .05) / (darker + .05);
}
export function interpolateProjectColor(first, second, ratio = .5) {
  const to = channels(second);
  return `#${channels(first).map((channel, index) => Math.round(channel + (to[index] - channel) * ratio).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
function customGradientColors(value) {
  const gradient = normalizeProjectGradient(value);
  const stops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const samples = stops.flatMap((stop, index) => index === 0 ? [stop.color] : Array.from({ length: 33 }, (_, step) => interpolateProjectColor(stops[index - 1].color, stop.color, step / 32)));
  const darkScore = Math.min(...samples.map((color) => contrast(lightColors.foreground, color)));
  const lightScore = Math.min(...samples.map((color) => contrast(darkColors.muted, color)));
  const useLight = gradient.textMode === "light" || (gradient.textMode === "auto" && lightScore > darkScore);
  const readable = (useLight ? lightScore : darkScore) >= 4.6;
  const colors = useLight ? darkColors : lightColors;
  return { ...colors, background: projectGradientCss(gradient), content: readable ? "transparent" : useLight ? "rgba(11, 15, 25, .94)" : "rgba(248, 250, 252, .94)" };
}

const mistGradient = "linear-gradient(135deg, #E2E8F0 0%, #1BB6E0 100%)";
const inkGradient = "linear-gradient(135deg, #0B0F19 0%, #1A2235 100%)";
const sandGradient = "linear-gradient(135deg, #FFEDD4 0%, #F8FAFC 55%, #E2E8F0 100%)";
export const projectThemes = [
  { id: "surface", label: "Canvas", kind: "Solid", swatch: "#F8FAFC", colors: { ...lightColors, background: "#F8FAFC", pointer: "#FFEDD4" }, darkColors: { ...darkColors, background: "#0B0F19", pointer: "#FFEDD4", pointerText: "#1A2235" } },
  { id: "brand", label: "Sky", kind: "Solid", swatch: "#1BB6E0", colors: { ...lightColors, background: "#1BB6E0" } },
  { id: "accent", label: "Sand", kind: "Solid", swatch: "#FFEDD4", colors: { ...lightColors, background: "#FFEDD4" } },
  { id: "ocean", label: "Sky mist", kind: "Gradient", swatch: mistGradient, colors: { ...lightColors, background: mistGradient } },
  { id: "aurora", label: "Ink", kind: "Gradient", swatch: inkGradient, colors: { ...darkColors, background: inkGradient } },
  { id: "sunset", label: "Sand mist", kind: "Gradient", swatch: sandGradient, colors: { ...lightColors, background: sandGradient } },
  { id: "custom", label: "Custom", kind: "Custom", swatch: mistGradient, colors: customGradientColors(defaultProjectGradient) },
];

export const projectThemeIds = projectThemes.map(({ id }) => id);

export function getProjectTheme(id, mode = "light", gradient) {
  const theme = projectThemes.find((item) => item.id === id) || projectThemes[0];
  if (theme.id === "custom") return { ...theme, colors: customGradientColors(gradient) };
  return { ...theme, colors: mode === "dark" && theme.darkColors ? theme.darkColors : theme.colors };
}

function webLink(value) {
  if (typeof value !== "string") return "";
  try {
    const parsed = new URL(value.trim());
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

export function projectLinkLabel(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "Open project";
  }
}

export function projectForDisplay(project) {
  const sourceLinks = Array.isArray(project.links)
    ? project.links
    : [{ label: "Live", href: project.live }, { label: "GitHub", href: project.repo }];
  const links = sourceLinks.map((link) => ({ ...link, href: webLink(link.href) }))
    .filter((link) => link.href)
    .map((link) => ({ ...link, label: link.label?.trim() || projectLinkLabel(link.href), isRepository: new URL(link.href).hostname === "github.com" }));
  return {
    ...project,
    theme: getProjectTheme(project.theme).id,
    pointers: (project.bullets || project.pointers || []).filter((point) => point.trim()),
    skills: (project.skills || []).filter((skill) => skill.trim()),
    links,
    liveLink: links.find((link) => !link.isRepository),
  };
}
