import { z } from "zod";
import { contactInquiryTypes } from "@/types/contact";

const safeText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform((value) => value.replace(/[\t\r\n ]+/g, " "));

export const contactRequestSchema = z
  .object({
    name: safeText(2, 80),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    company: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) =>
        value ? value.replace(/[\t\r\n ]+/g, " ") : undefined,
      ),
    inquiryType: z.enum(contactInquiryTypes),
    subject: safeText(3, 140),
    message: z.string().trim().min(20).max(3000),
    consent: z.literal(true),
    website: z.string().max(0),
    startedAt: z.number().int().positive(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (Date.now() - value.startedAt < 3000) {
      ctx.addIssue({
        code: "custom",
        message: "Please take a moment before sending.",
        path: ["startedAt"],
      });
    }
  });

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
