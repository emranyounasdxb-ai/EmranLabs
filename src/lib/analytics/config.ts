const gtmIdPattern = /^GTM-[A-Z0-9]+$/;

export type AnalyticsConfig = {
  enabled: boolean;
  containerId: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  linkedInLeadConversionId?: string;
  clarityProjectId?: string;
};

export function isValidGoogleTagManagerId(value: string | undefined) {
  return Boolean(value && gtmIdPattern.test(value.trim()));
}

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const containerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const linkedInPartnerId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID?.trim();
  const linkedInLeadConversionId =
    process.env.NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID?.trim();
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  const clarity =
    clarityProjectId && /^[a-z0-9]{6,20}$/.test(clarityProjectId)
      ? clarityProjectId
      : undefined;
  const google = isValidGoogleTagManagerId(containerId) ? containerId! : "";
  const meta =
    metaPixelId && /^\d{10,20}$/.test(metaPixelId) ? metaPixelId : undefined;
  const linkedin =
    linkedInPartnerId && /^[1-9]\d{0,14}$/.test(linkedInPartnerId)
      ? linkedInPartnerId
      : undefined;
  if (!google && !meta && !linkedin && !clarity) return null;
  return {
    enabled: true,
    containerId: google,
    metaPixelId: meta,
    clarityProjectId: clarity,
    linkedInPartnerId: linkedin,
    linkedInLeadConversionId:
      linkedin &&
      linkedInLeadConversionId &&
      /^[1-9]\d{0,14}$/.test(linkedInLeadConversionId)
        ? linkedInLeadConversionId
        : undefined,
  };
}
