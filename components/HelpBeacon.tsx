"use client";

import { useMemo, useRef, useState } from "react";

import type { InstructionSection } from "./helpTypes";

const tutorialSteps = [
  "Open a terminal tab and explore the builtin commands.",
  "Use Customize theme to rearrange segments or pick new colors.",
  "Export the theme to a .zsh-theme file once you're happy.",
];

const faqs = [
  {
    question: "Where is my exported file?",
    answer: "It lands in your browser's default downloads folder as <theme>.zsh-theme.",
  },
  {
    question: "How do I apply the theme?",
    answer: "Move the file to ~/.oh-my-zsh/custom/themes/, set ZSH_THEME to that filename, then run source ~/.zshrc.",
  },
  {
    question: "Can I revert my changes?",
    answer: "Switch back to any built-in theme from the sidebar or reopen the editor to tweak your custom one.",
  },
];

type HelpBeaconProps = {
  instructionSections?: InstructionSection[];
};

const HelpBeacon = ({ instructionSections }: HelpBeaconProps) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);
  const panelId = useMemo(() => `help-panel-${Math.random().toString(36).slice(2)}`, []);
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleCopy = (command: string) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopied(command);
        timeoutRef.current = window.setTimeout(() => {
          setCopied(null);
          timeoutRef.current = null;
        }, 2000);
      })
      .catch(() => {
        setCopied(null);
      });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open workspace guide"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-slate-900/80 text-xl font-semibold text-accent shadow-lg transition hover:bg-accent/20"
      >
        ?
      </button>
      {open ? (
        <section
          id={panelId}
          className="fixed bottom-20 right-4 z-40 max-h-[80vh] w-80 overflow-y-auto rounded-2xl border border-accent/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl"
        >
          <header className="flex items-center justify-between">
            <p className="text-base font-semibold">Quick guide</p>
            <button
              type="button"
              onClick={toggle}
              aria-label="Close workspace guide"
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-muted transition hover:border-white/30"
            >
              Close
            </button>
          </header>
          <div className="mt-3 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Tutorial</p>
            <ol className="space-y-1 text-slate-200">
              {tutorialSteps.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold text-accent">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">FAQs</p>
            <dl className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-accent">{faq.question}</dt>
                  <dd className="text-slate-300">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
          {instructionSections?.length ? (
            <details className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Custom theme instructions
              </summary>
              <div className="mt-3 space-y-3 text-left">
                {instructionSections.map((section) => (
                  <div key={section.title} className="rounded-xl border border-white/5 bg-black/30 p-2">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
                      {section.title}
                    </p>
                    {section.description ? (
                      <p className="mt-1 text-[0.7rem] text-slate-200">
                        {section.description}
                      </p>
                    ) : null}
                    <ul className="mt-2 space-y-2">
                      {section.items.map((item, index) =>
                        item.kind === "text" ? (
                          <li key={`${section.title}-text-${index}`} className="text-[0.7rem] text-slate-300">
                            {item.content}
                          </li>
                        ) : (
                          <li
                            key={`${section.title}-cmd-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-slate-950/70 px-2 py-1"
                          >
                            <code className="flex-1 truncate text-[0.65rem] text-slate-100">
                              {item.content}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.content)}
                              className="rounded-md border border-white/20 px-2 py-1 text-[0.6rem] font-semibold text-slate-100 transition hover:border-accent"
                            >
                              {copied === item.content ? "Copied!" : "Copy"}
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </>
  );
};

export default HelpBeacon;
