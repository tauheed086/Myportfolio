// Edit this file to personalize your portfolio. No layout changes needed.
export const profile = {
  name: "Your Name",
  wordmark: "yourname.dev",
  role: "Full-stack developer",
  intro: "I connect thoughtful interfaces with powerful backends. Building for the web with React, Python, and a healthy dose of curiosity.",
  about: "I enjoy the whole picture: the interface you interact with, the logic behind it, and all the small details that make an application feel right.",
  aboutMore: "My toolkit centers on React and Python, with the MERN stack in the mix. I like turning complex problems into simple, useful experiences — and learning something new along the way.",
  email: "", // e.g. hello@yourdomain.com
  github: "", // full URL
  linkedin: "", // full URL
  resume: "", // e.g. /resume.pdf (put the file in public/)
};

export type Project = {
  id: string;
  title: string;
  category: "React" | "Python" | "MERN";
  type: string;
  description: string;
  stack: string[];
  visual: "dashboard" | "terminal" | "commerce";
  placeholder: boolean;
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  problem: string;
  approach: string;
  outcome: string;
};

// These are layout examples, not claims of completed work.
export const projects: Project[] = [
  { id: "01", title: "A thoughtful web experience", category: "React", type: "FRONTEND / INTERFACE", description: "A space for your best React project. Show the experience, the interactions, and the details that made a difference.", stack: ["React", "TypeScript", "CSS"], visual: "dashboard", placeholder: true, problem: "Describe the user problem and who this application is for.", approach: "Explain your role, frontend architecture, and the design decisions behind the experience.", outcome: "Add the finished result, what you learned, and a link to the live project." },
  { id: "02", title: "The engine behind the experience", category: "Python", type: "BACKEND / API", description: "A home for your Python work. Put the architecture, integrations, and problem-solving behind the interface in focus.", stack: ["Python", "REST API", "Database"], visual: "terminal", placeholder: true, problem: "Introduce the workflow or technical challenge your backend solves.", approach: "Walk through the API, data model, integrations, and your most important tradeoffs.", outcome: "Share real results, useful benchmarks, and what you would improve next." },
  { id: "03", title: "Connected, end to end", category: "MERN", type: "FULL-STACK / APPLICATION", description: "Your complete application belongs here. Tell the story from the first database model to the final deployed interface.", stack: ["MongoDB", "Express", "React", "Node.js"], visual: "commerce", placeholder: true, problem: "Explain what you set out to build and why it matters.", approach: "Describe how the client, server, and database work together, and which parts you built.", outcome: "Add screenshots, your project links, and the impact of the finished application." },
];
