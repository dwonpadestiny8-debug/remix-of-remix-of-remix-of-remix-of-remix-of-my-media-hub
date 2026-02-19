const DRIVE_API_KEY = "AIzaSyAA9ERw-9LZVEohRYtCWka_TQc6oXmvcVU";

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  // Match /file/d/{ID}/ or id={ID} or just a raw ID
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/^([a-zA-Z0-9_-]{20,})$/);
  return match ? match[1] : null;
}

export function getDriveEmbedUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  return url; // fallback: use as-is
}

export function getDriveDownloadUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (fileId) return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${DRIVE_API_KEY}&supportsAllDrives=True`;
  return url;
}
