export type Dict = {
  appName: string;
  tagline: string;
  state: Record<
    | "idle"
    | "thinking"
    | "tool_call"
    | "editing"
    | "waiting_user"
    | "running_tests"
    | "success"
    | "error",
    string
  >;
  source: Record<"claude-code" | "demo", string>;
  ui: {
    title: string;
    detail: string;
    source: string;
    progress: string;
    language: string;
    alwaysOnTop: string;
    demoPlay: string;
    demoPause: string;
    demoStep: string;
    demoReset: string;
    moreInfo: string;
    hideBubble: string;
    showBubble: string;
    quit: string;
    attention: string;
    noEvent: string;
    host: string;
    hostClaude: string;
    version: string;
    chinese: string;
    english: string;
    skins: string;
    dragHint: string;
    closeInspector: string;
    importImage: string;
    importPixel: string;
    deleteSkin: string;
    deleteSkinHint: string;
    deleteConfirm: string;
    cancel: string;
    dollModeHint: string;
    stageLoad: string;
    stageIsolate: string;
    stageAnalyze: string;
    stageDraw: string;
    stageDone: string;
    deleted: string;
    cannotDeleteBuiltin: string;
    skinBuiltin: string;
    skinCustom: string;
    pixelSize: string;
    pixelColors: string;
    applyPixel: string;
    skinActive: string;
    importOk: string;
    importFail: string;
    pixelOk: string;
    subjectOnly: string;
    quality: string;
    qualityFine: string;
    qualityStandard: string;
    qualityChunky: string;
    pixelWorking: string;
  };
  petMood: Record<
    | "idle"
    | "thinking"
    | "tool_call"
    | "editing"
    | "waiting_user"
    | "running_tests"
    | "success"
    | "error",
    string
  >;
};

export const en: Dict = {
  appName: "PetDeck",
  tagline: "Desktop pet for Claude Code",
  state: {
    idle: "Idle",
    thinking: "Thinking",
    tool_call: "Tool call",
    editing: "Editing",
    waiting_user: "Needs you",
    running_tests: "Testing",
    success: "Success",
    error: "Error",
  },
  source: {
    "claude-code": "Claude Code",
    demo: "Demo",
  },
  ui: {
    title: "Title",
    detail: "Detail",
    source: "Source",
    progress: "Progress",
    language: "Language",
    alwaysOnTop: "Always on top",
    demoPlay: "Play demo",
    demoPause: "Pause demo",
    demoStep: "Step",
    demoReset: "Reset demo",
    moreInfo: "More info…",
    hideBubble: "Hide status bubble",
    showBubble: "Show status bubble",
    quit: "Quit PetDeck",
    attention: "Needs you",
    noEvent: "Play demo or connect Claude Code.",
    host: "Host",
    hostClaude: "Claude Code",
    version: "Version",
    chinese: "中文",
    english: "English",
    skins: "Skins",
    dragHint: "Drag · Right-click · Double-click for more",
    closeInspector: "Back to pet",
    importImage: "Import image as-is…",
    importPixel: "Make pixel doll from image…",
    deleteSkin: "Delete current custom skin",
    deleteSkinHint: "Right-click a custom skin → Delete",
    deleteConfirm: "Delete this skin",
    cancel: "Cancel",
    dollModeHint:
      "Builds a chibi pixel character from the photo’s colors & proportions (not a pixelated photo).",
    stageLoad: "Loading image",
    stageIsolate: "Finding subject (may take a while)",
    stageAnalyze: "Reading colors & proportions",
    stageDraw: "Drawing pixel doll",
    stageDone: "Done",
    deleted: "Custom skin deleted",
    cannotDeleteBuiltin: "Built-in skins cannot be deleted",
    skinBuiltin: "Built-in",
    skinCustom: "Custom",
    pixelSize: "Pixel grid",
    pixelColors: "Colors",
    applyPixel: "Pixelize & save",
    skinActive: "Active",
    importOk: "Skin imported",
    importFail: "Import failed (file too large?)",
    pixelOk: "Pixel skin saved",
    subjectOnly: "Use subject cutout for better colors",
    quality: "Doll detail",
    qualityFine: "Fine",
    qualityStandard: "Standard",
    qualityChunky: "Chunky",
    pixelWorking: "Making pixel doll…",
  },
  petMood: {
    idle: "Ready",
    thinking: "Thinking…",
    tool_call: "Using tools",
    editing: "Editing",
    waiting_user: "Your turn!",
    running_tests: "Testing…",
    success: "Done!",
    error: "Something broke",
  },
};
