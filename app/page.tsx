interface TechItem {
  name: string;
  color: string;
}

interface TechCategory {
  label: string;
  items: TechItem[];
}

const techStack: TechCategory[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript", color: "text-accent-cyan" },
      { name: "JavaScript", color: "text-accent-warm" },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { name: "React", color: "text-accent-cyan" },
      { name: "Next.js", color: "text-fg" },
      { name: "Node.js", color: "text-accent-cyan" },
      { name: "Bun", color: "text-accent-warm" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Azure", color: "text-accent-cyan" },
      { name: "AWS", color: "text-accent-warm" },
      { name: "Docker", color: "text-accent-cyan" },
    ],
  },
  {
    label: "AI",
    items: [
      { name: "OpenAI", color: "text-accent-cyan" },
      { name: "Anthropic", color: "text-accent-violet" },
    ],
  },
];

interface Project {
  name: string;
  description: string;
  url: string;
  repo: string;
  gradient: string;
  tag: string;
}

const projects: Project[] = [
  {
    name: "LearnWise",
    description:
      "AI-powered learning platform that personalises education through intelligent tutoring and adaptive content delivery.",
    url: "https://learnwise.au",
    repo: "https://github.com/jkirito/learnwise",
    gradient: "from-accent-warm/20 to-accent-rose/5",
    tag: "Education",
  },
  {
    name: "OmniChat",
    description:
      "Unified chat interface connecting multiple AI providers into one seamless conversation experience.",
    url: "https://omnichat.au",
    repo: "https://github.com/jkirito/omnichat",
    gradient: "from-accent-violet/20 to-accent-cyan/5",
    tag: "AI Tools",
  },
];

interface SocialLink {
  label: string;
  href: string;
}

const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/jkirito" },
  { label: "LinkedIn", href: "https://linkedin.com/in/arpitsingh" },
  { label: "Twitter", href: "https://twitter.com/jkirito" },
  { label: "Email", href: "mailto:arpit@jkirito.site" },
];

function SectionLabel({ children, delay }: { children: string; delay: string }) {
  return (
    <div className="reveal-up flex items-center gap-4 mb-12" style={{ animationDelay: delay }}>
      <span className="font-body text-[11px] tracking-[0.2em] uppercase text-fg-dim">
        {children}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-glass-border to-transparent" />
    </div>
  );
}

import MetaballBackground from "./components/MetaballBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-grid">
      {/* ── Background layer (fixed, no layout impact) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 3D Metaball blobs */}
      <MetaballBackground />

      {/* Floating particles */}
      <div
        className="particle particle-glow"
        style={{
          width: 3,
          height: 3,
          left: "12%",
          bottom: "-5%",
          animation: "float-up-1 14s linear infinite",
        }}
      />
      <div
        className="particle particle-warm"
        style={{
          width: 2,
          height: 2,
          left: "28%",
          bottom: "-8%",
          animation: "float-up-2 18s linear infinite 3s",
        }}
      />
      <div
        className="particle particle-cyan"
        style={{
          width: 3,
          height: 3,
          left: "55%",
          bottom: "-3%",
          animation: "float-up-3 16s linear infinite 1s",
        }}
      />
      <div
        className="particle particle-glow"
        style={{
          width: 2,
          height: 2,
          left: "72%",
          bottom: "-6%",
          animation: "float-up-1 20s linear infinite 5s",
        }}
      />
      <div
        className="particle particle-rose"
        style={{
          width: 2,
          height: 2,
          left: "40%",
          bottom: "-4%",
          animation: "float-up-2 15s linear infinite 8s",
        }}
      />
      <div
        className="particle particle-warm"
        style={{
          width: 3,
          height: 3,
          left: "85%",
          bottom: "-7%",
          animation: "float-diagonal 17s linear infinite 2s",
        }}
      />
      <div
        className="particle particle-cyan"
        style={{
          width: 2,
          height: 2,
          left: "8%",
          bottom: "-10%",
          animation: "float-up-3 22s linear infinite 6s",
        }}
      />
      <div
        className="particle particle-glow"
        style={{
          width: 2,
          height: 2,
          left: "63%",
          bottom: "-2%",
          animation: "float-up-1 19s linear infinite 10s",
        }}
      />
      <div
        className="particle particle-rose"
        style={{
          width: 3,
          height: 3,
          left: "92%",
          bottom: "-5%",
          animation: "float-up-2 21s linear infinite 4s",
        }}
      />
      <div
        className="particle particle-warm"
        style={{
          width: 2,
          height: 2,
          left: "35%",
          bottom: "-9%",
          animation: "float-diagonal 16s linear infinite 12s",
        }}
      />

      {/* Geometric rings */}
      <div
        className="geo-ring"
        style={{
          width: 300,
          height: 300,
          top: "8%",
          right: "5%",
          borderColor: "var(--accent-violet)",
          animation: "spin-slow 60s linear infinite, pulse-ring 8s ease-in-out infinite",
        }}
      />
      <div
        className="geo-ring"
        style={{
          width: 200,
          height: 200,
          top: "12%",
          right: "8.5%",
          borderColor: "var(--accent-cyan)",
          animation: "spin-reverse 45s linear infinite, pulse-ring 6s ease-in-out infinite 2s",
        }}
      />
      <div
        className="geo-ring"
        style={{
          width: 400,
          height: 400,
          bottom: "15%",
          left: "-5%",
          borderColor: "var(--accent-warm)",
          animation: "spin-slow 80s linear infinite, pulse-ring 10s ease-in-out infinite 1s",
        }}
      />

      {/* Horizon lines */}
      <div className="horizon-line" style={{ top: "30%" }} />
      <div className="horizon-line" style={{ top: "65%", opacity: 0.5 }} />

      {/* Cross markers */}
      <div className="cross-marker" style={{ top: "20%", left: "6%" }}>+</div>
      <div className="cross-marker" style={{ top: "45%", right: "8%", animationDelay: "1.5s" }}>+</div>
      <div className="cross-marker" style={{ top: "75%", left: "15%", animationDelay: "3s" }}>+</div>
      <div className="cross-marker" style={{ bottom: "20%", right: "12%", animationDelay: "2s" }}>+</div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* ── Navigation ── */}
        <nav
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5"
          style={{
            background: "linear-gradient(to bottom, var(--bg), transparent)",
          }}
        >
          <span className="font-display font-bold text-lg tracking-tight">
            A<span className="text-accent-warm">.</span>S
          </span>
          <div className="flex items-center gap-6">
            {socials.slice(0, 2).map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-glow text-xs text-fg-muted hover:text-fg font-body tracking-wide"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="px-6 sm:px-10 pt-24 sm:pt-32 pb-32 max-w-5xl mx-auto">
          <p
            className="reveal-up font-body text-xs tracking-[0.25em] uppercase text-fg-dim mb-6"
            style={{ animationDelay: "0.1s" }}
          >
            Full-Stack Developer &amp; AI Product Builder
          </p>

          <h1
            className="reveal-up font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter mb-8"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="block">Arpit</span>
            <span className="block gradient-text-shimmer">Singh</span>
          </h1>

          <div
            className="reveal-up max-w-lg"
            style={{ animationDelay: "0.35s" }}
          >
            <p className="font-body text-sm sm:text-base text-fg-muted leading-relaxed">
              Building tools that make AI accessible and useful.
              <br />
              Based in{" "}
              <span className="text-fg">Melbourne, Australia</span>
              <span className="blink text-accent-violet ml-0.5">|</span>
            </p>
          </div>

          {/* Scroll hint */}
          <div
            className="reveal-up mt-20 flex items-center gap-3 text-fg-dim"
            style={{ animationDelay: "0.45s" }}
          >
            <span className="block w-px h-8 bg-gradient-to-b from-fg-dim to-transparent" />
            <span className="font-body text-[10px] tracking-widest uppercase">
              Scroll
            </span>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="px-6 sm:px-10 py-24 max-w-5xl mx-auto">
          <SectionLabel delay="0.1s">Stack</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {techStack.map((category, i) => (
              <div
                key={category.label}
                className="reveal-scale glass-card rounded-2xl p-6"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <span className="font-body text-[10px] tracking-[0.15em] uppercase text-fg-dim block mb-4">
                  {category.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((tech) => (
                    <span key={tech.name} className="tag-pill">
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="px-6 sm:px-10 py-24 max-w-5xl mx-auto">
          <SectionLabel delay="0.1s">Projects</SectionLabel>

          <div className="space-y-6">
            {projects.map((project, i) => (
              <div
                key={project.name}
                className={`reveal-up glass-card group rounded-2xl overflow-hidden`}
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              >
                {/* Gradient accent bar */}
                <div
                  className={`h-px bg-gradient-to-r ${project.gradient}`}
                />

                <div className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <span className="font-body text-[10px] tracking-[0.15em] uppercase text-fg-dim block mb-3">
                        {project.tag}
                      </span>
                      <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight group-hover:gradient-text transition-all duration-500">
                        {project.name}
                      </h3>
                    </div>

                    <div className="flex gap-3 sm:pt-6">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.08] px-5 py-2 text-xs font-body text-fg-muted transition-all duration-300 hover:bg-white/[0.1] hover:text-fg hover:border-white/[0.15]"
                      >
                        Visit
                        <svg
                          className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M17 7H7M17 7v10"
                          />
                        </svg>
                      </a>
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] px-5 py-2 text-xs font-body text-fg-dim transition-all duration-300 hover:text-fg-muted hover:border-white/[0.1]"
                      >
                        Source
                      </a>
                    </div>
                  </div>

                  <p className="font-body text-sm text-fg-muted leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Connect ── */}
        <section className="px-6 sm:px-10 py-24 pb-16 max-w-5xl mx-auto">
          <SectionLabel delay="0.1s">Connect</SectionLabel>

          <div
            className="reveal-up glass-card rounded-2xl p-8 sm:p-10 text-center"
            style={{ animationDelay: "0.15s" }}
          >
            <p className="font-display font-bold text-xl sm:text-2xl tracking-tight mb-2">
              Let&apos;s build something{" "}
              <span className="gradient-text">together</span>
            </p>
            <p className="font-body text-sm text-fg-muted mb-8">
              Always open to interesting conversations and collaborations.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reveal-scale inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] px-6 py-2.5 text-sm font-body text-fg-muted transition-all duration-300 hover:bg-white/[0.08] hover:text-fg hover:border-white/[0.14] hover:-translate-y-0.5"
                  style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-fg-dim">
            <span className="font-body text-xs">
              &copy; {new Date().getFullYear()} Arpit Singh
            </span>
            <span className="font-body text-[10px] tracking-widest uppercase">
              Crafted with intent
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
