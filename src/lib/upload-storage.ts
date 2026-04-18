import path from 'path';

export function resolveUploadRootDir() {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
  }

  return path.resolve(process.cwd(), 'storage', 'uploads');
}

export function resolveUploadDayDir(day: string) {
  return path.join(resolveUploadRootDir(), day);
}

export function resolveUploadFilePath(day: string, filename: string) {
  return path.join(resolveUploadDayDir(day), filename);
}

export function resolveLegacyPublicUploadFilePath(day: string, filename: string) {
  return path.resolve(process.cwd(), 'public', 'uploads', day, filename);
}

export function resolveUploadUrl(day: string, filename: string) {
  return `/uploads/${day}/${filename}`;
}

export function mimeTypeFromFilename(filename: string) {
  const ext = path.extname(filename || '').toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.aac':
      return 'audio/aac';
    case '.m4a':
      return 'audio/mp4';
    case '.ogg':
      return 'audio/ogg';
    case '.webm':
      return 'audio/webm';
    default:
      return 'application/octet-stream';
  }
}
