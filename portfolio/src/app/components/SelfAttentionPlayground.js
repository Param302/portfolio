"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const nodeDefinitions = [
  {
    id: "Design",
    tone: "sky",
    rotate: -4,
    float: { x: 4, y: -5 },
    positions: {
      desktop: { x: 8, y: 11 },
      tablet: { x: 10, y: 10 },
      mobile: { x: 15, y: 10 },
    },
  },
  {
    id: "Mentor",
    tone: "peach",
    rotate: 2,
    float: { x: -4, y: 5 },
    positions: {
      desktop: { x: 19, y: 18 },
      tablet: { x: 23, y: 15 },
      mobile: { x: 37, y: 9 },
    },
  },
  {
    id: "User",
    tone: "sky",
    rotate: -2,
    float: { x: 3, y: 4 },
    positions: {
      desktop: { x: 31, y: 12 },
      tablet: { x: 37, y: 11 },
      mobile: { x: 68, y: 11 },
    },
  },
  {
    id: "Interface",
    tone: "snow",
    rotate: 3,
    float: { x: -5, y: 4 },
    positions: {
      desktop: { x: 47, y: 18 },
      tablet: { x: 58, y: 16 },
      mobile: { x: 84, y: 18 },
    },
  },
  {
    id: "Flow",
    tone: "sky",
    rotate: -3,
    float: { x: 4, y: -4 },
    positions: {
      desktop: { x: 61, y: 9 },
      tablet: { x: 73, y: 11 },
      mobile: { x: 24, y: 24 },
    },
  },
  {
    id: "GenAI",
    tone: "peach",
    rotate: 2,
    float: { x: -3, y: 4 },
    positions: {
      desktop: { x: 74, y: 16 },
      tablet: { x: 84, y: 17 },
      mobile: { x: 47, y: 25 },
    },
  },
  {
    id: "SLMs",
    tone: "snow",
    rotate: -2,
    float: { x: 3, y: -5 },
    positions: {
      desktop: { x: 87, y: 8 },
      tablet: { x: 15, y: 23 },
      mobile: { x: 70, y: 24 },
    },
  },
  {
    id: "Community",
    tone: "sky",
    rotate: 4,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 94, y: 22 },
      tablet: { x: 33, y: 24 },
      mobile: { x: 86, y: 30 },
    },
  },
  {
    id: "Python",
    tone: "peach",
    rotate: -3,
    float: { x: 5, y: 4 },
    positions: {
      desktop: { x: 11, y: 30 },
      tablet: { x: 9, y: 32 },
      mobile: { x: 14, y: 37 },
    },
  },
  {
    id: "Revision",
    tone: "sky",
    rotate: 2,
    float: { x: -4, y: 3 },
    positions: {
      desktop: { x: 24, y: 36 },
      tablet: { x: 26, y: 31 },
      mobile: { x: 34, y: 34 },
    },
  },
  {
    id: "Confidence",
    tone: "snow",
    rotate: -2,
    float: { x: 4, y: -3 },
    positions: {
      desktop: { x: 39, y: 28 },
      tablet: { x: 48, y: 33 },
      mobile: { x: 59, y: 38 },
    },
  },
  {
    id: "Logic",
    tone: "peach",
    rotate: 3,
    float: { x: -5, y: 4 },
    positions: {
      desktop: { x: 52, y: 35 },
      tablet: { x: 66, y: 30 },
      mobile: { x: 81, y: 39 },
    },
  },
  {
    id: "LangGraph",
    tone: "sky",
    rotate: -4,
    float: { x: 4, y: 4 },
    positions: {
      desktop: { x: 63, y: 28 },
      tablet: { x: 84, y: 31 },
      mobile: { x: 18, y: 49 },
    },
  },
  {
    id: "FastAPI",
    tone: "snow",
    rotate: 2,
    float: { x: -4, y: -4 },
    positions: {
      desktop: { x: 77, y: 34 },
      tablet: { x: 18, y: 41 },
      mobile: { x: 45, y: 49 },
    },
  },
  {
    id: "GCP",
    tone: "peach",
    rotate: -2,
    float: { x: 5, y: 4 },
    positions: {
      desktop: { x: 89, y: 29 },
      tablet: { x: 37, y: 40 },
      mobile: { x: 66, y: 50 },
    },
  },
  {
    id: "README",
    tone: "sky",
    rotate: 3,
    float: { x: -4, y: 5 },
    positions: {
      desktop: { x: 95, y: 38 },
      tablet: { x: 58, y: 41 },
      mobile: { x: 86, y: 48 },
    },
  },
  {
    id: "Sessions",
    tone: "sky",
    rotate: -3,
    float: { x: 4, y: -4 },
    positions: {
      desktop: { x: 8, y: 47 },
      tablet: { x: 77, y: 41 },
      mobile: { x: 11, y: 61 },
    },
  },
  {
    id: "Playlist",
    tone: "snow",
    rotate: 2,
    float: { x: -3, y: 4 },
    positions: {
      desktop: { x: 20, y: 54 },
      tablet: { x: 92, y: 43 },
      mobile: { x: 34, y: 58 },
    },
  },
  {
    id: "Tensor",
    tone: "peach",
    rotate: -2,
    float: { x: 5, y: 5 },
    positions: {
      desktop: { x: 34, y: 46 },
      tablet: { x: 13, y: 52 },
      mobile: { x: 55, y: 61 },
    },
  },
  {
    id: "Research",
    tone: "sky",
    rotate: 3,
    float: { x: -4, y: -5 },
    positions: {
      desktop: { x: 44, y: 57 },
      tablet: { x: 31, y: 51 },
      mobile: { x: 80, y: 59 },
    },
  },
  {
    id: "LNNs",
    tone: "snow",
    rotate: -3,
    float: { x: 4, y: 4 },
    positions: {
      desktop: { x: 57, y: 48 },
      tablet: { x: 50, y: 52 },
      mobile: { x: 17, y: 71 },
    },
  },
  {
    id: "Redis",
    tone: "peach",
    rotate: 2,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 71, y: 56 },
      tablet: { x: 68, y: 49 },
      mobile: { x: 39, y: 72 },
    },
  },
  {
    id: "Copilot",
    tone: "sky",
    rotate: -3,
    float: { x: 5, y: -3 },
    positions: {
      desktop: { x: 86, y: 48 },
      tablet: { x: 84, y: 54 },
      mobile: { x: 61, y: 71 },
    },
  },
  {
    id: "Samagams",
    tone: "snow",
    rotate: 3,
    float: { x: -5, y: 4 },
    positions: {
      desktop: { x: 95, y: 58 },
      tablet: { x: 11, y: 63 },
      mobile: { x: 84, y: 72 },
    },
  },
  {
    id: "Learners",
    tone: "snow",
    rotate: -2,
    float: { x: 4, y: 5 },
    positions: {
      desktop: { x: 12, y: 66 },
      tablet: { x: 27, y: 64 },
      mobile: { x: 20, y: 82 },
    },
  },
  {
    id: "Guidance",
    tone: "sky",
    rotate: 3,
    float: { x: -5, y: -4 },
    positions: {
      desktop: { x: 23, y: 73 },
      tablet: { x: 45, y: 63 },
      mobile: { x: 44, y: 84 },
    },
  },
  {
    id: "Projects",
    tone: "peach",
    rotate: -2,
    float: { x: 5, y: 4 },
    positions: {
      desktop: { x: 37, y: 68 },
      tablet: { x: 63, y: 64 },
      mobile: { x: 69, y: 82 },
    },
  },
  {
    id: "Systems",
    tone: "snow",
    rotate: 2,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 48, y: 77 },
      tablet: { x: 82, y: 65 },
      mobile: { x: 89, y: 86 },
    },
  },
  {
    id: "Celery",
    tone: "sky",
    rotate: -3,
    float: { x: 5, y: -3 },
    positions: {
      desktop: { x: 61, y: 68 },
      tablet: { x: 18, y: 74 },
      mobile: { x: 12, y: 93 },
    },
  },
  {
    id: "Jupyter",
    tone: "peach",
    rotate: 3,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 74, y: 77 },
      tablet: { x: 37, y: 75 },
      mobile: { x: 36, y: 95 },
    },
  },
  {
    id: "VSCode",
    tone: "snow",
    rotate: -2,
    float: { x: 5, y: -4 },
    positions: {
      desktop: { x: 87, y: 70 },
      tablet: { x: 57, y: 76 },
      mobile: { x: 58, y: 95 },
    },
  },
  {
    id: "Backend",
    tone: "sky",
    rotate: 2,
    float: { x: -3, y: 4 },
    positions: {
      desktop: { x: 95, y: 80 },
      tablet: { x: 77, y: 77 },
      mobile: { x: 82, y: 95 },
    },
  },
  {
    id: "Feedback",
    tone: "peach",
    rotate: -3,
    float: { x: 4, y: 4 },
    positions: {
      desktop: { x: 8, y: 86 },
      tablet: { x: 12, y: 86 },
      mobile: null,
    },
  },
  {
    id: "Machine",
    tone: "snow",
    rotate: 2,
    float: { x: -5, y: 4 },
    positions: {
      desktop: { x: 19, y: 91 },
      tablet: { x: 31, y: 86 },
      mobile: null,
    },
  },
  {
    id: "Agents",
    tone: "sky",
    rotate: -2,
    float: { x: 4, y: -3 },
    positions: {
      desktop: { x: 31, y: 86 },
      tablet: { x: 48, y: 87 },
      mobile: null,
    },
  },
  {
    id: "Multilingual",
    tone: "peach",
    rotate: 3,
    float: { x: -4, y: 5 },
    positions: {
      desktop: { x: 44, y: 92 },
      tablet: { x: 66, y: 88 },
      mobile: null,
    },
  },
  {
    id: "Snowflake",
    tone: "snow",
    rotate: -3,
    float: { x: 4, y: 4 },
    positions: {
      desktop: { x: 58, y: 85 },
      tablet: { x: 84, y: 89 },
      mobile: null,
    },
  },
  {
    id: "PostgreSQL",
    tone: "sky",
    rotate: 2,
    float: { x: -4, y: -4 },
    positions: {
      desktop: { x: 70, y: 93 },
      tablet: { x: 22, y: 95 },
      mobile: null,
    },
  },
  {
    id: "Ollama",
    tone: "peach",
    rotate: -2,
    float: { x: 5, y: 4 },
    positions: {
      desktop: { x: 84, y: 87 },
      tablet: { x: 44, y: 96 },
      mobile: null,
    },
  },
  {
    id: "MCP",
    tone: "snow",
    rotate: 3,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 94, y: 94 },
      tablet: { x: 66, y: 96 },
      mobile: null,
    },
  },
  {
    id: "Live",
    tone: "sky",
    rotate: -2,
    float: { x: 4, y: -4 },
    positions: {
      desktop: { x: 6, y: 58 },
      tablet: { x: 92, y: 78 },
      mobile: null,
    },
  },
  {
    id: "ML",
    tone: "peach",
    rotate: 2,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 28, y: 60 },
      tablet: { x: 8, y: 95 },
      mobile: null,
    },
  },
  {
    id: "DeepLearning",
    tone: "snow",
    rotate: -3,
    float: { x: 4, y: 5 },
    positions: {
      desktop: { x: 38, y: 40 },
      tablet: { x: 55, y: 22 },
      mobile: null,
    },
  },
  {
    id: "FullStack",
    tone: "sky",
    rotate: 2,
    float: { x: -5, y: 3 },
    positions: {
      desktop: { x: 51, y: 63 },
      tablet: { x: 75, y: 58 },
      mobile: null,
    },
  },
  {
    id: "Streamlit",
    tone: "peach",
    rotate: -2,
    float: { x: 5, y: -3 },
    positions: {
      desktop: { x: 65, y: 83 },
      tablet: { x: 94, y: 61 },
      mobile: null,
    },
  },
  {
    id: "CloudRun",
    tone: "snow",
    rotate: 3,
    float: { x: -4, y: 4 },
    positions: {
      desktop: { x: 79, y: 63 },
      tablet: { x: 59, y: 70 },
      mobile: null,
    },
  },
  {
    id: "Certificates",
    tone: "sky",
    rotate: -3,
    float: { x: 4, y: 4 },
    positions: {
      desktop: { x: 90, y: 90 },
      tablet: { x: 81, y: 95 },
      mobile: null,
    },
  },
  {
    id: "Pipeline",
    tone: "peach",
    rotate: 2,
    float: { x: -4, y: -4 },
    positions: {
      desktop: { x: 66, y: 40 },
      tablet: { x: 52, y: 44 },
      mobile: null,
    },
  },
];

const connections = {
  Design: ["Interface", "User", "README", "Community", "FullStack"],
  Mentor: ["Learners", "Guidance", "Confidence", "Feedback", "Sessions"],
  User: ["Interface", "Design", "Community", "README", "FullStack"],
  Interface: ["User", "Design", "README", "Copilot", "FullStack"],
  Flow: ["Python", "Pipeline", "Systems", "FastAPI", "Backend"],
  GenAI: ["SLMs", "LangGraph", "Pipeline", "README", "CloudRun"],
  SLMs: ["GenAI", "Ollama", "MCP", "Copilot", "Python"],
  Community: ["Samagams", "Multilingual", "Learners", "Feedback", "FullStack"],
  Python: ["ML", "DeepLearning", "Jupyter", "FastAPI", "LangGraph"],
  Revision: ["Playlist", "Sessions", "Confidence", "Feedback", "Learners"],
  Confidence: ["Revision", "Feedback", "Mentor", "Learners", "Live"],
  Logic: ["Tensor", "Systems", "LNNs", "Machine", "Backend"],
  LangGraph: ["GenAI", "README", "FastAPI", "Agents", "CloudRun"],
  FastAPI: ["LangGraph", "Backend", "CloudRun", "Python", "Pipeline"],
  GCP: ["CloudRun", "Pipeline", "Backend", "FastAPI", "README"],
  README: ["LangGraph", "GenAI", "Interface", "User", "GCP"],
  Sessions: ["Live", "Playlist", "Feedback", "Learners", "Guidance"],
  Playlist: ["Python", "Revision", "ML", "DeepLearning", "Guidance"],
  Tensor: ["LNNs", "DeepLearning", "Research", "Machine", "Logic"],
  Research: ["LNNs", "Tensor", "DeepLearning", "Projects", "GenAI"],
  LNNs: ["Tensor", "Research", "Machine", "DeepLearning", "Logic"],
  Redis: ["Celery", "PostgreSQL", "Backend", "Systems", "Certificates"],
  Copilot: ["VSCode", "Jupyter", "Ollama", "MCP", "SLMs"],
  Samagams: ["Community", "Multilingual", "Pipeline", "Backend", "FullStack"],
  Learners: ["Feedback", "Sessions", "Mentor", "Confidence", "Live"],
  Guidance: ["Projects", "Feedback", "Learners", "Playlist", "Python"],
  Projects: ["FullStack", "Systems", "FastAPI", "Streamlit", "Guidance"],
  Systems: ["Backend", "Pipeline", "Projects", "FastAPI", "Logic"],
  Celery: ["Redis", "Certificates", "Backend", "Systems", "PostgreSQL"],
  Jupyter: ["Python", "Copilot", "ML", "Tensor", "Research"],
  VSCode: ["Copilot", "MCP", "Backend", "FullStack", "Projects"],
  Backend: ["Systems", "PostgreSQL", "Redis", "FastAPI", "FullStack"],
  Feedback: ["Learners", "Confidence", "Sessions", "Mentor", "Community"],
  Machine: ["ML", "DeepLearning", "Tensor", "LNNs", "Python"],
  Agents: ["LangGraph", "GenAI", "Pipeline", "Systems", "FastAPI"],
  Multilingual: ["Community", "Samagams", "Pipeline", "GenAI", "README"],
  Snowflake: ["PostgreSQL", "Streamlit", "Backend", "Systems", "Projects"],
  PostgreSQL: ["Backend", "Snowflake", "Redis", "Celery", "FullStack"],
  Ollama: ["SLMs", "MCP", "Copilot", "VSCode", "Python"],
  MCP: ["VSCode", "Ollama", "Copilot", "Python", "SLMs"],
  Live: ["Sessions", "Feedback", "Confidence", "Learners", "Revision"],
  ML: ["Python", "Machine", "DeepLearning", "Tensor", "Jupyter"],
  DeepLearning: ["ML", "Tensor", "LNNs", "Research", "SLMs"],
  FullStack: ["Backend", "Projects", "Community", "FastAPI", "Interface"],
  Streamlit: ["Snowflake", "Projects", "Systems", "Backend", "Python"],
  CloudRun: ["GCP", "FastAPI", "LangGraph", "Pipeline", "GenAI"],
  Certificates: ["Celery", "Redis", "Backend", "Feedback", "Learners"],
  Pipeline: ["Flow", "GenAI", "FastAPI", "GCP", "Multilingual"],
};

function toneClass(tone, active) {
  if (active) {
    if (tone === "sky") return "text-sky-surge";
    if (tone === "peach") return "text-papaya-whip dark:text-papaya-whip";
    return "text-prussian-blue dark:text-bright-snow";
  }

  return "text-prussian-blue/28 dark:text-bright-snow/24";
}

function layoutForWidth(width) {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function createPath(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const bend = Math.max(8, Math.min(20, Math.abs(dx) * 0.14 + Math.abs(dy) * 0.18));
  const c1x = from.x + dx * 0.25;
  const c2x = from.x + dx * 0.75;
  const c1y = from.y - bend;
  const c2y = to.y - bend + dy * 0.12;

  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
}

export default function SelfAttentionPlayground() {
  const [activeWord, setActiveWord] = useState(null);
  const [layoutMode, setLayoutMode] = useState("desktop");
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const syncEnvironment = () => {
      setLayoutMode(layoutForWidth(window.innerWidth));
      setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    };

    syncEnvironment();
    window.addEventListener("resize", syncEnvironment);

    return () => window.removeEventListener("resize", syncEnvironment);
  }, []);

  const visibleNodes = useMemo(
    () =>
      nodeDefinitions
        .map((node) => {
          const position = node.positions[layoutMode];
          if (!position) {
            return null;
          }

          return { ...node, ...position };
        })
        .filter(Boolean),
    [layoutMode],
  );

  const nodeMap = useMemo(
    () => Object.fromEntries(visibleNodes.map((node) => [node.id, node])),
    [visibleNodes],
  );

  const activeConnections = useMemo(() => {
    if (!activeWord || !connections[activeWord] || !nodeMap[activeWord]) {
      return [];
    }

    const source = nodeMap[activeWord];

    return connections[activeWord]
      .map((targetId) => {
        const target = nodeMap[targetId];
        if (!target) {
          return null;
        }

        return {
          id: `${source.id}-${target.id}`,
          path: createPath(source, target),
          tone: target.tone,
        };
      })
      .filter(Boolean);
  }, [activeWord, nodeMap]);

  const isInteractiveTouch = !canHover;

  return (
    <section className="w-full border-t border-alice-blue/70 bg-background py-16 dark:border-prussian-blue/70">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">
            Self-Attention Playground
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-4xl lg:text-5xl">
            Hover or tap a concept and let the network drift into focus.
          </h2>
          <p className="mt-4 font-description text-sm leading-7 text-prussian-blue/72 dark:text-bright-snow/72 sm:text-base">
            This field blends Python, AI/ML/DL, product engineering, feedback loops, and project keywords into a transformer-style attention map. Try{" "}
            <span className="font-medium text-sky-surge">Python</span>,{" "}
            <span className="font-medium text-papaya-whip">LangGraph</span>,{" "}
            <span className="font-medium text-sky-surge">Tensor</span>,{" "}
            <span className="font-medium text-papaya-whip">Community</span>, or{" "}
            <span className="font-medium text-sky-surge">Feedback</span>.
          </p>
          <p className="mt-2 font-description text-xs uppercase tracking-[0.22em] text-prussian-blue/55 dark:text-bright-snow/50">
            {isInteractiveTouch ? "Tap a word to pin its semantic links." : "Hover a word to trace its semantic links."}
          </p>
        </div>
      </div>

      <div
        className={`relative mt-12 w-full overflow-hidden ${
          layoutMode === "mobile"
            ? "h-[860px]"
            : layoutMode === "tablet"
              ? "h-[980px]"
              : "h-[820px]"
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {activeConnections.map((connection) => (
            <motion.path
              key={connection.id}
              d={connection.path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              fill="none"
              stroke={
                connection.tone === "sky"
                  ? "rgba(27, 182, 224, 0.82)"
                  : connection.tone === "peach"
                    ? "rgba(255, 237, 212, 0.88)"
                    : "rgba(248, 250, 252, 0.78)"
              }
              strokeWidth={layoutMode === "mobile" ? "0.22" : "0.18"}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {visibleNodes.map((node, index) => {
          const isActive = activeWord === node.id;
          const isConnected = activeWord ? connections[activeWord]?.includes(node.id) : false;

          return (
            <motion.button
              key={node.id}
              type="button"
              onMouseEnter={() => {
                if (canHover) {
                  setActiveWord(node.id);
                }
              }}
              onMouseLeave={() => {
                if (canHover) {
                  setActiveWord(null);
                }
              }}
              onFocus={() => setActiveWord(node.id)}
              onBlur={() => {
                if (canHover) {
                  setActiveWord(null);
                }
              }}
              onClick={() =>
                setActiveWord((current) => (current === node.id ? null : node.id))
              }
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-description text-[10px] font-medium uppercase tracking-[0.16em] transition duration-300 sm:text-xs lg:text-sm ${toneClass(node.tone, isActive || isConnected)}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              animate={{
                x: [0, node.float.x, 0, -node.float.x / 2, 0],
                y: [0, node.float.y, 0, -node.float.y / 2, 0],
                rotate: [node.rotate, node.rotate + 1.5, node.rotate - 1, node.rotate],
              }}
              transition={{
                duration: 10 + (index % 6) * 1.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <span
                className={`inline-flex rounded-full px-3 py-1.5 transition ${
                  isActive
                    ? "bg-prussian-blue/10 dark:bg-bright-snow/10"
                    : isConnected
                      ? "bg-sky-surge/10 dark:bg-papaya-whip/10"
                      : "bg-transparent"
                }`}
              >
                {node.id}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
