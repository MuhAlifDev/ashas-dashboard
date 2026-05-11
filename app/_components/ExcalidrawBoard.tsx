"use client";

import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Drawing } from "../_lib/types";

// Dynamic import — Excalidraw uses browser APIs, cannot run on server
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-gray/20 border-t-ashas-blue" />
          <p className="text-sm font-bold text-slate-gray">Memuat whiteboard…</p>
        </div>
      </div>
    ),
  },
);

type Props = {
  drawing: Drawing;
  onSave: (data: Record<string, unknown>) => void;
};

export default function ExcalidrawBoard({ drawing, onSave }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse initial data from stored JSON
  const initialData: ExcalidrawInitialDataState | undefined = (() => {
    try {
      const d = drawing.data as { elements?: unknown[]; appState?: Record<string, unknown>; files?: Record<string, unknown> };
      if (!d || !d.elements) return undefined;
      return {
        elements: d.elements,
        appState: {
          ...(d.appState ?? {}),
          collaborators: new Map(),
        },
        files: d.files ?? {},
      } as ExcalidrawInitialDataState;
    } catch {
      return undefined;
    }
  })();

  function handleChange(
    elements: readonly unknown[],
    appState: Record<string, unknown>,
    files: Record<string, unknown>,
  ) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { collaborators: _c, ...safeState } = appState as { collaborators?: unknown; [k: string]: unknown };
      void _c;
      onSave({ elements: [...elements], appState: safeState, files });
    }, 1500);
  }

  if (!mounted) return null;

  return (
    <div className="h-full w-full">
      <Excalidraw
        key={drawing.id}
        initialData={initialData}
        onChange={(elements, appState, files) => handleChange(elements, appState, files as Record<string, unknown>)}
        theme="light"
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
          },
        }}
      />
    </div>
  );
}
