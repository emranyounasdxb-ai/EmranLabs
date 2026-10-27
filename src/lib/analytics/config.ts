const gtmIdPattern = /^GTM-[A-Z0-9]+$/;

export type AnalyticsConfig = {
  enabled: boolean;
  containerId: string;
  metaPixelId?: string;
};

export function isValidGoogleTagManagerId(value: string | undefined) {
  return Boolean(value && gtmIdPattern.test(value.trim()));
}

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const containerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();
  if (!isValidGoogleTagManagerId(containerId)) return null;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return {
    enabled: true,
    containerId: containerId as string,
    metaPixelId:
      metaPixelId && /^\d{10,20}$/.test(metaPixelId) ? metaPixelId : undefined,
  };
}
