"use client";

import { useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";

export function AiAssistantPanel() {
  const [value, setValue] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = value.trim();
    if (!prompt) return;
    // Prompt is collected for future RIVA AI wire-up; no mock responses.
    setValue("");
  }

  return (
    <aside className="flex h-svh w-[320px] shrink-0 flex-col border-l border-white/[0.06] bg-[#0a0a0b]/95 backdrop-blur-xl">
      <div className="flex h-14 items-center px-5">
        <p className="text-sm font-medium text-white">{uiZh.aiAssistant}</p>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-4 px-4 pb-4">
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6">
          <p className="text-sm text-white/70">{uiZh.noDataYet}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">
            {uiZh.aiPlaceholderExample}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-2">
          <label className="sr-only" htmlFor="aura-ai-input">
            {uiZh.aiTellRiva}
          </label>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
            <Textarea
              id="aura-ai-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`${uiZh.aiTellRiva}\n${uiZh.aiPlaceholderExample}`}
              className="min-h-[88px] resize-none border-0 bg-transparent px-2 py-2 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:ring-0"
            />
            <div className="flex items-center justify-end px-1 pb-1">
              <Button
                type="submit"
                size="icon"
                disabled={!value.trim()}
                className="size-8 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">{uiZh.aiSend}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </aside>
  );
}
