import { z } from "zod";
import { defaultPdfLayout } from "./resume-layout.js";

export { defaultPdfLayout } from "./resume-layout.js";

const text = z.string().trim().max(2000);
const shortText = z.string().trim().max(240);
const url = z.union([z.literal(""), z.string().url()]);
const bulletList = z.array(text).transform((items) => items.filter(Boolean)).pipe(z.array(text).min(1));
const bulletLimit = z.number().int().min(0).max(12);
const entryBulletLimit = bulletLimit.nullable().default(null);

const pdfLayoutSchema = z.object({
  fontSize: z.number().min(8.5).max(11).default(defaultPdfLayout.fontSize),
  lineHeight: z.number().min(1).max(1.5).default(defaultPdfLayout.lineHeight),
  bulletGap: z.number().min(0).max(6).default(defaultPdfLayout.bulletGap),
  entryGap: z.number().min(0).max(16).default(defaultPdfLayout.entryGap),
  sectionGap: z.number().min(4).max(24).default(defaultPdfLayout.sectionGap),
  experienceBulletLimit: bulletLimit.default(defaultPdfLayout.experienceBulletLimit),
  projectBulletLimit: bulletLimit.default(defaultPdfLayout.projectBulletLimit),
  educationBulletLimit: bulletLimit.default(defaultPdfLayout.educationBulletLimit),
  projectToolsPlacement: z.enum(["heading", "line", "hidden"]).default(defaultPdfLayout.projectToolsPlacement),
});

const linkSchema = z.object({
  id: shortText.optional(),
  label: shortText.min(1, "Enter a link name."),
  href: z.string().trim().url("Enter a complete URL."),
  includeInPdf: z.boolean().default(true),
});

const linkList = (maximum) => z.preprocess(
  (value) => Array.isArray(value)
    ? value.filter((item) => !(typeof item?.label === "string" && typeof item?.href === "string" && !item.label.trim() && !item.href.trim()))
    : value,
  z.array(linkSchema).max(maximum),
);

const achievementSchema = z.preprocess(
  (value) => typeof value === "string" ? { text: value } : value,
  z.object({
    id: shortText.optional(),
    text,
    includeInPdf: z.boolean().default(true),
  }),
);

const educationDetailSchema = z.preprocess(
  (value) => typeof value === "string" ? { text: value } : value,
  z.object({
    id: shortText.optional(),
    label: shortText.default(""),
    text,
    includeInPdf: z.boolean().default(true),
  }).refine((item) => !item.label || Boolean(item.text), {
    message: "Enter text for this education point.",
    path: ["text"],
  }),
);

const experienceSchema = z.object({
  id: shortText,
  role: shortText,
  company: shortText,
  dates: shortText,
  link: url.default(""),
  includeInPdf: z.boolean().default(true),
  pdfBulletLimit: entryBulletLimit,
  bullets: bulletList,
});

const projectSchema = z.object({
  id: shortText,
  name: shortText,
  subtitle: shortText.default(""),
  description: text,
  includeInPdf: z.boolean().default(true),
  pdfBulletLimit: entryBulletLimit,
  bullets: bulletList,
  skills: z.array(shortText).max(16),
  image: shortText,
  theme: z.enum(["surface", "brand", "accent"]).default("surface"),
  links: linkList(4),
});

export const resumeDocumentSchema = z.object({
  version: z.literal(1),
  pdfLayout: pdfLayoutSchema.prefault({}),
  pdfSections: z.object({
    summary: z.boolean().default(true),
    experience: z.boolean().default(true),
    education: z.boolean().default(true),
    projects: z.boolean().default(true),
    skills: z.boolean().default(true),
    achievements: z.boolean().default(true),
  }).prefault({}),
  profile: z.object({
    name: shortText,
    email: z.string().email(),
    phone: shortText,
    website: url,
    location: shortText,
    socials: linkList(8),
  }),
  summary: text,
  experience: z.array(experienceSchema).min(1).max(12),
  education: z.array(z.object({
    id: shortText,
    includeInPdf: z.boolean().default(true),
    pdfBulletLimit: entryBulletLimit,
    school: shortText,
    program: shortText,
    dates: shortText,
    score: shortText.default(""),
    details: z.array(educationDetailSchema).transform((items) => items.filter((item) => item.label || item.text)).pipe(z.array(educationDetailSchema).max(16)),
  })).min(1).max(6),
  projects: z.array(projectSchema).min(1).max(12),
  skills: z.array(z.object({
    label: shortText,
    includeInPdf: z.boolean().default(true),
    items: z.array(shortText).max(30),
  })).min(1).max(8),
  achievements: z.array(achievementSchema).transform((items) => items.filter((item) => item.text)).pipe(z.array(achievementSchema).max(16)),
});

export const defaultResumeDocument = resumeDocumentSchema.parse({
  version: 1,
  profile: {
    name: "Parampreet Singh",
    email: "hey@itsparam.in",
    phone: "+91 836 884 6192",
    website: "https://itsparam.in",
    location: "India",
    socials: [
      { label: "LinkedIn", href: "https://linkedin.com/in/param302" },
      { label: "GitHub", href: "https://github.com/param302" },
      { label: "YouTube", href: "https://youtube.com/@Param3021" },
    ],
  },
  summary: "AI Engineer shipping production systems across voice, vision, agentic workflows, fine-tuned models, and scalable cloud backends.",
  experience: [
    {
      id: "gurmat-darbar",
      role: "Founder",
      company: "Gurmat Darbar",
      dates: "Sept 2025 - Present",
      link: "https://gurmatdarbar.com",
      bullets: [
        "Built a Sikh community event platform used by 1,500+ people, covering 300+ samagams with 500+ community contributions.",
        "Created an AI poster-intelligence pipeline that extracts multilingual event fields and prepares listings for publication.",
      ],
    },
    {
      id: "freelance-ai",
      role: "Freelance AI Engineer",
      company: "Independent Client Work",
      dates: "Jun 2026 - Aug 2026",
      link: "",
      bullets: [
        "Built a dashboard and three Indian-dialect voice agents for OT readiness, care follow-ups, and appointment booking using Bolna, LiveKit, Cartesia, and Deepgram.",
        "Designed graph-based agent reasoning and an OCR workflow that analyzes insurance forms for a client serving Indian hospitals.",
      ],
    },
    {
      id: "mpragati",
      role: "AI Research Intern",
      company: "mPragati Lab, IIT Delhi",
      dates: "Sept 2025 - Jan 2026",
      link: "",
      bullets: [
        "Developed and trained 3D U-Net pipelines for deep-learning-based skull implant reconstruction.",
      ],
    },
    {
      id: "coridors",
      role: "Junior Applications Engineer",
      company: "Coridors (Remote)",
      dates: "Aug 2024 - Sept 2025",
      link: "",
      bullets: [
        "Built a Snowflake-backed Streamlit ingestion platform with 30+ interactive screens and Snowpark workflows.",
        "Delivered the company website and managed Vercel and Cloudflare deployments.",
      ],
    },
    {
      id: "educator",
      role: "Educator",
      company: "YouTube (@Param3021)",
      dates: "Jan 2023 - Present",
      link: "https://youtube.com/@Param3021",
      bullets: [
        "Delivered 70+ live Python and ML sessions, reaching 175K+ learners.",
      ],
    },
  ],
  education: [
    {
      id: "iitm",
      school: "IIT Madras",
      program: "BS in Data Science and Applications",
      dates: "GPA: 8.3 | Sept 2022 - Present",
      details: [
        "Diplomas in Programming and Data Science; coursework in LLMs, Mathematical Foundations for GenAI, and Software Engineering.",
      ],
    },
  ],
  projects: [
    {
      id: "pocket-coder",
      name: "Pocket Coder",
      subtitle: "Local Coding Assistant",
      description: "A 1.2B parameter local coding assistant fine-tuned to run offline across CPUs and GPUs.",
      bullets: [
        "Fine-tuned LFM 2.5 with LoRA and scaled SFT context from 4K to 16K.",
        "Integrated Ollama with Jupyter magic and a VS Code MCP server.",
      ],
      skills: ["PyTorch", "LoRA", "SFT", "Ollama", "MCP"],
      image: "/projects/pocket-coder.png",
      theme: "surface",
      links: [{ label: "GitHub", href: "https://github.com/param302/pocket-coder" }],
    },
    {
      id: "grwm",
      name: "GRWM",
      subtitle: "Get README With Me",
      description: "A production multi-agent system that researches repositories and writes personalized GitHub READMEs.",
      bullets: [
        "Orchestrated Detective, CTO, and Ghostwriter agents with LangGraph and real-time SSE.",
        "Reached 100+ unique users in 16 hours and deployed on GCP Cloud Run.",
      ],
      skills: ["LangGraph", "FastAPI", "Next.js", "GCP", "SSE"],
      image: "/projects/grwm.png",
      theme: "brand",
      links: [
        { label: "Live", href: "https://getreadmewithme.vercel.app" },
        { label: "GitHub", href: "https://github.com/param302/grwm" },
      ],
    },
    {
      id: "hand-gesture-lnn",
      name: "Hand Gesture LNN",
      subtitle: "Liquid Neural Network Research",
      description: "A from-scratch LTC network for segmenting 32-dimensional motion time series.",
      bullets: [
        "Built custom LTC cells and reached 54.6% validation accuracy, outperforming the LSTM baseline by 9.6 points.",
      ],
      skills: ["PyTorch", "LNN", "LTC", "Time Series"],
      image: "/projects/hand-gesture.png",
      theme: "surface",
      links: [{ label: "GitHub", href: "https://github.com/param302/hand-gesture-lnn" }],
    },
    {
      id: "quizzo",
      name: "Quizzo V2",
      subtitle: "Quiz Management System",
      description: "A scalable quiz platform with asynchronous jobs, rate limiting, and automated certificates.",
      bullets: [
        "Used Redis and Celery for distributed jobs, email workflows, and certificate generation.",
      ],
      skills: ["Flask", "Vue.js", "Redis", "Celery", "PostgreSQL"],
      image: "/projects/quizzo-v2.png",
      theme: "accent",
      links: [{ label: "GitHub", href: "https://github.com/param302/quizzo-v2" }],
    },
  ],
  skills: [
    { label: "Languages", items: ["Python", "JavaScript", "Java", "C", "SQL", "Bash", "HTML/CSS"] },
    { label: "ML / GenAI", items: ["PyTorch", "TensorFlow", "LangGraph", "LangChain", "U-Net", "Transformers", "Vertex AI"] },
    { label: "Systems & Infra", items: ["FastAPI", "Redis", "PostgreSQL", "Snowflake", "GCP", "Cloud Run", "Docker", "Git"] },
  ],
  achievements: [
    "Official Codex Ambassador for New Delhi; hosted community events and two hackathons, including one with approximately 150 participants.",
    "PyDelhi organizing team member and volunteer across local Python meetups.",
    "Presented Real-Time DEM for Autonomous Space Exploration at GLEX 2025.",
    "Delivered a Python One-Liners talk and published ML notes with 120+ GitHub stars.",
  ],
});

export function parseResumeDocument(value) {
  return resumeDocumentSchema.parse(value);
}
