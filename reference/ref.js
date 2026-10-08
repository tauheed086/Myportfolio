console.clear();

const leftLeaves = document.querySelectorAll('[href="#leftLeave"]');
const rightLeaves = document.querySelectorAll('[href="#rightLeave"]');
const smallLeaves = document.querySelectorAll('[href="#smallLeaf"]');
const text = document.querySelector('.text');
const letters = document.querySelectorAll('.text path');
leftLeaves.forEach((leaf, i) => {
  const index = i / (leftLeaves.length - 1);
  gsap.set(leaf, {
    rotate: index * -45 + 10,
    transformOrigin: 'right bottom'
  });
  gsap.to(leaf, {
    scrollTrigger: {
      trigger: "body",
      scrub: 0.2,
      start: `${index * 40}% top`,
      end: `${index * 60 + 40}% bottom`,
    },
    x: 150,
    y: 300,
    rotate: 15 - (Math.sin(index * Math.PI / 2 - (Math.PI / 2)) * 10),
    scale: 1.3
  });
});
rightLeaves.forEach((leaf, i) => {
  const index = i / (rightLeaves.length - 1);
  gsap.set(leaf, {
    rotate: index * 45 - 10,
    transformOrigin: 'left bottom'
  });
  gsap.to(leaf, {
    scrollTrigger: {
      trigger: "body",
      scrub: 0.2,
      start: `${index * 40}% top`,
      end: `${index * 60 + 40}% bottom`,
    },
    x: -150,
    y: 300,
    rotate: -15 + (Math.sin(index * Math.PI / 2 - (Math.PI / 2)) * 10),
    scale: 1.3
  });
});

smallLeaves.forEach((leaf, i) => {
  gsap.set(leaf, {
    y: Math.random() * 900,
    x: Math.random() * 1000,
    scale: Math.random() * 0.5 + 0.2,
    transformOrigin: '50% 50%'
  });
  const start = Math.random() * 40 + 40;
  const end = Math.min(100, start + Math.random() * 50);
  gsap.to(leaf, {
    scrollTrigger: {
      trigger: "body",
      scrub: 0.2,
      start: `top top`,
      end: `bottom bottom`
    },
    scale: Math.random() * 0.5 + 0.2,
    x: Math.random() * 1600,
    y: Math.random() * 900,
    rotate: Math.random() * 1000 + 360
  });
});

letters.forEach((letter, i) => {
  gsap.from(letter, {
    scrollTrigger: {
      trigger: "body",
      scrub: 0.2,
      start: `${(i / (letters.length - 1)) * 50 + 30}% bottom`,
      end: `${(i / (letters.length - 1)) * 50 + 50}% bottom`
    },
    opacity: 0,
    y: '+=100',
    rotate: 180,
    scale: 2,
    transformOrigin: '50% 50%'
  });
});

// Hack to hide the render of the SVG
requestAnimationFrame(() => {
  document.querySelector('svg').style.opacity = 1;
});