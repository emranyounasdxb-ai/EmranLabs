import type { Metadata } from "next";

const VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9._:-]{8,256}$/;

export function normalizeVerificationToken(value: string | undefined) {
  const token = value?.trim();
  if (!token) return undefined;
  return VERIFICATION_TOKEN_PATTERN.test(token) ? token : undefined;
}

export function getSiteVerification(): Metadata["verification"] {
  const google = normalizeVerificationToken(
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  );
  const bing = normalizeVerificationToken(
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  );

  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}
