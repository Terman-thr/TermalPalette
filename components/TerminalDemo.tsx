"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import {
  DEFAULT_THEME_ID,
  TERMINAL_THEMES,
  getThemeById,
  getThemeIndex,
  type PromptComponentConfig,
  type TerminalThemeId,
  type TerminalThemeConfig,
  isThemeId,
} from "./terminalThemes";

class PseudoShell {
  private readonly term: Terminal;
  private input = "";
  private history: string[] = [];
  private historyIndex = 0;
  private themeId: TerminalThemeId;
  private themeIndex: number;
  private disposables: Array<() => void> = [];
  private inVim = false;
  private vimCommandMode = false;
  private vimCommandBuffer = "";
  private readonly promptContext = {
    user: "demo",
    host: "frontend",
    cwd: "~/playground",
    fullPath: "/Users/demo/playground",
    gitBranch: "main",
  };

  constructor(term: Terminal, initialThemeId: TerminalThemeId = DEFAULT_THEME_ID) {
    this.term = term;
    this.themeId = initialThemeId;
    this.themeIndex = getThemeIndex(initialThemeId);
  }

  init() {
    this.setTheme(this.themeId, { silent: true });
    this.term.write("\u001b[H\u001b[2J");
    this.term.writeln(
      "\u001b[38;5;117mWelcome to the browser-based oh-my-zsh demo!\u001b[0m"
    );
    this.term.writeln(
      "Everything runs in React + xterm.js. Type `help` to see what works."
    );
    this.prompt(false);
    const dataListener = this.term.onData((chunk) => this.handleData(chunk));
    const keyListener = this.term.onKey(({ domEvent }) => {
      if (domEvent.key === "Tab") {
        domEvent.preventDefault();
      }
    });
    this.disposables.push(() => dataListener.dispose());
    this.disposables.push(() => keyListener.dispose());
  }

  dispose() {
    this.disposables.forEach((dispose) => dispose());
    this.disposables = [];
  }

  private currentTheme(): TerminalThemeConfig {
    return getThemeById(this.themeId);
  }

  private applyTheme(theme?: TerminalThemeConfig) {
    const next = theme ?? this.currentTheme();
    this.term.options.theme = next.theme;
  }

  private buildPrompt(): string {
    const theme = this.currentTheme();
    const segments = theme.promptComponents
      .map((component) => this.renderComponent(component))
      .join("");
    return `${segments}${theme.promptSuffix}`;
  }

  setTheme(themeId: TerminalThemeId, options?: { silent?: boolean }) {
    const theme = getThemeById(themeId);
    this.themeId = theme.id;
    this.themeIndex = getThemeIndex(theme.id);
    this.applyTheme(theme);
    if (!options?.silent) {
      this.term.writeln(
        `Switched to \u001b[38;5;81m${theme.label}\u001b[0m theme.`
      );
    }
  }

  private renderComponent(component: PromptComponentConfig): string {
    const value = this.getComponentValue(component.type);
    if (!value) {
      return "";
    }
    const prefix = component.prefix ?? "";
    const suffix = component.suffix ?? "";
    return `${prefix}${component.color}${value}\u001b[0m${suffix}`;
  }

  private getComponentValue(type: PromptComponentConfig["type"]): string {
    switch (type) {
      case "user":
        return this.promptContext.user;
      case "host":
        return this.promptContext.host;
      case "cwd":
        return this.promptContext.cwd;
      case "fullPath":
        return this.promptContext.fullPath;
      case "git":
        return this.promptContext.gitBranch;
      case "time": {
        const now = new Date();
        return now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      default:
        return "";
    }
  }

  private prompt(newLine = true) {
    const prefix = newLine ? "\r\n" : "";
    this.term.write(`${prefix}${this.buildPrompt()}`);
  }

  private resetInput() {
    while (this.input.length > 0) {
      this.term.write("\b \b");
      this.input = this.input.slice(0, -1);
    }
  }

  private browseHistory(delta: number) {
    if (this.history.length === 0) {
      return;
    }

    this.historyIndex += delta;
    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    }
    if (this.historyIndex > this.history.length) {
      this.historyIndex = this.history.length;
    }

    const nextInput =
      this.historyIndex === this.history.length
        ? ""
        : this.history[this.historyIndex];

    this.resetInput();
    this.input = nextInput;
    this.term.write(nextInput);
  }

  private handleVimInput(data: string) {
    if (data === "\u0003") {
      this.term.write("^C");
      this.term.write("\r\n");
      this.exitVim();
      return;
    }

    if (data === "\u001b") {
      if (!this.vimCommandMode) {
        this.vimCommandMode = true;
        this.vimCommandBuffer = "";
        this.term.write("\r\n:");
      }
      return;
    }

    if (this.vimCommandMode) {
      if (data === "\u007f") {
        if (this.vimCommandBuffer.length > 0) {
          this.vimCommandBuffer = this.vimCommandBuffer.slice(0, -1);
          this.term.write("\b \b");
        }
        return;
      }
      if (data === "\r") {
        this.term.write("\r\n");
        this.evaluateVimCommand();
        return;
      }
      this.vimCommandBuffer += data;
      this.term.write(data);
      return;
    }

    if (data === "\r") {
      this.term.write("\r\n~");
      return;
    }

    this.term.write(data);
  }

  private evaluateVimCommand() {
    if (this.vimCommandBuffer === "q") {
      this.term.writeln("[Process exited]");
      this.exitVim();
      return;
    }

    this.term.writeln(
      `Not an editor command: ${this.vimCommandBuffer || "(empty)"}`
    );
    this.term.write(":");
    this.vimCommandBuffer = "";
  }

  private exitVim() {
    this.inVim = false;
    this.vimCommandMode = false;
    this.vimCommandBuffer = "";
    this.prompt();
  }

  private launchVim(target: string | undefined) {
    this.term.writeln(
      `Opening \u001b[38;5;81m${target ?? "notes.txt"}\u001b[0m in simulated vim...`
    );
    this.term.writeln("----------------------------------------------");
    this.term.writeln("~   // Browser-based placeholder editor");
    this.term.writeln("~   // Type Esc then :q to leave.");
    this.term.writeln("~");
    this.term.writeln("#include <stdio.h>");
    this.term.writeln("int main(void) {");
    this.term.writeln("    printf(\"hello from the web shell\\n\");");
    this.term.writeln("}");
    this.term.writeln("----------------------------------------------");
    this.inVim = true;
    this.vimCommandMode = false;
    this.vimCommandBuffer = "";
  }

  private cycleTheme() {
    this.themeIndex = (this.themeIndex + 1) % TERMINAL_THEMES.length;
    const nextTheme = TERMINAL_THEMES[this.themeIndex];
    this.setTheme(nextTheme.id, { silent: true });
    this.term.writeln(
      `Switched to \u001b[38;5;81m${nextTheme.label}\u001b[0m theme.`
    );
  }

  private runCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      this.prompt();
      return;
    }

    this.history.push(trimmed);
    this.historyIndex = this.history.length;

    const [binary, ...rest] = trimmed.split(/\s+/);
    switch (binary) {
      case "help":
        this.term.writeln("Available commands:");
        this.term.writeln("  help        Show this list.");
        this.term.writeln("  clear       Clear the terminal viewport.");
        this.term.writeln("  theme       Cycle through accent themes.");
        this.term.writeln("  vim [file]  Open the simulated vim environment.");
        this.term.writeln("  about       Learn what powers this demo.");
        break;
      case "clear":
        this.term.clear();
        this.prompt(false);
        return;
      case "theme":
        if (rest[0]) {
          const desired = rest[0].toLowerCase();
          if (isThemeId(desired)) {
            this.setTheme(desired);
          } else {
            this.term.writeln(`Unknown theme: ${desired}`);
          }
        } else {
          this.cycleTheme();
        }
        break;
      case "vim":
        this.launchVim(rest[0]);
        return;
      case "about":
        this.term.writeln(
          "This terminal is an xterm.js instance styled like oh-my-zsh."
        );
        this.term.writeln(
          "Commands are handled by a lightweight TypeScript shell stub."
        );
        break;
      default:
        this.term.writeln(`zsh: command not found: ${binary}`);
    }
    this.prompt();
  }

  private handleNormalInput(data: string) {
    if (data === "\u0003") {
      this.term.write("^C");
      this.input = "";
      this.prompt();
      return;
    }

    if (data === "\u000c") {
      this.term.clear();
      this.prompt(false);
      return;
    }

    if (data === "\u007f") {
      if (this.input.length > 0) {
        this.input = this.input.slice(0, -1);
        this.term.write("\b \b");
      }
      return;
    }

    if (data === "\r") {
      this.term.write("\r\n");
      this.runCommand(this.input);
      this.input = "";
      return;
    }

    if (data === "\u001b[A") {
      this.browseHistory(-1);
      return;
    }

    if (data === "\u001b[B") {
      this.browseHistory(1);
      return;
    }

    if (data === "\u001b[C" || data === "\u001b[D") {
      return;
    }

    if (data === "\t") {
      this.term.write("\u0007");
      return;
    }

    for (const char of data) {
      if (char >= " " && char <= "~") {
        this.input += char;
        this.term.write(char);
      }
    }
  }

  private handleData(data: string) {
    if (this.inVim) {
      this.handleVimInput(data);
      return;
    }

    this.handleNormalInput(data);
  }
}

export type TerminalDemoProps = {
  themeId: TerminalThemeId;
};

const TerminalDemo = ({ themeId }: TerminalDemoProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<PseudoShell | null>(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const latestThemeIdRef = useRef<TerminalThemeId>(themeId);

  useEffect(() => {
    latestThemeIdRef.current = themeId;
    const shell = shellRef.current;
    if (shell) {
      shell.setTheme(themeId, { silent: true });
    }
  }, [themeId]);

  useEffect(() => {
    const terminal = new Terminal({
      fontFamily: "'Fira Code', 'IBM Plex Mono', monospace",
      fontSize: 15,
      cursorBlink: true,
      allowProposedApi: true,
      rows: 20,
    });

    setTerm(terminal);

    return () => {
      shellRef.current?.dispose();
      shellRef.current = null;
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!term || !container) {
      return undefined;
    }

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    let disposed = false;
    let hasOpened = false;
    let openAttempts = 0;
    let openFrame: number | null = null;
    let fitFrame: number | null = null;
    let resizeObserver: ResizeObserver | undefined;
    let shell: PseudoShell | null = null;

    const scheduleFit = () => {
      if (disposed || !hasOpened) {
        return;
      }
      if (fitFrame !== null) {
        cancelAnimationFrame(fitFrame);
      }
      fitFrame = window.requestAnimationFrame(() => {
        fitFrame = null;
        if (disposed || !term.element) {
          return;
        }
        try {
          fitAddon.fit();
        } catch {
          // ignore fit timing clashes during teardown
        }
      });
    };

    const performOpen = () => {
      openFrame = null;
      if (disposed || hasOpened) {
        return;
      }
      if (!container.isConnected) {
        scheduleOpen();
        return;
      }

      try {
        term.open(container);
        hasOpened = true;
      } catch {
        openAttempts += 1;
        if (openAttempts >= 5) {
          return;
        }
        scheduleOpen();
        return;
      }

      scheduleFit();
      term.focus();

      shell = new PseudoShell(term, latestThemeIdRef.current);
      shellRef.current = shell;
      shell.init();

      window.addEventListener("resize", scheduleFit);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => scheduleFit());
        resizeObserver.observe(container);
      }
    };

    const scheduleOpen = () => {
      if (disposed || hasOpened) {
        return;
      }
      if (openFrame !== null) {
        cancelAnimationFrame(openFrame);
      }
      openFrame = window.requestAnimationFrame(performOpen);
    };

    scheduleOpen();

    return () => {
      disposed = true;
      shell?.dispose();
      shellRef.current = null;
      window.removeEventListener("resize", scheduleFit);
      resizeObserver?.disconnect();
      if (openFrame !== null) {
        cancelAnimationFrame(openFrame);
      }
      if (fitFrame !== null) {
        cancelAnimationFrame(fitFrame);
      }
      fitAddon.dispose();
      term.reset();
    };
  }, [term]);

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-accent/25 bg-[#0b1220]">
      <div className="flex items-center gap-2 border-b border-accent/20 bg-slate-900/80 px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f87171] opacity-80" />
          <span className="h-3 w-3 rounded-full bg-[#facc15] opacity-80" />
          <span className="h-3 w-3 rounded-full bg-[#22d3ee] opacity-80" />
        </div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted">
          demo@frontend — oh-my-zsh
        </p>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  );
};

export default TerminalDemo;
