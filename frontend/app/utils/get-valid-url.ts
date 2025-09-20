export function getValidUrl(url: string) {
  if (!url) return "#"; // Fallback for undefined URLs
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}
