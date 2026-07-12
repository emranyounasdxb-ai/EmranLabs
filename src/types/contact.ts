export const contactInquiryTypes = [
  "Product development",
  "AI solution",
  "SaaS or business automation",
  "Web application",
  "Mobile application",
  "Architecture or technical consultation",
  "Partnership or collaboration",
  "Other",
] as const;

export type ContactInquiryType = (typeof contactInquiryTypes)[number];

export type ContactFormValues = {
  name: string;
  email: string;
  company?: string;
  inquiryType: ContactInquiryType;
  subject: string;
  message: string;
  consent: boolean;
  website: string;
  startedAt: number;
};

export type ContactSuccessResponse = {
  ok: true;
  message: string;
  requestId: string;
};
