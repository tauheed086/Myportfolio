// Profile and portfolio content extracted from Tauheed Mulla's resume
export const profile = {
  name: "Tauheed Mulla",
  logo: "/logo.ico",
  wordmark: "tauheed.dev",
  role: "Software Developer",
  heroKicker: "SOFTWARE DEVELOPER · ENTERPRISE AUTOMATION & MODERN WEB",
  heroTitle: [
    "while(alive): build(); learn(); repeat();",
  ],
  intro: "Software Developer specializing in system automation, robust endpoint orchestration, and fluid modern web applications.",
  about: "I bridge low-level system craftsmanship with intuitive user experiences. From Windows endpoint telemetry agents to responsive web platforms, I focus on performance, reliability, and code that scales cleanly.",
  aboutMore: "Specialized in Python (Flask, Django), JavaScript (React, Node), MySQL, and system-level automation. Awarded State-Level Best Project recognition by KSCST for Deep Learning research.",
  email: "tauheedbldeacet@gmail.com",
  phone: "+91 7022414726",
  location: "Thane, Maharashtra",
  github: "https://github.com/tauheed086",
  linkedin: "https://www.linkedin.com/in/tauheedmulla",
  resume: "/Tauheed_Mulla_Resume.pdf",
};

export const projects = [
  {
    id: "01",
    title: "Seamie Software Installer",
    subtitle: "Windows Endpoint Deployment Platform",
    category: "System Automation & Backend",
    type: "ENTERPRISE DEPLOYMENT / TELEMETRY",
    description: "Built a Python-based Windows endpoint agent to collect software inventory and health telemetry while executing silent installations for .exe, .msi, .msix, .ps1, and .bat packages. Engineered a Flask + Waitress backend with MySQL for lifecycle auditing, admin APIs, and automated silent-install detection.",
    stack: ["Python", "Flask", "Waitress", "MySQL", "PyInstaller", "ReportLab"],
    visual: "terminal",
    placeholder: false,
    problem: "Enterprise Windows environments needed an offline-capable, automated platform to remotely audit endpoint software health and execute silent multi-format package installations with audit trails.",
    approach: "Designed a lightweight background agent communicating with a multithreaded Flask/Waitress server, featuring automated installer command detection, PDF status reporting, and Outlook COM alerting.",
    outcome: "Eliminated manual technician workstation setups, providing end-to-end installation lifecycle tracking and reliable offline deployment."
  },
  {
    id: "02",
    title: "Quick Win Data Automation",
    subtitle: "High-Throughput Web Crawling & Pipeline",
    category: "Data Engineering & Python",
    type: "DATA PIPELINE / CRAWLER",
    description: "Architected and optimized Python-based web crawlers for multi-source financial and fund data extraction. Enhanced data integrity, debugged system bottlenecks, and optimized MySQL indexing and storage operations for rapid retrieval.",
    stack: ["Python", "Web Crawlers", "MySQL", "Data Pipelines", "Performance Optimization"],
    visual: "dashboard",
    placeholder: false,
    problem: "Fragmented data sources caused extraction delays and storage bottlenecks across large fund datasets.",
    approach: "Engineered scalable crawlers with fault tolerance and concurrency, coupled with tailored MySQL schema indexing for fast analytical retrieval.",
    outcome: "Significantly boosted data ingestion throughput while ensuring airtight data integrity and zero pipeline downtime."
  },
  {
    id: "03",
    title: "Synovial Fluid Detection",
    subtitle: "Deep Learning Medical Computer Vision",
    category: "Deep Learning & AI",
    type: "COMPUTER VISION / MEDICAL AI",
    description: "Awarded State-Level Recognition and Best Academic Project of the Year by KSCST for Deep Learning-based automatic detection and segmentation of synovial fluid in joint MR images.",
    stack: ["Python", "Deep Learning", "Computer Vision", "Medical Imaging", "MRI"],
    visual: "ai",
    placeholder: false,
    problem: "Manual identification of synovial fluid volume in MRI scans is time-consuming and subject to inter-observer variability in clinical diagnostics.",
    approach: "Trained and evaluated deep neural network architectures to automatically identify, segment, and quantify synovial fluid accumulations with high diagnostic sensitivity.",
    outcome: "Earned State-Level Recognition from KSCST and BLDEA College of Engineering & Technology for Best Project of the Academic Year."
  },
  {
    id: "04",
    title: "Non-Profit Web Platforms",
    subtitle: "Full-Stack Web Development & VPS Deployment",
    category: "Full Stack Web",
    type: "FULL-STACK / INFRASTRUCTURE",
    description: "Developed and deployed full-stack web platforms for non-profit organizations using Django, Python, HTML5, CSS3, and JavaScript on cloud VPS environments, with automated backup workflows.",
    stack: ["Python", "Django", "JavaScript", "HTML/CSS", "Linux VPS", "MySQL"],
    visual: "commerce",
    placeholder: false,
    problem: "Non-profit organizations needed secure, accessible platforms with custom CMS capabilities hosted on cost-effective VPS infrastructure.",
    approach: "Delivered responsive interfaces coupled with robust Django backends, database query optimization, and hardened server deployment.",
    outcome: "Boosted user engagement, streamlined community updates, and established reliable documentation for long-term maintenance."
  }
];

export const careerTimeline = [
  {
    id: "01",
    period: "Jun 2018 – Oct 2021",
    type: "education",
    category: "01 // FOUNDATIONS & ENGINEERING DIPLOMA",
    title: "Diploma in Computer Science & Engineering",
    organization: "Board of Technical Education",
    location: "Vijaypur, Karnataka",
    narrative: "Where the journey into software craftsmanship began. Spent three formative years building rigorous fundamentals in C, data structures, computer architecture, and low-level system logic.",
    credential: {
      type: "Academic Credential",
      code: "BTE-CSE-2021",
      institution: "Board of Technical Education",
      subTitle: "Belagavi Board · Vijaypur",
      status: "Completed",
      highlights: ["C & Logic Design", "Data Structures", "OS Fundamentals"]
    }
  },
  {
    id: "02",
    period: "Nov 2021 – May 2024",
    type: "education",
    category: "02 // UNDERGRADUATE DEGREE",
    title: "B.E. in Computer Science & Engineering",
    organization: "Visvesvaraya Technological University",
    affiliation: "BLDEA's V.P. Dr. P.G. Halakatti College of Eng. & Tech.",
    location: "Vijaypur, Karnataka",
    narrative: "Deepened engineering rigor over four intense years—diving into advanced algorithms, operating systems, distributed architectures, and neural networks. Graduated with honors, recognized with state-level research recognition.",
    credential: {
      type: "University Degree",
      code: "VTU-CSE-2024",
      institution: "Visvesvaraya Tech University",
      subTitle: "BLDEA CET · First Class with Distinction",
      status: "Graduated with Honors",
      highlights: ["Algorithms & Systems", "Database Design", "Deep Learning Research"]
    }
  },
  {
    id: "03",
    period: "May 2024 – Nov 2024",
    type: "experience",
    category: "03 // INDUSTRY INTERNSHIP",
    title: "Python Developer Intern",
    organization: "Pinnacle Technologies Pvt Ltd",
    location: "Thane, Maharashtra",
    narrative: "Bridged academic computer science with production software delivery. Built and deployed full-stack Django platforms, hardened VPS Linux environments, tuned MySQL queries, and collaborated across agile engineering sprints.",
    credential: {
      type: "Professional Role",
      code: "PINNACLE-DEV-2024",
      institution: "Pinnacle Technologies Pvt Ltd",
      subTitle: "Full-Stack & Backend Engineering",
      status: "Completed (6 Months)",
      highlights: ["Python & Django", "Linux VPS Deployment", "MySQL Query Tuning"]
    }
  },
  {
    id: "04",
    period: "Nov 2024 – Present",
    type: "experience",
    category: "04 // PROFESSIONAL EXPERIENCE",
    title: "Software Developer",
    organization: "Seamless Automations Pvt Ltd",
    location: "Thane, Maharashtra",
    narrative: "Stepped up to lead critical system automation initiatives. Engineering lightweight Windows background telemetry agents, multithreaded backend coordination engines, and high-throughput analytical data pipelines.",
    credential: {
      type: "Current Employment",
      code: "Software Developer",
      institution: "Seamless Automations Pvt Ltd",
      subTitle: "Enterprise Systems & Fleet Automation",
      status: "Active Role",
      highlights: ["Windows Endpoint Telemetry", "Flask / Waitress Engines", "Silent Package Deployer"]
    }
  }
];

