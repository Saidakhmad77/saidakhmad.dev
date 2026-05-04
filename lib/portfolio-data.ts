// Single source of truth for resume content. Update here, the whole site reflects.

export type Profile = {
  name: string
  title: string
  brief: string
  location: string
  contact: {
    email: string
    github: string
    githubUrl: string
    linkedin: string
    linkedinUrl: string
    phone: string
  }
  visa: string
}

export type Experience = {
  company: string
  companyKo?: string
  role: string
  team?: string
  location: string
  period: string
  current?: boolean
  summary: string
  bullets: string[]
  stack: string[]
}

export type Project = {
  slug: string
  name: string
  org: string
  period: string
  tagline: string
  detail: string
  stack: string[]
  highlight?: boolean
}

export type SkillCategory = {
  category: string
  items: string[]
}

export type Language = {
  name: string
  level: string
  cert?: string
}

export type Education = {
  school: string
  degree: string
  location: string
  period: string
  gpa: string
}

export type Certificate = {
  name: string
  issuer?: string
  date: string
}

// ─────────────────────────────────────────────────────────────────────────────

export const profile: Profile = {
  name: "Saidakhmad Nuriddinov",
  title: "Autonomous Driving Simulation Engineer",
  brief:
    "Building autonomous yard-tractor simulation at Maum.ai — Isaac Sim, Omniverse, USD, PhysX, ROS 2. Backend & full-stack engineer at heart.",
  location: "Seongnam, South Korea",
  contact: {
    email: "lionuz669@gmail.com",
    github: "Saidakhmad77",
    githubUrl: "https://github.com/Saidakhmad77",
    linkedin: "saidahmad77",
    linkedinUrl: "https://www.linkedin.com/in/saidahmad77",
    phone: "+82 10-3173-4707",
  },
  visa: "D-10 · Uzbekistan",
}

export const experience: Experience[] = [
  {
    company: "Maum.ai",
    companyKo: "마음에이아이",
    role: "Autonomous Driving Simulation Engineer",
    team: "WoRV",
    location: "Seongnam",
    period: "Feb 2026 — Present",
    current: true,
    summary:
      "Autonomous yard-tractor simulation (ability_port, XCMG 15-DOF) on NVIDIA Isaac Sim / Omniverse.",
    bullets: [
      "Built worv.env.lights, a solar lighting Isaac Sim extension using a stdlib-only Fourier model; established the MVC pattern (extension → window → controller) adopted as the team-wide template for all worv.* extensions.",
      "Shipped worv.env.climate (rain/snow/fog via USD PointInstancer + Warp + RTX) and led a 5-bug fix branch introducing a 3-source PositionTracker for robot-following rain and controller-level error surfacing.",
      "Designed worv.core.logging, a configurable-Hz simulation logger combining OmniGraph with direct PhysX USD reads via a pluggable BaseExporter — enabled the team's first benchmark scenario comparison.",
      "Built a Docker Nucleus worker plus a 3-commit UE5 C++ plugin patch fixing UE Connector's baked 1×1 opacity textures so designers can edit opacity directly in Isaac Sim.",
      "Applied physics, colliders, and NavMesh across the ability_port map; added an Ackermann controller and refactored the ROS 2 teleop_node from Xbox-only to hardware-agnostic via a JoyMapping dataclass.",
    ],
    stack: [
      "NVIDIA Isaac Sim",
      "Omniverse",
      "USD",
      "PhysX",
      "OmniGraph",
      "Nucleus",
      "ROS 2",
      "Python",
      "C++ (UE5)",
      "Docker",
    ],
  },
  {
    company: "ChoiceTech Korea",
    companyKo: "초이스테크코리아",
    role: "Backend Developer",
    location: "Yongin",
    period: "Jul 2025 — Oct 2025",
    summary: "AI-powered hair & skin analysis platforms used by L'Oréal and Dior.",
    bullets: [
      "Implemented JWT auth, CRUD, and pagination on NestJS + PostgreSQL; shipped new features and bug fixes that improved backend stability and maintainability.",
      "Customized backend APIs and database structures for L'Oréal and Dior analysis platforms; implemented real-time update mechanisms tailored to each brand.",
      "Validated web/app analysis-result consistency on Next.js, integrated REST APIs, and resolved cross-stack data-flow issues end-to-end.",
      "Standardized license-expiry logic across all projects with automated daily updates and 30-day pre-expiration notifications.",
      "Optimized SQL keyword mapping for dermatological analysis, achieving over 20% faster real-time response.",
    ],
    stack: ["NestJS", "PostgreSQL", "Next.js", "React", "TypeScript", "JavaScript"],
  },
  {
    company: "STEMON",
    companyKo: "스템온",
    role: "Software Developer",
    location: "Seongnam",
    period: "Dec 2024 — Jul 2025",
    summary: "Web services and embedded medical-device management systems.",
    bullets: [
      "Built a corporate Q&A system (HTML/CSS/JS) and an investor-relations React/SCSS SPA; deployed via GitHub Pages and Vercel with CI/CD.",
      "Developed the DDDS Admin App in C++ for real-time medical-device monitoring with auto-detection of faulty components and CSV export.",
      "Validated hardware-software integration with ESP32-S3 over USB serial; redesigned the on-device UI on DWIN DGUS for production deployments.",
      "Led the final-month team project as Wcoding bootcamp lead — full-stack React + Flask + MySQL with auth, notifications, and DB design.",
    ],
    stack: ["React", "SCSS", "JavaScript", "HTML/CSS", "Flask", "MySQL", "C++"],
  },
]

export const projects: Project[] = [
  {
    slug: "worv-env-lights",
    name: "worv.env.lights",
    org: "Maum.ai",
    period: "2026.03",
    tagline: "Solar lighting Isaac Sim extension. Fourier solar model, stdlib-only.",
    detail:
      "Spencer 1971 Fourier solar model (stdlib only), Tanner Helland Kelvin→RGB, timeline 1×–500×, adopt-vs-create lights, stage lifecycle subscription. MVC architecture became the team-wide template.",
    stack: ["Isaac Sim", "USD", "Python", "MVC"],
    highlight: true,
  },
  {
    slug: "worv-env-climate",
    name: "worv.env.climate",
    org: "Maum.ai",
    period: "2026.04",
    tagline: "Rain/snow/fog effects via USD PointInstancer + Warp kernels + RTX.",
    detail:
      "5-bug fix branch (+405/−358) including PositionTracker, RTX key discovery, silent-failure surfacing pattern.",
    stack: ["Isaac Sim", "USD", "Warp", "RTX", "Python"],
    highlight: true,
  },
  {
    slug: "worv-core-logging",
    name: "worv.core.logging",
    org: "Maum.ai",
    period: "2026.04",
    tagline: "Configurable-Hz simulation data logger. Hybrid OmniGraph + direct PhysX USD reads.",
    detail:
      "Pluggable BaseExporter (CSV/JSON/Console), smart root-link resolution, frame dedup via absoluteSimTime.",
    stack: ["Isaac Sim", "OmniGraph", "PhysX", "Python"],
  },
  {
    slug: "usd-opacity-tools",
    name: "usd-opacity-tools",
    org: "Maum.ai",
    period: "2026.04",
    tagline: "Docker Nucleus post-processor + 3-commit UE5 C++ plugin patch.",
    detail:
      "Fixes UE Connector's baked 1×1 opacity textures so designers can edit opacity in Isaac Sim. Includes DeviceFlow auth workaround for headless containers.",
    stack: ["Docker", "Nucleus", "UE5", "C++"],
  },
  {
    slug: "g29-teleop-port",
    name: "G29 Teleop Port",
    org: "Maum.ai",
    period: "2026.03 — 2026.04",
    tagline: "Hardware-agnostic ROS 2 teleop for the XCMG tractor.",
    detail:
      "Refactored hardcoded Xbox enum into a configurable JoyMapping dataclass with per-axis inversion, deadzone gating, accel/brake pedal merging.",
    stack: ["ROS 2", "Python", "Logitech G29"],
  },
  {
    slug: "ddds-admin-app",
    name: "DDDS Admin App",
    org: "STEMON",
    period: "2025.03 — 2025.07",
    tagline: "Internal real-time device monitoring (C++) with ESP32-S3 USB serial integration.",
    detail:
      "DWIN DGUS embedded UI; auto-detection of faulty parts and CSV data export.",
    stack: ["C++", "ESP32-S3", "DWIN DGUS"],
  },
]

export const skills: SkillCategory[] = [
  {
    category: "Robotics & Simulation",
    items: ["NVIDIA Isaac Sim", "Omniverse", "USD", "PhysX", "OmniGraph", "ROS 2", "Nucleus"],
  },
  {
    category: "Languages",
    items: ["Python", "C++", "TypeScript", "JavaScript"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "SCSS"],
  },
  {
    category: "Backend",
    items: ["NestJS", "Node.js", "Flask"],
  },
  {
    category: "Database & DevOps",
    items: ["PostgreSQL", "MySQL", "MariaDB", "Docker", "Vercel", "GitHub Pages"],
  },
  {
    category: "Tools",
    items: ["Git", "Postman", "Notion", "Logitech G29"],
  },
]

export const languages: Language[] = [
  { name: "Korean", level: "Advanced", cert: "TOPIK 4" },
  { name: "English", level: "Advanced", cert: "IELTS 7" },
  { name: "Russian", level: "Intermediate" },
  { name: "Uzbek", level: "Native" },
]

export const education: Education = {
  school: "Gachon University",
  degree: "B.S. in Computer Engineering",
  location: "Seongnam, South Korea",
  period: "Aug 2018 — Feb 2023",
  gpa: "3.54 / 4.5",
}

export const certificates: Certificate[] = [
  { name: "KIIP Level 5", date: "Nov 2025" },
  { name: "Wcoding Full-Stack Bootcamp", date: "Nov 2024" },
  { name: "TOPIK Level 4", date: "Jul 2023" },
  { name: "Business Korean", issuer: "Seoul Global Center", date: "Sep 2023" },
  { name: "Minister's Prize", issuer: "Education Ministry of Uganda", date: "Jun 2023" },
  { name: "President's Award", issuer: "KIU Uganda", date: "Jun 2023" },
  { name: "Dean's Award", issuer: "Computer Engineering, Gachon", date: "Dec 2021" },
]
