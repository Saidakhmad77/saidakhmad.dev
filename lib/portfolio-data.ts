// Single source of truth for resume content. Update here, the whole site reflects.

export type Profile = {
  name: string
  nickname: string
  title: string
  brief: string
  beliefs: string
  hobbies: string[]
  location: string
  resumeUrl: string
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

export type Now = {
  focus: string
  learning: string[]
  reading: { title: string; author: string }[]
  tinkering: string[]
}

export type Uses = {
  category: string
  items: string[]
}

export type WritingTopic = {
  slug: string
  title: string
  summary: string
  status: "planned" | "draft" | "shipped"
  date?: string
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

export type Principle = {
  slug: 'debug-with-data' | 'surface-not-silence' | 'constraints-as-inputs'
  ordinal: string
  claim: string
  blurb: string
  example: string
  exampleTitle: string
  proof: 'silent' | 'solar' | 'joystick' | 'none'
  accent: 'cyan' | 'warm' | 'fail'
}

export type AboutCover = {
  hook: string
  motivation: string
  arc: string
  philosophy: string
  greeting: string
}

export type ProjectCategory = 'extension' | 'patch' | 'tool' | 'pipeline'

export type ProjectMeta = {
  slug: string
  category: ProjectCategory
  metric: string
}

export type ProjectConstraint = {
  slug: string
  label: string
  body: string
}

// ─────────────────────────────────────────────────────────────────────────────

export const profile: Profile = {
  name: "Saidakhmad Nuriddinov",
  nickname: "Sam",
  title: "Autonomous Driving Simulation Engineer",
  brief:
    "Building autonomous-vehicle simulation at Maum.ai — Isaac Sim, Omniverse, USD, PhysX, ROS 2. Backend & full-stack engineer at heart. F1 watcher.",
  beliefs: "Simulators should fail honestly.",
  hobbies: ["Football", "F1"],
  location: "Seoul, South Korea",
  resumeUrl: "/resume_saidakhmad.pdf",
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

// ─── /now ────────────────────────────────────────────────────────────────────
// What's true *this month*. Updated periodically — distinct from the timeline
// of where I've worked. Pattern: Derek Sivers /now convention.

export const now: Now = {
  focus:
    "Production extensions on the WoRV simulation pipeline at Maum.ai — 15-DOF articulated rig, weather + lighting controllers, ROS 2 teleop refactors.",
  learning: ["Business Korean writing", "ROS 2 internals (DDS, executors, lifecycle)"],
  reading: [
    { title: "The Thinking Machine", author: "Stephen Witt" },
    { title: "The 48 Laws of Power", author: "Robert Greene" },
  ],
  tinkering: [],
}

// ─── /uses ───────────────────────────────────────────────────────────────────
// Daily-driver stack. Wes Bos /uses convention.

export const uses: Uses[] = [
  {
    category: "Sim Platform",
    items: ["NVIDIA Isaac Sim", "Omniverse", "USD", "PhysX", "OmniGraph", "Nucleus"],
  },
  {
    category: "Languages",
    items: ["Python", "C++ (UE5)", "TypeScript"],
  },
  {
    category: "Editor & Shell",
    items: ["VS Code", "iTerm2", "Git"],
  },
  {
    category: "Daily Tools",
    items: ["Docker", "Postman", "Notion", "Logitech G29 (teleop testing)"],
  },
  {
    category: "Site",
    items: ["Next.js 16", "React 19", "Tailwind v4", "Geist + Geist Mono"],
  },
]

// ─── Writing ─────────────────────────────────────────────────────────────────
// Planned topics. Stubs become posts when the time comes — the structure is
// here so the section is real, not a "Coming soon" placeholder.

export const writingTopics: WritingTopic[] = [
  {
    slug: "ros2-teleop-hardware-agnostic",
    title: "Why ROS 2 teleop should be hardware-agnostic from day one",
    summary:
      "How a JoyMapping dataclass replaced 200 lines of Xbox-specific enum and made the same controller work for G29, PS5, and headless rigs.",
    status: "planned",
  },
  {
    slug: "ue5-opacity-gotcha",
    title: "The UE5 Omniverse Connector bakes 1×1 opacity textures and nobody documented it",
    summary:
      "A 3-commit patch that took two days to find, plus the Docker Nucleus worker that surfaced the bug in the first place.",
    status: "planned",
  },
  {
    slug: "fourier-solar-stdlib",
    title: "A stdlib-only Fourier solar model in 200 lines of Python",
    summary:
      "Spencer 1971 + Tanner Helland Kelvin→RGB. Why the team's previous solar lighting was wrong by 30 minutes at sunset, and how to fix it without external deps.",
    status: "planned",
  },
]

export const experience: Experience[] = [
  {
    company: "Maum.ai",
    companyKo: "마음에이아이",
    role: "Autonomous Driving Simulation Engineer",
    team: "WoRV",
    location: "Seoul",
    period: "Feb 2026 — Present",
    current: true,
    summary:
      "Production simulation infrastructure for autonomous vehicles on NVIDIA Isaac Sim / Omniverse — physics, sensors, controllers, and tooling.",
    bullets: [
      "Built worv.env.lights, a solar lighting Isaac Sim extension using a stdlib-only Fourier model; established the MVC pattern (extension → window → controller) adopted as the team-wide template for all worv.* extensions.",
      "Shipped worv.env.climate (rain/snow/fog via USD PointInstancer + Warp + RTX) and led a 5-bug fix branch introducing a 3-source PositionTracker for robot-following rain and controller-level error surfacing.",
      "Designed worv.core.logging, a configurable-Hz simulation logger combining OmniGraph with direct PhysX USD reads via a pluggable BaseExporter — enabled the team's first benchmark scenario comparison.",
      "Built a Docker Nucleus worker plus a 3-commit UE5 C++ plugin patch fixing UE Connector's baked 1×1 opacity textures so designers can edit opacity directly in Isaac Sim.",
      "Applied physics, colliders, and NavMesh across the simulated environment; added an Ackermann controller and refactored the ROS 2 teleop_node from Xbox-only to hardware-agnostic via a JoyMapping dataclass.",
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
    location: "Seoul",
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
    tagline: "Hardware-agnostic ROS 2 teleop for a 15-DOF articulated tractor rig.",
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
    items: ["NVIDIA Isaac Sim", "Omniverse", "USD", "PhysX", "OmniGraph", "Warp", "ROS 2", "Nucleus"],
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
  { name: "Uzbek", level: "Native" },
]

export const education: Education = {
  school: "Gachon University",
  degree: "B.S. in Computer Engineering",
  location: "Seoul, South Korea",
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

// ─── Cover-letter prose ──────────────────────────────────────────────────────
// Single-source-of-truth strings sliced from Saidakhmad_Cover_Letter.pdf so the
// hero, about block, and metadata description all stay aligned without
// drifting into "marketing-ese." The voice is the cover letter's voice — first
// person, technically specific, philosophy-forward.

export const aboutCover: AboutCover = {
  greeting: "자기소개",
  // Single punchy line for the hero. Detail moves to /about.
  hook:
    "Where physics, sensors, control, and software have to mesh as one system.",
  motivation:
    "Full-stack background. Embedded along the way. Now simulation — USD, PhysX, OmniGraph, ROS 2, the UE5 Connector. The throughline is wanting to understand systems end-to-end.",
  arc:
    "STEMON → ChoiceTech → Maum.ai. Three roles, three modes: embedded medical devices at STEMON, then NestJS commercial-service backends at ChoiceTech (with global collaborations on L'Oréal and Dior hair/skin-analysis platforms), then production Isaac Sim extensions on the WoRV team at Maum.ai.",
  philosophy:
    "In a physics engine, wrong code succeeds. A bad prim path returns zero. A wrong carb key silently creates a new one. So every controller I write surfaces failures into logs — and constraints (no pip, read-only USD inputs) end up being the most interesting design inputs I get.",
}

export const principles: Principle[] = [
  {
    slug: "debug-with-data",
    ordinal: "01",
    claim: "Debug with data, not assumptions.",
    blurb: "Every value is a sensor. If the pose is zero, the answer is in the USD tree.",
    exampleTitle: "worv.env.lights",
    example:
      "Pose came back as zero. Traced which prim had RigidBodyAPI, what the USD attribute returned, the prim path. The trace fixed it.",
    proof: "solar",
    accent: "cyan",
  },
  {
    slug: "surface-not-silence",
    ordinal: "02",
    claim: "Surface failures, don't silence them.",
    blurb: "Code that succeeds-but-wrong is worse than code that crashes.",
    exampleTitle: "WeatherController.step()",
    example:
      "Each effect wrapped in try/except at the controller. One effect failing can't abort the others — and the failure lands in a log line, not a black box.",
    proof: "silent",
    accent: "cyan",
  },
  {
    slug: "constraints-as-inputs",
    ordinal: "03",
    claim: "Constraints are inputs to design.",
    blurb: "No pip. Read-only USD. The constraints became the design.",
    exampleTitle: "Spencer 1971 + UE5 patch",
    example:
      "No pip → 200 lines of stdlib Fourier. Read-only USD inputs → Docker Nucleus worker → 3-commit UE5 C++ plugin patch upstream.",
    proof: "joystick",
    accent: "warm",
  },
]

// ─── Per-project category + metric badges ───────────────────────────────────
// One badge per project — turns the wall-of-text grid into something the eye
// can navigate at a glance. Categories use the warm / cyan / fail accents
// already established.

export const projectMeta: ProjectMeta[] = [
  { slug: "worv-env-lights",  category: "extension", metric: "Spencer 1971" },
  { slug: "worv-env-climate", category: "extension", metric: "+405 / −358" },
  { slug: "worv-core-logging", category: "extension", metric: "OmniGraph + PhysX" },
  { slug: "usd-opacity-tools", category: "patch",    metric: "UE5 · 3 commits" },
  { slug: "g29-teleop-port",   category: "tool",     metric: "Xbox → G29" },
  { slug: "ddds-admin-app",    category: "tool",     metric: "ESP32-S3 · DGUS" },
]

// ─── Per-project "constraint" rows ──────────────────────────────────────────
// One per project in projects[]. Surfaces the cover-letter thesis ("constraints
// are inputs to design") right onto the project cards.

export const projectConstraints: ProjectConstraint[] = [
  {
    slug: "worv-env-lights",
    label: "No pip dependencies inside Isaac Sim.",
    body: "Wrote the Spencer 1971 Fourier solar model from scratch in 200 lines of standard library Python.",
  },
  {
    slug: "worv-env-climate",
    label: "Silent failures across rain/snow/fog effects.",
    body: "Controller-level try/except surfacing pattern and a three-source PositionTracker for robot-following rain.",
  },
  {
    slug: "worv-core-logging",
    label: "No way to compare scenarios run-to-run.",
    body: "Combined OmniGraph Action Graph with direct PhysX USD reads via a pluggable BaseExporter — first time the team could line up benchmark data per scenario.",
  },
  {
    slug: "usd-opacity-tools",
    label: "USD's connected inputs are read-only — opacity gets baked into 1×1 textures.",
    body: "Docker Nucleus post-processor + a 3-commit UE5 C++ plugin patch upstream. Designers now edit opacity directly in Isaac Sim.",
  },
  {
    slug: "g29-teleop-port",
    label: "ROS 2 teleop_node was hardcoded for Xbox only.",
    body: "Refactored into a hardware-agnostic structure supporting Logitech G29 via a JoyMapping dataclass.",
  },
  {
    slug: "ddds-admin-app",
    label: "Embedded device data had no consistent export path.",
    body: "Auto-detection of faulty parts plus CSV export, with DWIN DGUS UI redesigned for production deployments.",
  },
]
