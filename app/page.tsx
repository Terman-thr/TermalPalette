"use client";

import dynamic from "next/dynamic";

import HelpBeacon from "../components/HelpBeacon";
import { ThemeProvider, useThemeStore } from "../components/ThemeContext";

const TerminalTabs = dynamic(() => import("../components/TerminalTabs"), {
  ssr: false,
});

const PageShell = () => {
  const { instructionSections } = useThemeStore();
  return (
    <>
      <main className="flex min-h-screen w-full">
        <div className="mx-auto flex h-full w-full flex-1 flex-col gap-10 px-6 py-10 lg:grid lg:grid-cols-[3fr_1fr] lg:gap-12 lg:px-12 xl:max-w-[1400px]">
          <section className="flex min-h-[48rem] flex-col rounded-3xl border border-white/10 bg-panel/95 p-8 shadow-glow backdrop-blur">
            <header className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                Terminal
              </h1>
            </header>
            <div className="mt-6 flex min-h-0 flex-1">
              <TerminalTabs />
            </div>
          </section>
          <section className="flex min-h-[48rem] flex-col rounded-3xl border border-white/10 bg-panel/90 p-8 shadow-glow backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-100">
                Try these commands
              </h2>
              <ul className="grid gap-3 text-sm text-muted">
                <li>
                  <code className="font-mono text-accent">help</code>
                </li>
                <li>
                  <code className="font-mono text-accent">clear</code>
                </li>
                <li>
                  <code className="font-mono text-accent">vim notes.txt</code>
                </li>
                <li>
                  <code className="font-mono text-accent">theme</code>
                </li>
              </ul>
              <a
                href="https://github.com/Terman-thr/TermalPalette#readme"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-accent/40 bg-slate-900/60 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/20 hover:text-slate-50"
              >
                View GitHub README
              </a>
            </div>
            <div className="mt-auto pt-6 text-xs text-muted/70">
              Best experienced on desktop-sized viewports.
            </div>
          </section>
        </div>
      </main>
      <HelpBeacon instructionSections={instructionSections} />
    </>
  );
};

export default function HomePage() {
  return (
    <ThemeProvider>
      <PageShell />
    </ThemeProvider>
  );
}
