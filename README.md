# cs465 terminal workspace

A browser-based playground that mimics an oh-my-zsh terminal using Next.js, React, and xterm.js. Everything runs locally in the browser, so you can experiment with colorful prompts, quick commands, and export the palette as a reusable oh-my-zsh theme.


## Exporting a theme to oh-my-zsh

Use the "Export theme for oh-my-zsh" button in the sidebar to download the currently selected theme as a `.zsh-theme` file. Then follow the steps below to apply it to your real shell. The process is shared by macOS and most Linux distributions; whenever there is a small difference you'll see it noted explicitly.

### 1. Verify that oh-my-zsh is installed
1. Confirm `zsh` is available:

   ```bash
   zsh --version
   ```

2. Check that oh-my-zsh owns your shell:

   ```bash
   echo $ZSH
   omz --version
   ```

   If either command reports the oh-my-zsh directory (typically `~/.oh-my-zsh`) or prints a version, you are good to go. Otherwise install oh-my-zsh via the instructions at [ohmyz.sh](https://ohmyz.sh/#install) before continuing.

### 2. Locate the exported file
1. Export a theme from the browser UI (e.g. `aurora.zsh-theme`). Your browser saves it in the default downloads folder.
2. (Optional) Inspect the file to see the generated prompt and color palette:

   ```bash
   head ~/Downloads/aurora.zsh-theme
   ```

### 3. Move the theme into oh-my-zsh's custom directory
1. Make sure the directory exists:

   ```bash
   mkdir -p ~/.oh-my-zsh/custom/themes
   ```

2. Move or copy the downloaded file:

   ```bash
   mv ~/Downloads/aurora.zsh-theme ~/.oh-my-zsh/custom/themes/
   ```

3. Finder vs Nautilus: on macOS you can run `open ~/.oh-my-zsh`, while on Linux you can run `xdg-open ~/.oh-my-zsh` to open the folder graphically. The remaining steps are identical afterward.
4. Confirm the theme is present:

   ```bash
   ls ~/.oh-my-zsh/custom/themes | grep aurora
   ```

### 4. Activate the theme via `~/.zshrc`
1. Open `~/.zshrc` in your editor of choice:

   ```bash
   nano ~/.zshrc
   # or: code ~/.zshrc, vim ~/.zshrc, etc.
   ```

2. Update the `ZSH_THEME` line with the filename **without** the `.zsh-theme` extension:

   ```bash
   ZSH_THEME="aurora"
   ```

   If you keep custom files outside `~/.oh-my-zsh/custom`, set `ZSH_CUSTOM` earlier in the file so oh-my-zsh knows where to search.

### 5. Apply and test the prompt
1. Reload your shell configuration or open a new terminal window:

   ```bash
   source ~/.zshrc
   ```

2. Run a few commands (`ls`, `git status`, etc.) to confirm the colors, git badge, and prompt symbols match what you exported. The generated file already enables `prompt_subst` and adds git prompt decorations, so no extra plugins are required beyond oh-my-zsh's default `git` plugin.
3. Troubleshooting:
   - If the prompt reverts to the default, ensure the filename in `~/.zshrc` exactly matches the file you copied into `custom/themes`.
   - If git information is missing, double-check that the `git` plugin appears inside the `plugins=(...)` array in `~/.zshrc`.
   - You can restore your old prompt by editing `ZSH_THEME` back to the previous value and sourcing the file again.

Enjoy recreating the terminal experience from this workspace inside your real shell!

## Design your own prompt

Select any terminal tab and click **Customize theme** to open the editor overlay. It starts with the currently active theme and lets you:

1. Add, remove, or reorder prompt components (user, host, current directory, full path, git branch, time, freeform text, or emoji).
2. Set individual prefixes/suffixes and pick colors for every component using the built-in palette picker.
3. Choose a prompt-ending symbol (including emoji) and tweak the terminal background/foreground/cursor colors used in the preview.

Save your edits to add the new theme to the selection list instantly. The terminal switches to it right away, and you can export it as an oh-my-zsh theme just like the built-in presets.
