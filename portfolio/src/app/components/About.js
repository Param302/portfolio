"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";

const skills = [
  "PyTorch",
  "LangGraph",
  "FastAPI",
  "Snowflake",
  "GCP",
  "Full-Stack Dev",
];

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/param302",
    icon: "/socials/linkedin.png",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/Param302",
    icon: "/socials/github.png",
    label: "GitHub",
  },
  {
    href: "https://www.youtube.com/@Param3021",
    icon: "/socials/youtube.png",
    label: "YouTube",
  }
];

const palette = [
  { dot: "rgba(255, 237, 212, 0.8)", line: "rgba(255, 237, 212, 0.7)" },
  { dot: "rgba(248, 250, 252, 0.8)", line: "rgba(248, 250, 252, 0.7)" },
  { dot: "rgba(27, 182, 224, 0.8)", line: "rgba(27, 182, 224, 0.7)" },
];

function createDots(width, height) {
  return Array.from({ length: 77 }, (_, index) => {
    const color = palette[index % palette.length];

    return {
      x: 28 + Math.random() * Math.max(width - 56, 120),
      y: 28 + Math.random() * Math.max(height - 56, 120),
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: 4.5 + Math.random() * 4.5,
      dotColor: color.dot,
      lineColor: color.line,
    };
  });
}

export default function About() {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;

    if (!section || !canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    let frameId = 0;
    let width = 0;
    let height = 0;

    const setupCanvas = () => {
      const bounds = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = bounds.width;
      height = bounds.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      dotsRef.current = createDots(width, height);
    };

    const drawFrame = () => {
      context.clearRect(0, 0, width, height);

      dotsRef.current.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x <= 18 || dot.x >= width - 18) {
          dot.vx *= -1;
        }

        if (dot.y <= 18 || dot.y >= height - 18) {
          dot.vy *= -1;
        }
      });

      if (pointerRef.current.active) {
        const nearest = [...dotsRef.current]
          .sort((first, second) => {
            const firstDistance = (first.x - pointerRef.current.x) ** 2 + (first.y - pointerRef.current.y) ** 2;
            const secondDistance =
              (second.x - pointerRef.current.x) ** 2 + (second.y - pointerRef.current.y) ** 2;

            return firstDistance - secondDistance;
          })
          .slice(0, 8);

        nearest.forEach((dot) => {
          context.beginPath();
          context.moveTo(pointerRef.current.x, pointerRef.current.y);
          context.lineTo(dot.x, dot.y);
          context.lineWidth = 0.75;
          context.strokeStyle = dot.lineColor;
          context.stroke();
        });
      }

      dotsRef.current.forEach((dot) => {
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        context.fillStyle = dot.dotColor;
        context.fill();
      });

      frameId = window.requestAnimationFrame(drawFrame);
    };

    setupCanvas();
    drawFrame();

    const resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(section);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerMove = (event) => {
    if (window.innerWidth < 640 || !sectionRef.current) {
      pointerRef.current.active = false;
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();

    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="section-anchor relative flex flex-col items-center w-screen overflow-hidden bg-sky-surge px-8 py-16 sm:px-20 sm:py-20"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      />

      <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div className="relative flex flex-col items-center mx-auto w-full max-w-md">
          <h2 className={`my-10 inline-block font-accent text-5xl font-bold italic tracking-tight text-${isDarkTheme ? 'ink-black' : 'bright-snow'} sm:text-5xl lg:text-7xl`}>
            About
          </h2>
          <div className={`relative overflow-hidden rounded-[2rem] p-3 ${isDarkTheme ? 'bg-bright-snow' : 'bg-prussian-blue'}`}>
            <div className={`overflow-hidden rounded-[1.5rem] ${isDarkTheme ? 'bg-prussian-blue' : 'bg-bright-snow'}`}>
              <Image
                src="/parampreet_singh.png"
                alt="Portrait of Parampreet Singh"
                width={720}
                height={880}
                className="h-full w-full object-cover"
                priority={false}
              />
            </div>
          </div>

          <div className="mt-7 flex items-center gap-8 sm:gap-12">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bright-snow transition hover:-translate-y-0.5 hover:border-sky-surge hover:shadow-[0_0_24px_rgba(27,182,224,0.2)]"
              >
                <Image src={link.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </a>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Parampreet Singh
          </p>
          <p className="mt-2 font-accent text-2xl italic text-papaya-whip sm:text-3xl leading-tighter">Based in India</p>

          <p className="mt-6 max-w-[66ch] font-description text-base font-medium leading-8 text-foreground">
            I am an AI/ML Engineer specialized in building production-grade AI systems. Currently, I&apos;m focused on finetuning Small Language Models (SLMs) and scaling Gurmat Darbar, a full-stack platform for the Sikh community.
            <br />
            Educator at heart, I&apos;ve delivered 70+ live sessions on Python and ML to 100K+ learners.
            <br />
            My work sits at the intersection of deep learning applications & scalable backend architecture.
          </p>

          <div className={`mt-7 rounded-[1.75rem] p-5 sm:p-6 backdrop-blur-sm ${isDarkTheme ? 'bg-prussian-blue' : 'bg-papaya-whip'} `}>
            <div className="flex items-start gap-4">
              <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDarkTheme ? 'text-papaya-whip' : 'text-prussian-blue'}`}>
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className={`font-heading text-lg font-semibold ${isDarkTheme ? 'text-papaya-whip' : 'text-prussian-blue'}`}>
                  BS in Data Science and Applications, IIT Madras (2022-Present)
                </p>
                <p className={`font-description text-sm leading-6 ${isDarkTheme ? 'text-papaya-whip/80' : 'text-prussian-blue/80'}`}>
                  LLMs, Mathematical Foundations for GenAI, and Software Engineering.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 font-description text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/15"
              >
                {skill}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
