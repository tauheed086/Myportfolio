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
