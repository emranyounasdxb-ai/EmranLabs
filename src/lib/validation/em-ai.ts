import { z } from "zod";

export const EM_AI_MESSAGE_MAX = 1500;
export const EM_AI_TOTAL_MAX = 6000;
export const EM_AI_MAX_MESSAGES = 10;

export const emAiRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(EM_AI_MESSAGE_MAX),
          })
          .strict(),
      )
      .min(1)
      .max(EM_AI_MAX_MESSAGES),
  })
  .strict()
  .superRefine((value, ctx) => {
    const total = value.messages.reduce(
      (sum, item) => sum + item.content.length,
      0,
    );
    const last = value.messages.at(-1);
    if (total > EM_AI_TOTAL_MAX)
      ctx.addIssue({
        code: "custom",
        message: "Conversation is too long.",
        path: ["messages"],
      });
    if (last?.role !== "user")
      ctx.addIssue({
        code: "custom",
        message: "Latest message must be from the user.",
        path: ["messages"],
      });
  });

export type EmAiRequestInput = z.infer<typeof emAiRequestSchema>;
