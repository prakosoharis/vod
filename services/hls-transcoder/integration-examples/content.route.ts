/**
 * Content Upload API Route with HLS Transcoding
 *
 * Drop this into: apps/backend/src/routes/content.route.ts
 * Or integrate the upload handler into your existing route
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { transcoderService } from '../services/transcoder.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// Multer Configuration for Video Upload
// ============================================================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'video/x-matroska', 'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files allowed.'));
    }
  }
});

// ============================================================================
// POST /api/content/upload-with-transcoding
// ============================================================================

router.post('/upload-with-transcoding', upload.single('video'), async (req: Request, res: Response) => {
  let uploadedFilePath: string | null = null;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file uploaded'
      });
    }

    uploadedFilePath = req.file.path;

    // Extract metadata from request
    const {
      title,
      description,
      genre,
      year,
      type = 'MOVIE',
      thumbnail_url
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Step 1: Create content record with pending status
    const content = await prisma.content.create({
      data: {
        title,
        description: description || null,
        genre: genre ? genre.split(',').map((g: string) => g.trim()) : [],
        year: year ? parseInt(year) : null,
        type,
        thumbnail_url: thumbnail_url || null,
        transcoding_status: 'processing',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Step 2: Send immediate response
    res.status(202).json({
      success: true,
      message: 'Video upload received. Transcoding in progress...',
      data: {
        contentId: content.id,
        title: content.title,
        status: 'processing'
      }
    });

    // Step 3: Transcode asynchronously (don't await in request)
    transcodeVideoAsync(content.id, uploadedFilePath, req.file.originalname)
      .catch(error => {
        console.error(`[Content ${content.id}] Transcoding failed:`, error);
      });

  } catch (error: any) {
    console.error('Upload error:', error);

    // Cleanup uploaded file on error
    if (uploadedFilePath) {
      await fs.remove(uploadedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process upload',
      message: error.message
    });
  }
});

// ============================================================================
// Async Transcoding Function (runs in background)
// ============================================================================

async function transcodeVideoAsync(
  contentId: number,
  filePath: string,
  originalFilename: string
) {
  try {
    console.log(`[Content ${contentId}] Starting transcoding...`);

    // Update status
    await prisma.content.update({
      where: { id: contentId },
      data: { transcoding_status: 'processing' }
    });

    // Call transcoder service
    const result = await transcoderService.transcodeVideo(filePath, originalFilename);

    console.log(`[Content ${contentId}] Transcoding completed:`, result);

    // Update content with HLS URLs
    await prisma.content.update({
      where: { id: contentId },
      data: {
        hls_video_id: result.videoId,
        hls_url: result.hlsUrl,
        hls_cdn_url: result.cdnUrl,
        transcoding_status: 'completed',
        transcoded_at: new Date()
      }
    });

    // Cleanup original file after successful transcode
    await fs.remove(filePath);

    console.log(`[Content ${contentId}] ✅ Transcoding pipeline completed`);

  } catch (error: any) {
    console.error(`[Content ${contentId}] ❌ Transcoding failed:`, error);

    // Update status to failed
    await prisma.content.update({
      where: { id: contentId },
      data: {
        transcoding_status: 'failed'
      }
    }).catch(() => {});

    // Don't delete file on failure (for retry/debugging)
  }
}

// ============================================================================
// GET /api/content/:id/transcoding-status
// ============================================================================

router.get('/:id/transcoding-status', async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: {
        id: true,
        title: true,
        transcoding_status: true,
        hls_url: true,
        hls_cdn_url: true,
        transcoded_at: true
      }
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status',
      message: error.message
    });
  }
});

// ============================================================================
// POST /api/content/:id/retry-transcoding
// ============================================================================

router.post('/:id/retry-transcoding', async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);

    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    if (!content.video_url) {
      return res.status(400).json({
        success: false,
        error: 'No original video file available for retry'
      });
    }

    // Reset status
    await prisma.content.update({
      where: { id: contentId },
      data: { transcoding_status: 'processing' }
    });

    // Retry transcoding
    transcodeVideoAsync(contentId, content.video_url, content.title)
      .catch(error => {
        console.error(`[Content ${contentId}] Retry failed:`, error);
      });

    res.json({
      success: true,
      message: 'Transcoding retry initiated'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retry transcoding',
      message: error.message
    });
  }
});

export default router;
