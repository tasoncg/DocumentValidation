"use client";

import { useEffect, useRef } from "react";

interface Props {
  caseId: string;
}

export function AutoPrint({ caseId }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const trigger = () => {
      window.print();
      // Best-effort: tell server we printed.
      fetch(`/api/cases/${caseId}/printed`, { method: "POST" }).catch(() => {});
    };
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(() => setTimeout(trigger, 100));
    } else {
      setTimeout(trigger, 300);
    }
  }, [caseId]);

  return (
    <button
      type="button"
      className="screen-only fixed right-4 top-4 rounded bg-black px-3 py-1 text-sm text-white"
      onClick={() => window.print()}
    >
      In
    </button>
  );
}
