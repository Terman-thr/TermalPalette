import type { ITheme } from "xterm";

export type BuiltInThemeId =
  | "aurora"
  | "daybreak"
  | "midnight"
  | "obsidian"
  | "neon"
  | "canyon";

export type ThemeVariant = "light" | "dark" | "contrast";

export type CustomThemeId = `custom-${string}`;

export type TerminalThemeId = BuiltInThemeId | CustomThemeId;

export type PromptComponentType =
  | "time"
  | "user"
  | "host"
  | "cwd"
  | "fullPath"
  | "git"
  | "emoji"
  | "text";

export type PromptComponentConfig = {
  type: PromptComponentType;
  color: string;
  prefix?: string;
  suffix?: string;
  value?: string;
};

export type TerminalThemeConfig = {
  id: TerminalThemeId;
  label: string;
  variant: ThemeVariant;
  promptComponents: PromptComponentConfig[];
  promptSuffix: string;
  theme: ITheme;
};

export const TERMINAL_THEMES: TerminalThemeConfig[] = [
  {
    id: "aurora",
    label: "Aurora Pastel",
    variant: "light",
    promptComponents: [
      { type: "time", color: "\u001b[38;5;110m", prefix: "[", suffix: "] " },
      { type: "user", color: "\u001b[38;5;48m" },
      { type: "host", color: "\u001b[38;5;213m", prefix: "@", suffix: " " },
      { type: "cwd", color: "\u001b[38;5;33m" },
      { type: "git", color: "\u001b[38;5;214m", prefix: " (", suffix: ")" },
    ],
    promptSuffix: " \u001b[38;5;48m❯\u001b[0m ",
    theme: {
      background: "#f7fafc",
      foreground: "#1f2933",
      cursor: "#1f9d8f",
      black: "#e2e8f0",
      red: "#ff6b6b",
      green: "#10b981",
      yellow: "#f4c15d",
      blue: "#3b82f6",
      magenta: "#c084fc",
      cyan: "#2dd4bf",
      white: "#1f2933",
      brightBlack: "#cbd5f5",
      brightRed: "#dc2626",
      brightGreen: "#059669",
      brightYellow: "#d97706",
      brightBlue: "#1d4ed8",
      brightMagenta: "#a855f7",
      brightCyan: "#0891b2",
      brightWhite: "#0f172a",
    },
  },
  {
    id: "daybreak",
    label: "Daybreak",
    variant: "light",
    promptComponents: [
      { type: "user", color: "\u001b[38;5;25m" },
      { type: "host", color: "\u001b[38;5;172m", prefix: "@", suffix: " " },
      { type: "fullPath", color: "\u001b[38;5;37m" },
      { type: "git", color: "\u001b[38;5;166m", prefix: " (", suffix: ")" },
      { type: "time", color: "\u001b[38;5;105m", prefix: " [", suffix: "]" },
    ],
    promptSuffix: " \u001b[38;5;105m➜\u001b[0m ",
    theme: {
      background: "#fffaf2",
      foreground: "#1f2937",
      cursor: "#f97316",
      black: "#f1f5f9",
      red: "#f87171",
      green: "#22c55e",
      yellow: "#fbbf24",
      blue: "#3b82f6",
      magenta: "#d946ef",
      cyan: "#06b6d4",
      white: "#111827",
      brightBlack: "#e2e8f0",
      brightRed: "#dc2626",
      brightGreen: "#16a34a",
      brightYellow: "#d97706",
      brightBlue: "#1d4ed8",
      brightMagenta: "#a21caf",
      brightCyan: "#0891b2",
      brightWhite: "#0f172a",
    },
  },
  {
    id: "midnight",
    label: "Midnight Wave",
    variant: "dark",
    promptComponents: [
      { type: "time", color: "\u001b[38;5;61m", prefix: "[", suffix: "] " },
      { type: "host", color: "\u001b[38;5;33m", prefix: "@", suffix: ":" },
      { type: "cwd", color: "\u001b[38;5;45m", suffix: " " },
      { type: "fullPath", color: "\u001b[38;5;111m", prefix: "(", suffix: ")" },
      { type: "git", color: "\u001b[38;5;147m", prefix: " <", suffix: ">" },
    ],
    promptSuffix: " \u001b[38;5;111m❯\u001b[0m ",
    theme: {
      background: "#050914",
      foreground: "#d6e6ff",
      cursor: "#60a5fa",
      black: "#0f172a",
      red: "#f87171",
      green: "#34d399",
      yellow: "#facc15",
      blue: "#60a5fa",
      magenta: "#a78bfa",
      cyan: "#22d3ee",
      white: "#e2e8f0",
      brightBlack: "#1e293b",
      brightRed: "#ef4444",
      brightGreen: "#10b981",
      brightYellow: "#eab308",
      brightBlue: "#2563eb",
      brightMagenta: "#8b5cf6",
      brightCyan: "#06b6d4",
      brightWhite: "#f8fafc",
    },
  },
  {
    id: "obsidian",
    label: "Obsidian",
    variant: "dark",
    promptComponents: [
      { type: "user", color: "\u001b[38;5;199m" },
      { type: "host", color: "\u001b[38;5;81m", prefix: "@", suffix: " " },
      { type: "cwd", color: "\u001b[38;5;221m" },
      { type: "git", color: "\u001b[38;5;49m", prefix: " (", suffix: ")" },
      { type: "emoji", color: "\u001b[38;5;213m", value: "⚡", suffix: " " },
    ],
    promptSuffix: " \u001b[38;5;81m$\u001b[0m ",
    theme: {
      background: "#0f1117",
      foreground: "#e5e7eb",
      cursor: "#f97316",
      black: "#1f1f24",
      red: "#ff5f6d",
      green: "#22c55e",
      yellow: "#fbbf24",
      blue: "#3b82f6",
      magenta: "#d946ef",
      cyan: "#06b6d4",
      white: "#f4f4f5",
      brightBlack: "#2d2d36",
      brightRed: "#dc2626",
      brightGreen: "#16a34a",
      brightYellow: "#ca8a04",
      brightBlue: "#2563eb",
      brightMagenta: "#a21caf",
      brightCyan: "#0891b2",
      brightWhite: "#fafafa",
    },
  },
  {
    id: "neon",
    label: "Neon Pop",
    variant: "contrast",
    promptComponents: [
      { type: "emoji", color: "\u001b[38;5;51m", value: "✺ ", suffix: "" },
      { type: "user", color: "\u001b[38;5;214m" },
      { type: "host", color: "\u001b[38;5;45m", prefix: "@", suffix: " " },
      { type: "cwd", color: "\u001b[38;5;51m" },
      { type: "git", color: "\u001b[38;5;198m", prefix: " [", suffix: "]" },
    ],
    promptSuffix: " \u001b[38;5;45m➤\u001b[0m ",
    theme: {
      background: "#050505",
      foreground: "#f8f8ff",
      cursor: "#f472b6",
      black: "#111111",
      red: "#ff3864",
      green: "#53ffa9",
      yellow: "#ffe74c",
      blue: "#4bc0ff",
      magenta: "#f368ff",
      cyan: "#46f0f9",
      white: "#f8f8ff",
      brightBlack: "#2d2d2d",
      brightRed: "#ff1744",
      brightGreen: "#2bd67b",
      brightYellow: "#f4c430",
      brightBlue: "#2196f3",
      brightMagenta: "#d500f9",
      brightCyan: "#00bcd4",
      brightWhite: "#ffffff",
    },
  },
  {
    id: "canyon",
    label: "Canyon Contrast",
    variant: "contrast",
    promptComponents: [
      { type: "time", color: "\u001b[38;5;166m", prefix: "[", suffix: "] " },
      { type: "user", color: "\u001b[38;5;94m" },
      { type: "host", color: "\u001b[38;5;172m", prefix: "@", suffix: " " },
      { type: "cwd", color: "\u001b[38;5;31m" },
      { type: "git", color: "\u001b[38;5;208m", prefix: " {", suffix: "}" },
    ],
    promptSuffix: " \u001b[38;5;31m%\u001b[0m ",
    theme: {
      background: "#fff7ec",
      foreground: "#251605",
      cursor: "#ea580c",
      black: "#f4e3cf",
      red: "#d9480f",
      green: "#2f9e44",
      yellow: "#d97706",
      blue: "#2563eb",
      magenta: "#a21caf",
      cyan: "#0e7490",
      white: "#1c1917",
      brightBlack: "#d1c4b5",
      brightRed: "#b42305",
      brightGreen: "#15803d",
      brightYellow: "#b45309",
      brightBlue: "#1d4ed8",
      brightMagenta: "#86198f",
      brightCyan: "#0f766e",
      brightWhite: "#0f0a05",
    },
  },
];

export const DEFAULT_THEME_ID: TerminalThemeId = TERMINAL_THEMES[0].id;

let customThemes: TerminalThemeConfig[] = [];
let themeMap = new Map<TerminalThemeId, TerminalThemeConfig>();

const buildThemeMap = () => {
  themeMap = new Map(
    [...TERMINAL_THEMES, ...customThemes].map((theme) => [theme.id, theme])
  );
};

buildThemeMap();

export const setCustomThemes = (themes: TerminalThemeConfig[]) => {
  customThemes = themes;
  buildThemeMap();
};

export const getAllThemes = (): TerminalThemeConfig[] => [
  ...TERMINAL_THEMES,
  ...customThemes,
];

export const getThemeById = (
  id: TerminalThemeId | undefined
): TerminalThemeConfig => {
  if (!id) {
    return TERMINAL_THEMES[0];
  }
  return themeMap.get(id) ?? TERMINAL_THEMES[0];
};

export const getThemeIndex = (id: TerminalThemeId | undefined): number => {
  if (!id) {
    return 0;
  }
  const themes = getAllThemes();
  const index = themes.findIndex((theme) => theme.id === id);
  return index === -1 ? 0 : index;
};

export const isThemeId = (value: string): value is TerminalThemeId => {
  return themeMap.has(value as TerminalThemeId);
};
