# Church Stage Monitor v2

An on-stage countdown and screen-mirror app for live church services. Designed
for a Chrome browser cast to a TV via Chromecast, and optionally installed as
a desktop PWA called **GEWCI Stage Monitor**.

The screen has three regions:

- **Top half** — a mirror of any monitor, window, or browser tab the operator
  picks (uses `getDisplayMedia()`).
- **Bottom-left** — a large clock with the current time. Red text on a
  configurable background.
- **Bottom-right** — a countdown timer that runs by duration or to a wall-clock
  target time. Goes green → yellow (≤10 min) → red (≤5 min) → red OVERTIME.

## Run locally

Requirements: Node 20+ and npm.

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`) in **Google Chrome**.
Screen sharing requires a Chromium-based browser.

## Build for production

```bash
npm run build
npm run preview     # optional: preview the production build locally
```

Output is a static site in `dist/`.

## Use during a service

1. Click **Select Screen** and pick the monitor, window, or browser tab to
   mirror.
2. Pick **Duration** or **Until clock time** and type `HH:MM` (for example
   `00:25` for 25 minutes, or `11:30` to count down until 11:30 today).
3. Click **Start**. Controls hide automatically (Service Mode).
4. Click **Enter Fullscreen**.
5. In Chrome's `⋮` menu choose **Cast…** and pick your TV / Chromecast.

### Keyboard shortcuts

| Key      | Action                                    |
| -------- | ----------------------------------------- |
| `Esc`    | Show controls (when in Service Mode)      |
| `Space`  | Pause / Resume the countdown              |
| `R`      | Reset (only when controls are visible)    |

There is also a `×` / "Show Controls" button in the corner during Service Mode
for non-keyboard users.

### What's saved between sessions

Settings are persisted in `localStorage` so the church computer remembers them
across refreshes:

- timer mode (Duration vs Until clock time)
- last duration HH:MM
- last target HH:MM
- current-time background color
- countdown background color
- 12-hour vs 24-hour clock preference

The countdown itself is **not** persisted — a refresh returns the timer to
idle so you never accidentally start at zero.

## Install as a desktop app (Chrome PWA)

Once deployed:

1. Open the deployed URL in Chrome on the church computer.
2. Click the install icon in the address bar, or `⋮ → Install GEWCI Stage Monitor…`.
3. Chrome creates a desktop shortcut that opens the app in a chrome-less
   window.

The PWA caches the static shell so it keeps working through brief network
hiccups.

## Deploy

The default `npm run build` output in `dist/` deploys cleanly to all of these.
Config files for each are committed in the repo.

### Vercel

Import the repo. Vercel auto-detects Vite. `vercel.json` ships an SPA fallback
rewrite.

### Netlify

Import the repo. `netlify.toml` ships build command, publish dir, and SPA
redirect.

### Cloudflare Pages

Connect the repo, framework preset = **Vite**, build command = `npm run build`,
output directory = `dist`. `public/_redirects` ships an SPA fallback.

### GitHub Pages

The repo includes `.github/workflows/deploy.yml` which:

- runs `npm ci && npm run build` on every push to `main`,
- exports `VITE_BASE=/<repo>/` so the bundle resolves assets correctly when
  served from a project subpath,
- deploys via `actions/deploy-pages@v4`.

To deploy locally to a subpath instead:

```bash
VITE_BASE="/church-stage-monitor/" npm run build
```

## Project structure

```
src/
  App.tsx                       # top-level state + composition
  main.tsx
  index.css
  types.ts                      # TimerMode, TimerStatus, PersistedSettings
  components/
    StageLayout.tsx             # 16:9 frame + corner × / Show Controls
    ScreenMirror.tsx            # <video> + placeholder
    CurrentTimePanel.tsx        # red digits, configurable background
    CountdownPanel.tsx          # green/yellow/red thresholds + OVERTIME
    ConfigPanel.tsx             # form + buttons + setup guide
    SetupGuide.tsx              # numbered 5-step volunteer checklist
    KeyboardShortcuts.tsx       # legend pinned in the config panel
  hooks/
    useCurrentTime.ts
    useCountdown.ts             # owns target timestamp, pause math
    useScreenCapture.ts         # getDisplayMedia + cancel/end handling
    useFullscreen.ts            # Fullscreen API wrapper
    useKeyboardShortcuts.ts     # Esc / Space / R policy
    useLocalStorage.ts          # JSON persistence
  lib/
    time.ts                     # parseHHMM, formatDuration, computeTargetFromClock
    palette.ts                  # color swatches and threshold colors
public/
  icon-192.png                  # PWA icons (run `npm run icons` to regenerate from assets/icon.svg)
  icon-512.png
  icon-maskable-512.png
  apple-touch-icon.png
  favicon.svg
```

## Browser limitations to know about

- Screen sharing requires a user click — the browser will not let JavaScript
  start `getDisplayMedia()` automatically. The "Select Screen" button is the
  only way in.
- Browsers do not expose Chromecast control to web pages, so casting is a
  manual step (Chrome `⋮` menu → Cast…).
- If you click "Stop sharing" in the browser's native screen-share bar, the
  app notices and clears the mirrored video back to the placeholder.

## License

MIT
