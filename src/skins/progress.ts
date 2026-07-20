/** Simple progress overlay helpers (DOM ids: work-overlay, work-bar, work-label) */

export function setWorkProgress(ratio: number, label: string) {
  const overlay = document.getElementById("work-overlay");
  const bar = document.getElementById("work-bar");
  const text = document.getElementById("work-label");
  if (!overlay || !bar || !text) return;
  overlay.classList.remove("hidden");
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  bar.style.width = `${pct}%`;
  text.textContent = `${label} · ${pct}%`;
}

export function hideWorkProgress() {
  const overlay = document.getElementById("work-overlay");
  if (overlay) overlay.classList.add("hidden");
}
