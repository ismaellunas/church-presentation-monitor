interface Shortcut {
  keys: string;
  label: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: 'Space', label: 'Pause / Resume' },
  { keys: 'R', label: 'Reset (controls only)' },
  { keys: 'Esc', label: 'Show Controls' },
];

export function KeyboardShortcuts() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
      <span className="font-semibold text-zinc-300">Keyboard:</span>
      {SHORTCUTS.map((s) => (
        <span key={s.keys} className="flex items-center gap-2">
          <kbd className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-200">
            {s.keys}
          </kbd>
          <span>{s.label}</span>
        </span>
      ))}
    </div>
  );
}
