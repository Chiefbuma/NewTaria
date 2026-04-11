import { NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/auth';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { canManageAssessments, isPatientRole } from '@/lib/role-utils';

export const runtime = 'nodejs';

function safeExtFromFilename(filename: string) {
  const ext = path.extname(filename || '').toLowerCase();
  if (!ext) return '';
  // Avoid weird / long extensions.
  if (!/^\.[a-z0-9]{1,6}$/.test(ext)) return '';
  return ext;
}

export async function POST(req: Request) {
  try {
    const authResult = await authorizeApiRequest();
    if (authResult instanceof NextResponse) return authResult;
    // Allow internal staff who can manage assessments, and allow patients to upload their own self-monitoring attachments.
    if (!isPatientRole(authResult.role) && !canManageAssessments(authResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const form = await req.formData();
    const kind = String(form.get('kind') || '');
    const file = form.get('file');
    // In Node runtimes, `File` may not be a global, so avoid `instanceof File`.
    // We just need something with `arrayBuffer()` plus basic metadata.
    if (!file || typeof file !== 'object' || typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const fileName = typeof (file as any).name === 'string' ? (file as any).name : 'upload';
    const fileType = typeof (file as any).type === 'string' ? (file as any).type : '';
    const fileSize = typeof (file as any).size === 'number' ? (file as any).size : 0;

    const isImage = kind === 'image';
    const isVoice = kind === 'voice';
    if (isImage && !String(fileType).startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }
    if (isVoice && !String(fileType).startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid audio type' }, { status: 400 });
    }

    // Keep uploads small for performance and storage safety.
    // Images: 2MB max. Voice notes: 10MB max.
    const maxBytes = isVoice ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (fileSize > maxBytes) {
      return NextResponse.json({ error: `File too large (max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB)` }, { status: 400 });
    }

    const day = new Date().toISOString().slice(0, 10);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', day);
    await fs.mkdir(uploadsDir, { recursive: true });

    const id = crypto.randomUUID();
    const ext = safeExtFromFilename(fileName) || (isImage ? '.jpg' : isVoice ? '.webm' : '');
    const filename = `${id}${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buf);

    return NextResponse.json({
      url: `/uploads/${day}/${filename}`,
      name: fileName,
      type: fileType,
      size: fileSize,
    });
  } catch (error: any) {
    // Ensure we can see the real root cause in container logs during dev.
    console.error('[api/uploads] failed', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
