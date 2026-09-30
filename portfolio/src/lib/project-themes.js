const lightColors = {
  foreground: "#1A2235",
  muted: "#344055",
  border: "rgba(26, 34, 53, .18)",
  pointer: "rgba(255, 255, 255, .82)",
  pointerText: "#1A2235",
  button: "#1A2235",
  buttonText: "#F8FAFC",
};

const darkColors = {
  foreground: "#F8FAFC",
  muted: "#D7E1EF",
  border: "rgba(248, 250, 252, .24)",
  pointer: "rgba(248, 250, 252, .1)",
  pointerText: "#F8FAFC",
  button: "#F8FAFC",
  buttonText: "#1A2235",
};

export const projectThemes = [
  { id: "surface", label: "Canvas", description: "A neutral surface that follows the page theme.", kind: "Solid", swatch: "#F8FAFC", colors: { ...lightColors, background: "#F8FAFC", pointer: "#FFEDD4" }, darkColors: { ...darkColors, background: "#0B0F19", pointer: "#FFEDD4", pointerText: "#1A2235" } },
  { id: "brand", label: "Sky", description: "Bright cyan with deep ink text.", kind: "Solid", swatch: "#1BB6E0", colors: { ...lightColors, background: "#1BB6E0", muted: "#16354A" } },
  { id: "accent", label: "Sand", description: "A soft, warm cream surface.", kind: "Solid", swatch: "#FFEDD4", colors: { ...lightColors, background: "#FFEDD4" } },
  { id: "ocean", label: "Ocean", description: "An airy blend of ice blue and sea green.", kind: "Gradient", swatch: "linear-gradient(135deg, #D9F1FF 0%, #BDEFD9 100%)", colors: { ...lightColors, background: "linear-gradient(135deg, #D9F1FF 0%, #BDEFD9 100%)" } },
  { id: "aurora", label: "Aurora", description: "Deep indigo, plum, and teal with light text.", kind: "Gradient", swatch: "linear-gradient(135deg, #18284B 0%, #402B62 52%, #124D49 100%)", colors: { ...darkColors, background: "linear-gradient(135deg, #18284B 0%, #402B62 52%, #124D49 100%)" } },
  { id: "sunset", label: "Sunset", description: "Peach, rose, and lavender in a warm gradient.", kind: "Gradient", swatch: "linear-gradient(135deg, #FFE0B5 0%, #FFC5C5 50%, #EAD3FF 100%)", colors: { ...lightColors, background: "linear-gradient(135deg, #FFE0B5 0%, #FFC5C5 50%, #EAD3FF 100%)" } },
];

export const projectThemeIds = projectThemes.map(({ id }) => id);

export function getProjectTheme(id, mode = "light") {
  const theme = projectThemes.find((item) => item.id === id) || projectThemes[0];
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
