export const projects = [
  {
    id: "pocket-coder",
    name: "Pocket-Coder",
    theme: "surface",
    description:
      "A lightning-fast, 1.2B parameter local AI coding assistant designed to run flawlessly on CPUs and GPUs. Fine-tuned on a custom code-instruction dataset, it acts as a fully offline, zero-latency copilot inside Jupyter Notebooks and VS Code, completely bypassing cloud APIs.",
    pointers: ["Jupyter %%code Magic Command", "VS Code MCP Server Integration"],
    skills: ["Finetuning", "SFT", "PEFT LoRA", "LFM 2.5", "Ollama", "MCP"],
    image: "/optimized/projects/pocket-coder.webp",
    repo: "https://github.com/param302/pocket-coder",
  },
  {
    id: "grwm",
    name: "GRWM - Get README With Me",
    theme: "brand",
    description:
      "A production-grade, multi-agent GenAI platform that autonomously generates highly personalized GitHub READMEs. Orchestrated using LangGraph, it features three specialized AI agents working in tandem. The system utilizes real-time Server-Sent Events (SSE) for fluid streaming and is deployed securely on GCP Cloud Run.",
    pointers: ["LangGraph Agent Orchestration", "100+ Unique Users in 16 Hours"],
    skills: ["LangGraph", "FastAPI", "Next.js", "GCP", "SSE"],
    image: "/optimized/projects/grwm.webp",
    repo: "https://github.com/param302/grwm",
    live: "https://getreadmewithme.vercel.app/",
  },
  {
    id: "hand-gesture-lnn",
    name: "Hand Gesture LNN",
    theme: "surface",
    description:
      "An exploratory deep learning research project implementing Liquid Neural Networks (LNNs) to handle 32-dimensional continuous-time motion data. By building custom Liquid Time-Constant (LTC) cells from scratch, the architecture improved temporal adaptability and significantly outperformed standard LSTMs.",
    pointers: ["Custom Liquid Time-Constant Cells", "+9.6% Accuracy vs standard LSTM"],
    skills: ["RNNs", "LSTM", "Liquid Neural Networks (LNN)", "Time-Series Data"],
    image: "/optimized/projects/hand-gesture.webp",
    repo: "https://github.com/param302/hand-gesture-lnn",
  },
  {
    id: "quizzo-v2",
    name: "Quizzo-V2",
    theme: "accent",
    description:
      "A highly scalable, full-stack quiz management platform engineered with a robust asynchronous backend. It utilizes Redis and Celery for distributed background task queues to handle concurrent user loads, automating complex workflows like API rate limiting and dynamic certificate generation.",
    pointers: ["Redis & Celery Task Queues", "Automated Email & Certificates"],
    skills: ["Flask", "Vue.js", "Redis", "Celery", "PostgreSQL"],
    image: "/optimized/projects/quizzo-v2.webp",
    repo: "https://github.com/param302/quizzo-v2",
  },
];
