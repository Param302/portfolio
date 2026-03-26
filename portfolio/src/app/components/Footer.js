import Image from "next/image";
import Link from "next/link";

const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
    { label: "Resume", href: "/resume" },
];

const socialLinks = [
    { label: "GitHub", href: "https://github.com/Param302" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/param302" },
    { label: "YouTube", href: "https://www.youtube.com/@Param3021" },
    { label: "X", href: "https://x.com/Param3021" },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="section-anchor relative w-full overflow-hidden bg-papaya-whip px-4 pb-7 pt-14 dark:border-alice-blue/10 dark:bg-gradient-to-b dark:from-ink-black dark:to-papaya-whip sm:px-6 lg:px-8">
            <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-6 bg-gradient-to-r from-prussian-blue/35 via-prussian-blue/10 to-prussian-blue/35 bg-clip-text text-center font-heading text-[2.2rem] font-semibold uppercase leading-none tracking-[0.28em] text-transparent sm:text-[3.4rem] sm:tracking-[0.34em] lg:text-[5rem]"
            >
                Parampreet Singh
            </p>

            <div className="relative z-10 mx-auto max-w-7xl p-1 sm:p-2">
                <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-prussian-blue/20 bg-bright-snow/60 px-3 py-2 dark:border-alice-blue/10 dark:bg-papaya-whip">
                            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-prussian-blue/20 dark:border-alice-blue/10">
                                <Image
                                    src="/parampreet.png"
                                    alt="Parampreet Singh"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-cover"
                                />
                            </span>
                            <span className="font-heading text-sm font-semibold text-prussian-blue">
                                itsparam.in
                            </span>
                        </div>

                        <p className="mt-4 max-w-sm font-description text-sm leading-6 text-prussian-blue/80 dark:text-bright-snow/85">
                            AI engineer building production-grade systems, practical tooling, and product-focused ML experiences.
                        </p>

                        <a
                            href="mailto:hey@itsparam.in"
                            className="mt-4 inline-flex rounded-full border border-prussian-blue/20 bg-bright-snow/50 px-4 py-2 font-description text-sm text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-prussian-blue/25 dark:bg-papaya-whip/90 dark:text-ink-black"
                        >
                            hey@itsparam.in
                        </a>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="font-heading text-xs uppercase tracking-[0.22em] text-prussian-blue/60 dark:text-bright-snow/65">
                                Quick Links
                            </p>
                            <ul className="mt-3 space-y-2">
                                {quickLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="font-description text-sm text-prussian-blue transition hover:text-sky-surge dark:text-ink-black"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-heading text-xs uppercase tracking-[0.22em] text-prussian-blue/60 dark:text-bright-snow/65">
                                Social
                            </p>
                            <ul className="mt-3 space-y-2">
                                {socialLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-description text-sm text-prussian-blue transition hover:text-sky-surge dark:text-ink-black"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-prussian-blue/15 pt-4 dark:border-alice-blue/10">
                    <p className="font-description text-xs text-prussian-blue/60 dark:text-ink-black/70">
                        © {year} Parampreet Singh
                    </p>
                </div>
            </div>
        </footer>
    );
}
