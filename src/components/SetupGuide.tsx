import type { ReactNode } from 'react';

interface Step {
  number: number;
  title: string;
  helper: string;
  done: boolean;
  action?: ReactNode;
}

interface Props {
  steps: Step[];
}

export function SetupGuide({ steps }: Props) {
  return (
    <ol className="grid gap-3">
      {steps.map((step) => (
        <li
          key={step.number}
          className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
            step.done
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-zinc-700 bg-zinc-900/60'
          }`}
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
              step.done ? 'bg-emerald-500 text-black' : 'bg-zinc-700 text-white'
            }`}
            aria-hidden
          >
            {step.done ? '✓' : step.number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white">{step.title}</div>
            <div className="text-sm text-zinc-400">{step.helper}</div>
          </div>
          {step.action && <div className="shrink-0">{step.action}</div>}
        </li>
      ))}
    </ol>
  );
}
