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

## Deploy to GitHub Pages
1. Export the site: `npm run export`. This writes a static build to `out/`.
2. When deploying to `username.github.io/reponame`, build with `NEXT_PUBLIC_GITHUB_PAGES_PATH=reponame npm run export` so the exported assets are prefixed correctly. For a custom domain (e.g. `haorantang.dev`), omit the variable so the app exports to the root.
3. Publish the contents of `out/` to your GitHub Pages branch (e.g. `gh-pages`) and enable Pages in your repository settings. The build now includes `CNAME` and `.nojekyll`; keep both files in the branch so GitHub serves the `_next/` assets and honours the custom domain.
4. For automation, configure a GitHub Action that sets `NEXT_PUBLIC_GITHUB_PAGES_PATH` only for path-based deployments, runs `npm ci && npm run export`, and pushes the `out/` folder (including `CNAME` and `.nojekyll`) to the Pages branch.

## Project layout
- `app/` – Next.js app router pages and global styles.
- `components/TerminalDemo.tsx` – xterm.js setup and the pseudo shell implementation.
- `package.json` – scripts and dependencies for the demo.

## Next steps
- Swap in a real WASM shell (e.g. `wasm/zig` or `webcontainer`) if you need genuine command execution.
- Extend the pseudo shell command table or integrate with a backend for bespoke workflows.
- Enhance the `vim` mock with richer key handling or integrate a web-based editor component.
