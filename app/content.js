// Personalize these records. Empty links are not rendered as working links.
export const profile = {
  name: "Your Name", wordmark: "yourname.dev", role: "Creative web developer",
  email: "", github: "", linkedin: "", resume: "", siteUrl: "https://fullstack-wave-portfolio.seamless-dig-4616.chatgpt.site",
  location: "Location to be added",
  about: "I’m interested in the moment an interface becomes an experience. The little interactions, the unexpected details, and the engineering that makes everything feel effortless.",
  aboutMore: "My toolkit spans React, JavaScript, Python, and the MERN stack. I like moving between design and development: sketching an idea, building a prototype, and refining it until it feels right.",
};
export const projects = [
  { id: "01", slug: "wave-field", title: "Wave field", category: "3D / INTERACTION", description: "A living landscape of geometry. Move your pointer and watch a ripple travel through the surface.", stack: ["Three.js", "JavaScript", "WebGL"], visual: "wave", placeholder: false, liveUrl: "/#lab", githubUrl: "", role: "Design & development", problem: "Create an interactive 3D surface that feels tactile while leaving portfolio content accessible and easy to navigate.", approach: "An instanced grid shares geometry and material. Pointer coordinates are projected onto a plane, and expanding wavefronts change each column’s height and color. The interface remains ordinary, semantic HTML.", outcome: "The working experiment includes adjustable amplitude and speed, wireframe inspection, pause controls, reduced-motion support, and a CSS fallback. Performance measurements will be added after device testing." },
  { id: "02", slug: "interface-study", title: "A considered interface", category: "FRONTEND / PRODUCT", description: "A place for your strongest interface project: the problem, the decisions, and the details that made a difference.", stack: ["React", "CSS", "JavaScript"], visual: "interface", placeholder: true, role: "Add your role", problem: "Add the real user problem and context.", approach: "Explain your contribution, architecture, and design decisions.", outcome: "Add verified results, screenshots, and links." },
  { id: "03", slug: "connected-systems", title: "Behind the experience", category: "FULL STACK / SYSTEMS", description: "A space for an end-to-end application. Show how the interface, API, and data work together.", stack: ["Python", "Node.js", "Database"], visual: "system", placeholder: true, role: "Add your role", problem: "Describe the workflow this project improves.", approach: "Add the data model, API design, and the parts you built.", outcome: "Add measured outcomes and a live demo when available." },
];
export const capabilities = [
  { id: "interfaces", label: "01 / Interfaces", title: "From a blank canvas to a useful product.", text: "Responsive layouts, reusable components, accessible controls, and the small details that make a website feel considered.", tools: ["React", "JavaScript", "HTML & CSS", "Accessibility"], project: "interface-study", evidence: "Interface project slot" },
  { id: "motion", label: "02 / Creative development", title: "A little unexpected. A lot of engineering.", text: "Geometry, shaders, pointer interaction, and real-time animation. Explore the working wave field to see these techniques in action.", tools: ["Three.js", "WebGL", "GLSL", "Animation"], project: "wave-field", evidence: "Explore the wave field" },
  { id: "systems", label: "03 / Connected systems", title: "The thinking behind the interface.", text: "APIs, data models, and server-side workflows that connect an experience to the information it needs.", tools: ["Python", "Node.js", "REST APIs", "Databases"], project: "connected-systems", evidence: "Full-stack project slot" },
];
export const timeline = [
  { type: "Experience", period: "Add dates", title: "Your next chapter goes here", organization: "Role · Organization", description: "Add your responsibilities, contribution, and a specific achievement.", placeholder: true },
  { type: "Education", period: "Add dates", title: "A foundation for what comes next", organization: "Qualification · Institution", description: "Add your education, relevant coursework, or professional training.", placeholder: true },
];
export const achievements = [];
