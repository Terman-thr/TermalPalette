# cs465 terminal demo

Pure frontend Next.js playground that renders an xterm.js instance styled to mimic an oh-my-zsh terminal. A lightweight TypeScript shell stub handles a handful of commands, including a simulated `vim` experience, without relying on any backend or container runtime.

## Features
- **Next.js + React** app router setup with first-class TypeScript support.
- **xterm.js integration** with responsive fit addon and a macOS-style window chrome.
- **oh-my-zsh inspired prompt** including colourful user/host/path segments and a fake git status.
- **Command handlers** for `help`, `clear`, `theme`, `about`, and a `vim [file]` teaser that demonstrates modal interaction purely in the browser.

> 🚧 This is a demo-only environment: commands are interpreted by JavaScript. There is no real zsh runtime, plugin system, or vim binary bundled.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` to try the terminal. Use `help` inside the terminal to see the available commands and hints.

## Project layout
- `app/` – Next.js app router pages and global styles.
- `components/TerminalDemo.tsx` – xterm.js setup and the pseudo shell implementation.
- `package.json` – scripts and dependencies for the demo.

## Next steps
- Swap in a real WASM shell (e.g. `wasm/zig` or `webcontainer`) if you need genuine command execution.
- Extend the pseudo shell command table or integrate with a backend for bespoke workflows.
- Enhance the `vim` mock with richer key handling or integrate a web-based editor component.
