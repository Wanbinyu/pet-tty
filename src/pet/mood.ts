import type { AgentState } from "../events/types";

/** CSS class suffix + face glyph for each agent state */
export const PET_VISUAL: Record<
  AgentState,
  { face: string; bodyClass: string }
> = {
  idle: { face: "·ᴗ·", bodyClass: "pet--idle" },
  thinking: { face: "⊙_⊙", bodyClass: "pet--thinking" },
  tool_call: { face: "✦‿✦", bodyClass: "pet--tool" },
  editing: { face: "⌨ᴗ⌨", bodyClass: "pet--editing" },
  waiting_user: { face: "¡ᴗ¡", bodyClass: "pet--wait" },
  running_tests: { face: "▲_▲", bodyClass: "pet--test" },
  success: { face: "★ᴗ★", bodyClass: "pet--success" },
  error: { face: "x_x", bodyClass: "pet--error" },
};
