const techStack = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Bun",
  "Azure",
  "AWS",
  "Docker",
  "OpenAI",
  "Anthropic",
];

interface Project {
  name: string;
  description: string;
  url: string;
  repo: string;
}

const projects: Project[] = [
  {
    name: "LearnWise",
    description:
      "An AI-powered learning platform that personalises education using intelligent tutoring and adaptive content delivery.",
    url: "https://learnwise.au",
    repo: "https://github.com/jkirito/learnwise",
  },
  {
    name: "OmniChat",
    description:
      "A unified chat interface that connects multiple AI providers into a single seamless conversation experience.",
    url: "https://omnichat.au",
    repo: "https://github.com/jkirito/omnichat",
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

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-[family-name:var(--font-geist-sans)]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
          Melbourne, Australia
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          Arpit Singh
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-xl">
          Full-Stack Developer &amp; AI Product Builder.
          <br className="hidden sm:block" /> Building tools that make AI
          accessible and useful.
        </p>
        <div className="mt-8 h-px w-16 bg-zinc-700" />
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-8 text-center">
          Tech Stack
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-8 text-center">
          Projects
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.name}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-600"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                {project.description}
              </p>
              <div className="flex gap-4 text-sm">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 underline underline-offset-4 hover:text-zinc-100 transition-colors"
                >
                  Visit
                </a>
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 underline underline-offset-4 hover:text-zinc-100 transition-colors"
                >
                  Source
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connect */}
      <section className="px-6 py-16 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-8">
          Connect
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {socials.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-100 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} Arpit Singh
      </footer>
    </div>
  );
}
