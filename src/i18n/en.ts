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
    importSprite: string;
    importSpriteImg: string;
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
    spriteWorking: string;
    spriteImportOk: string;
    spriteImportFail: string;
    spriteMappingTitle: string;
    completionMessages: string[];
    workingMessages: string[];
    idleMessages: string[];
    moodTitle: string;
    moodHint: string;
    moodWorking: string;
    moodSuccess: string;
    moodIdle: string;
    moodSave: string;
    moodReset: string;
    moodSaved: string;
    moodResetDone: string;
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
    importPixel: "Create detailed pixel character…",
    importSprite: "Import sprite mod (DyberPet folder)…",
    importSpriteImg: "Generate action skin from image…",
    deleteSkin: "Delete current custom skin",
    deleteSkinHint: "Right-click a custom skin → Delete",
    deleteConfirm: "Delete this skin",
    cancel: "Cancel",
    dollModeHint:
      "Preserves the photo's hairstyle, clothing, pose and silhouette, then applies pixel-art palette, outline and detail treatment.",
    stageLoad: "Loading image",
    stageIsolate: "Finding subject (may take a while)",
    stageAnalyze: "Extracting silhouette & palette",
    stageDraw: "Adding pixel outline & details",
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
    pixelOk: "Detailed pixel character saved",
    subjectOnly: "Detect person and remove background (recommended)",
    quality: "Character detail",
    qualityFine: "Fine",
    qualityStandard: "Standard",
    qualityChunky: "Chunky",
    pixelWorking: "Making pixel doll…",
    spriteWorking: "Building sprite skin…",
    spriteImportOk: "Sprite skin imported",
    spriteImportFail: "No action frames found in that folder",
    spriteMappingTitle: "Map actions to states",
    completionMessages: [
      "Task done ✓ praise me, master?",
      "All done for you~ pat pat",
      "Finished a little project, master's amazing",
      "Master's even better now!",
      "That's a wrap~ time to rest",
      "Round complete, master's the best",
    ],
    workingMessages: [
      "Master, rest up - I'll whip Claude into shape~",
      "Great idea, master - on it!",
      "Leave it to me, master can relax",
      "Work harder, Claude! Master's watching",
      "Guarding master's code...",
      "Whip ready - go Claude go!",
      "Master's wish is my command~",
    ],
    idleMessages: [
      "Master~ I'm right here waiting",
      "Standing by... your call, master",
      "What shall we do, master?",
      "You can poke me, master~",
      "Master worked hard, take a break?",
      "Watching Claude for you, master",
      "Master, master, look at me~",
    ],
    moodTitle: "Mood lines",
    moodHint: "One per line · empty field = use defaults",
    moodWorking: "While working",
    moodSuccess: "On completion",
    moodIdle: "While idle",
    moodSave: "Save",
    moodReset: "Reset to defaults",
    moodSaved: "Saved",
    moodResetDone: "Reset to defaults",
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
