export function navigationWidth(progress, compact, expanded) {
  const p = Math.max(0, Math.min(1, progress));
  // Zero slope at both ends and the midpoint: no jump on direction reversal.
  return compact + (expanded - compact) * Math.sin(Math.PI * p) ** 2;
}

export function visibleSection(sections, scrollY, viewportHeight) {
  const readingLine = scrollY + viewportHeight * 0.3;
  let active = null;
  for (const section of sections) {
    if (section.top <= readingLine) active = section.id;
  }
  return active;
}
