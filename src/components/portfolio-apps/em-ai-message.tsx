import type { EmAiMessage } from "@/types/em-ai";

export function EmAiMessageBubble({ message }: { message: EmAiMessage }) {
  const isUser = message.role === "user";
  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${isUser ? "border-[rgba(23,227,192,0.35)] bg-[rgba(23,227,192,0.12)] text-[var(--text-primary)]" : "border-[var(--glass-border)] bg-white/[0.055] text-[var(--text-secondary)]"}`}
      >
        <span className="mb-1 block text-xs font-semibold tracking-[0.18em] uppercase opacity-75">
          {isUser ? "You" : "EM AI"}
        </span>
        {message.content}
      </div>
    </article>
  );
}
