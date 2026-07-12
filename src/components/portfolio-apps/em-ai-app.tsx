"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Square, Trash2 } from "lucide-react";
import type { EmAiMessage, EmAiResponse } from "@/types/em-ai";
import { EmAiMessageBubble } from "./em-ai-message";
import { PortfolioSectionHeading } from "./portfolio-section-heading";

const prompts = [
  "What does EMRAN LABS build?",
  "Tell me about eDrive.",
  "What technologies are used across the portfolio?",
  "What is the professional product-building direction?",
  "How can I discuss a project with EMRAN LABS?",
];
const limit = 1500;

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as EmAiResponse;
  } catch {
    return {
      ok: false as const,
      code: "INTERNAL_ERROR" as const,
      message: "EM AI returned an unexpected response. Please try again later.",
      requestId: "unavailable",
    };
  }
}

function mapEmAiMessage(data: Extract<EmAiResponse, { ok: false }>) {
  if (data.code === "RATE_LIMITED")
    return "Please wait before trying EM AI again.";
  if (data.code === "AI_UNAVAILABLE")
    return "EM AI is temporarily unavailable. Please use the Contact application for professional inquiries.";
  if (data.code === "AI_BLOCKED")
    return "I cannot help with that request. Please keep questions focused on the EMRAN LABS portfolio.";
  if (data.code === "AI_TIMEOUT")
    return "EM AI timed out. Please try a shorter portfolio-focused question.";
  return data.message;
}

export function EmAiApp() {
  const [messages, setMessages] = useState<EmAiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState(
    "EM AI is ready for portfolio-focused questions.",
  );
  const [pending, setPending] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  useEffect(() => {
    return () => {
      requestSeq.current += 1;
      controller.current?.abort();
    };
  }, []);

  async function send(text = draft) {
    const content = text.trim();
    if (!content || pending) return;
    const next = [...messages, { role: "user" as const, content }].slice(-10);
    setMessages(next);
    setDraft("");
    setPending(true);
    setStatus("EM AI is generating a concise portfolio response.");
    controller.current?.abort();
    const currentSeq = requestSeq.current + 1;
    requestSeq.current = currentSeq;
    controller.current = new AbortController();
    try {
      const response = await fetch("/api/em-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.current.signal,
      });
      const data = await readApiResponse(response);
      if (requestSeq.current !== currentSeq) return;
      if (data.ok) {
        setMessages([...next, { ...data.message, id: data.requestId }]);
        setStatus("EM AI response received.");
      } else {
        setDraft(content);
        setStatus(mapEmAiMessage(data));
      }
    } catch (error) {
      if (requestSeq.current !== currentSeq) return;
      setDraft(content);
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "Request cancelled. Your message was preserved."
          : "Network problem. Your message was preserved.",
      );
    } finally {
      if (requestSeq.current === currentSeq) {
        setPending(false);
        controller.current = null;
      }
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <PortfolioSectionHeading
        eyebrow="Portfolio AI"
        title="EM AI"
        description="Ask a concise question about confirmed EMRAN LABS portfolio content, projects, skills, and professional direction."
      />
      <div className="rounded-2xl border border-[rgba(23,227,192,0.24)] bg-[rgba(23,227,192,0.07)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
        <Bot
          className="mr-2 inline size-4 text-[var(--color-signal)]"
          aria-hidden="true"
        />
        EM AI is an AI-generated portfolio assistant and may be inaccurate. Do
        not submit confidential, personal, financial, medical, legal, or
        security-sensitive information. Serious inquiries should use the Contact
        application.
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void send(prompt)}
            disabled={pending}
            className="rounded-full border border-[var(--glass-border)] bg-white/[0.045] px-3 py-2 text-xs text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] focus-visible:outline-2 focus-visible:outline-[var(--color-signal)] disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[var(--glass-border)] bg-black/10 p-3"
      >
        {messages.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            Conversation history stays in memory only and is cleared when this
            app reloads.
          </p>
        )}
        {messages.map((message, index) => (
          <EmAiMessageBubble
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            message={message}
          />
        ))}
        {pending && (
          <p className="text-sm text-[var(--text-secondary)]">Generating…</p>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="space-y-2"
      >
        <label
          htmlFor="em-ai-composer"
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          Message EM AI
        </label>
        <textarea
          id="em-ai-composer"
          value={draft}
          maxLength={limit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          className="min-h-24 w-full resize-none rounded-2xl border border-[var(--glass-border)] bg-white/[0.045] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(23,227,192,0.55)]"
          aria-describedby="em-ai-status em-ai-count"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            id="em-ai-status"
            className="text-xs text-[var(--text-secondary)]"
            aria-live="polite"
          >
            {status}
          </p>
          <span
            id="em-ai-count"
            className="text-xs text-[var(--text-secondary)]"
          >
            {draft.length}/{limit}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending || draft.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            <Send className="size-4" />
            Send
          </button>
          {pending && (
            <button
              type="button"
              onClick={() => controller.current?.abort()}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm"
            >
              <Square className="size-4" />
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              requestSeq.current += 1;
              controller.current?.abort();
              controller.current = null;
              setPending(false);
              setMessages([]);
              setStatus("Conversation cleared.");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm"
          >
            <Trash2 className="size-4" />
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
