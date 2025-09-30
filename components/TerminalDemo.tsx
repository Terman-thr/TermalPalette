"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import type { ITheme } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

type ThemeConfig = {
  name: string;
  promptUser: string;
  promptHost: string;
  promptPath: string;
  promptSuffix: string;
  theme: ITheme;
};

const themeCycle: ThemeConfig[] = [
  {
    name: "moonlight",
    promptUser: "\u001b[38;5;117m",
    promptHost: "\u001b[38;5;215m",
    promptPath: "\u001b[38;5;81m",
    promptSuffix: "\u001b[38;5;189m%\u001b[0m ",
    theme: {
      background: "#0b1220",
      foreground: "#c0caf5",
      cursor: "#89ddff",
      black: "#15161e",
      red: "#f7768e",
      green: "#9ece6a",
      yellow: "#e0af68",
      blue: "#7aa2f7",
      magenta: "#bb9af7",
      cyan: "#7dcfff",
      white: "#a9b1d6",
      brightBlack: "#414868",
      brightRed: "#f7768e",
      brightGreen: "#9ece6a",
      brightYellow: "#e0af68",
      brightBlue: "#7aa2f7",
      brightMagenta: "#bb9af7",
      brightCyan: "#7dcfff",
      brightWhite: "#c0caf5",
    },
  },
  {
    name: "aurora",
    promptUser: "\u001b[38;5;120m",
    promptHost: "\u001b[38;5;208m",
    promptPath: "\u001b[38;5;49m",
    promptSuffix: "\u001b[38;5;223m%\u001b[0m ",
    theme: {
      background: "#09111c",
      foreground: "#d8f3ff",
      cursor: "#66fbd1",
      black: "#0f172a",
      red: "#fb7185",
      green: "#34d399",
      yellow: "#facc15",
      blue: "#60a5fa",
      magenta: "#a855f7",
      cyan: "#22d3ee",
      white: "#e2e8f0",
      brightBlack: "#1f2937",
      brightRed: "#f43f5e",
      brightGreen: "#10b981",
      brightYellow: "#fbbf24",
      brightBlue: "#3b82f6",
      brightMagenta: "#c084fc",
      brightCyan: "#06b6d4",
      brightWhite: "#f8fafc",
    },
  },
  {
    name: "matrix",
    promptUser: "\u001b[38;5;118m",
    promptHost: "\u001b[38;5;41m",
    promptPath: "\u001b[38;5;48m",
    promptSuffix: "\u001b[38;5;46m$\u001b[0m ",
    theme: {
      background: "#020b06",
      foreground: "#b9fbc0",
      cursor: "#5efc8d",
      black: "#012b0b",
      red: "#ff6f91",
      green: "#69f0ae",
      yellow: "#ffee58",
      blue: "#4dd0e1",
      magenta: "#ce93d8",
      cyan: "#80deea",
      white: "#f4fff8",
      brightBlack: "#1b4332",
      brightRed: "#ff4d6d",
      brightGreen: "#8cffda",
      brightYellow: "#f4ff81",
      brightBlue: "#84ffff",
      brightMagenta: "#da9ff9",
      brightCyan: "#a7ffeb",
      brightWhite: "#ffffff",
    },
  },
];

class PseudoShell {
  private readonly term: Terminal;
  private input = "";
  private history: string[] = [];
  private historyIndex = 0;
  private themeIndex = 0;
  private disposables: Array<() => void> = [];
  private inVim = false;
  private vimCommandMode = false;
  private vimCommandBuffer = "";

  constructor(term: Terminal) {
    this.term = term;
  }

  init() {
    this.applyTheme();
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

  private currentTheme(): ThemeConfig {
    return themeCycle[this.themeIndex];
  }

  private applyTheme() {
    this.term.options.theme = this.currentTheme().theme;
  }

  private buildPrompt(): string {
    const theme = this.currentTheme();
    const git = "\u001b[38;5;171m(main)\u001b[0m";
    return (
      `${theme.promptUser}demo\u001b[0m` +
      `${theme.promptHost}@frontend\u001b[0m ` +
      `${theme.promptPath}~/playground\u001b[0m ` +
      `${git} ` +
      theme.promptSuffix
    );
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
    this.themeIndex = (this.themeIndex + 1) % themeCycle.length;
    this.applyTheme();
    this.term.writeln(
      `Switched to \u001b[38;5;81m${this.currentTheme().name}\u001b[0m theme.`
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
        this.cycleTheme();
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

const TerminalDemo = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<PseudoShell | null>(null);
  const [term, setTerm] = useState<Terminal | null>(null);

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

    let rafId: number | null = null;
    const scheduleFit = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        if (!term.element) {
          return;
        }
        try {
          fitAddon.fit();
        } catch {
          // ignore fit timing clashes during teardown
        }
      });
    };

    term.open(container);
    scheduleFit();
    term.focus();

    const shell = new PseudoShell(term);
    shellRef.current = shell;
    shell.init();

    const handleResize = () => {
      scheduleFit();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => scheduleFit());
      resizeObserver.observe(container);
    }

    return () => {
      shellRef.current?.dispose();
      shellRef.current = null;
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
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
