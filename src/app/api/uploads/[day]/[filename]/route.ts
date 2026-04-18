import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  mimeTypeFromFilename,
  resolveLegacyPublicUploadFilePath,
  resolveUploadFilePath,
} from '@/lib/upload-storage';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ day: string; filename: string }> }
) {
  try {
    const { day, filename } = await params;
    const safeDay = String(day || '').trim();
    const safeFilename = path.basename(String(filename || '').trim());
    if (!safeDay || !safeFilename) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
    }

    const candidates = [
      resolveUploadFilePath(safeDay, safeFilename),
      resolveLegacyPublicUploadFilePath(safeDay, safeFilename),
    ];

    let foundPath: string | null = null;
    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        foundPath = candidate;
        break;
      } catch {
        // try next candidate
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = await fs.readFile(foundPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeTypeFromFilename(safeFilename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[api/uploads/:day/:filename] failed', error);
    return NextResponse.json({ error: error?.message || 'Failed to read file' }, { status: 500 });
  }
}
