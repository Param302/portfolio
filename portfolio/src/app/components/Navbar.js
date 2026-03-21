"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/app/ThemeContext";
import {
  BriefcaseBusiness,
  CodeXml,
  Home,
  Mail,
  MoonStar,
  SunMedium,
  UserRound,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: UserRound },
  { id: "work", label: "Work", icon: BriefcaseBusiness },
  { id: "projects", label: "Projects", icon: CodeXml },
  { id: "contact", label: "Contact", icon: Mail },
];

const spring = {
  type: "spring",
  stiffness: 380,
  damping: 32,
};

function ThemeToggle({ theme, mounted, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass-card inline-flex h-12 w-12 items-center justify-center rounded-full text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:text-bright-snow"
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}
    >
      {mounted && theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}

function DesktopNav({ activeSection, indicator, navRef, onNavigate }) {
  return (
    <nav
      ref={navRef}
      className="glass relative hidden items-center gap-2 rounded-full border border-alice-blue/60 px-3 py-2 shadow-soft sm:flex dark:border-alice-blue/10"
    >
      {indicator ? (
        <motion.span
          animate={{ x: indicator.left, width: indicator.width }}
          transition={spring}
          className="absolute inset-y-2 left-0 rounded-full bg-sky-surge/15"
        />
      ) : null}
      {NAV_ITEMS.map((item) => {
        return (
          <a
            key={item.id}
            data-nav-id={item.id}
            href={`#${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-4 font-heading text-sm font-medium transition ${activeSection === item.id
              ? "text-prussian-blue dark:text-bright-snow"
              : "text-prussian-blue/70 hover:text-sky-surge dark:text-bright-snow/75 dark:hover:text-papaya-whip"
              }`}
            aria-label={item.label}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {item.id === "home" ? <item.icon className="h-4 w-4" /> : item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function MobileNav({ activeSection, indicator, navRef, onNavigate }) {
  return (
    <nav
      ref={navRef}
      className="glass relative flex items-center gap-1 rounded-full border border-alice-blue/60 px-3 py-2 shadow-soft dark:border-alice-blue/10 sm:hidden"
    >
      {indicator ? (
        <motion.span
          animate={{ x: indicator.left, width: indicator.width }}
          transition={spring}
          className="absolute inset-y-2 left-0 rounded-full bg-sky-surge/15"
        />
      ) : null}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.id}
            data-nav-id={item.id}
            href={`#${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition ${activeSection === item.id
              ? "text-prussian-blue dark:text-bright-snow"
              : "text-prussian-blue/70 hover:text-sky-surge dark:text-bright-snow/75 dark:hover:text-papaya-whip"
              }`}
            aria-label={item.label}
          >
            <Icon className="relative z-10 h-4 w-4" />
          </a>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const { theme, mounted, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const [desktopIndicator, setDesktopIndicator] = useState(null);
  const [mobileIndicator, setMobileIndicator] = useState(null);
  const desktopNavRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!sections.length) {
      return undefined;
    }

    let ticking = false;

    const updateActiveSection = () => {
      const viewportCenter = window.innerHeight * 0.4;
      const sectionMetrics = sections.map((section) => {
        const rect = section.getBoundingClientRect();

        return {
          id: section.id,
          containsCenter: rect.top <= viewportCenter && rect.bottom >= viewportCenter,
          distance: Math.abs(rect.top - viewportCenter),
        };
      });

      const closestSection =
        sectionMetrics.find((section) => section.containsCenter) ||
        sectionMetrics.sort((first, second) => first.distance - second.distance)[0];

      if (closestSection?.id) {
        setActiveSection((current) => (current === closestSection.id ? current : closestSection.id));
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const syncIndicator = (navElement, setter) => {
      if (!navElement) {
        setter(null);
        return;
      }

      const activeItem = navElement.querySelector(`[data-nav-id="${activeSection}"]`);
      if (!activeItem) {
        setter(null);
        return;
      }

      setter({
        left: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
      });
    };

    const updateIndicators = () => {
      syncIndicator(desktopNavRef.current, setDesktopIndicator);
      syncIndicator(mobileNavRef.current, setMobileIndicator);
    };

    updateIndicators();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateIndicators) : null;

    if (desktopNavRef.current && resizeObserver) {
      resizeObserver.observe(desktopNavRef.current);
    }

    if (mobileNavRef.current && resizeObserver) {
      resizeObserver.observe(mobileNavRef.current);
    }

    window.addEventListener("resize", updateIndicators);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicators);
    };
  }, [activeSection]);

  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      <div className="relative mx-auto flex max-w-7xl items-start justify-between px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex min-h-12 items-center">
          <p className="hidden h-14 items-center gap-3 rounded-full border border-alice-blue/60 bg-bright-snow/65 px-4 font-heading text-base font-semibold text-prussian-blue shadow-soft dark:border-alice-blue/10 dark:bg-prussian-blue/45 dark:text-bright-snow sm:inline-flex">
            <Image
              src="/parampreet.png"
              alt="Parampreet Singh"
              width={30}
              height={30}
              className="h-[30px] w-[30px] rounded-full object-cover"
              priority
            />
            Parampreet Singh
          </p>
          <p className="inline-flex items-center gap-2 px-2 font-heading text-xl font-bold text-prussian-blue dark:text-bright-snow sm:hidden">
            <Image
              src="/parampreet.png"
              alt="Parampreet Singh"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
              priority
            />
            Parampreet Singh
          </p>
        </div>

        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <DesktopNav
            activeSection={activeSection}
            indicator={desktopIndicator}
            navRef={desktopNavRef}
            onNavigate={setActiveSection}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle theme={theme} mounted={mounted} onToggle={toggleTheme} />
          <a
            href="mailto:hey@itsparam.dev"
            className="inline-flex h-12 items-center justify-center rounded-full bg-sky-surge px-4 font-heading text-xs font-semibold text-ink-black transition hover:shadow-cta-glow sm:px-5 sm:text-sm"
          >
            hey@itsparam.dev
          </a>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 flex justify-center px-4 sm:hidden">
        <MobileNav
          activeSection={activeSection}
          indicator={mobileIndicator}
          navRef={mobileNavRef}
          onNavigate={setActiveSection}
        />
      </div>
    </header>
  );
}
