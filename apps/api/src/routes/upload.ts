import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Allowed file types
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_TYPES = ['thumbnail', 'backdrop', 'avatar', 'logo', 'broadcast'] as const;
const UPLOAD_SUBDIRS: Record<(typeof UPLOAD_TYPES)[number], string> = {
  thumbnail: 'thumbnails',
  backdrop: 'backdrops',
  avatar: 'avatars',
  logo: 'logos',
  broadcast: 'broadcasts',
};

// Validation schemas
const uploadSchema = z.object({
  type: z.enum(UPLOAD_TYPES),
});

interface UploadQuery {
  type: (typeof UPLOAD_TYPES)[number];
}

export async function uploadRoutes(fastify: FastifyInstance) {
  const uploadRoot = process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads');

  // Ensure upload directories exist
  const ensureDirectories = async () => {
    await fs.mkdir(uploadRoot, { recursive: true });
    for (const subdir of Object.values(UPLOAD_SUBDIRS)) {
      await fs.mkdir(path.join(uploadRoot, subdir), { recursive: true });
    }
  };

  // Initialize directories on startup
  ensureDirectories();

  // Upload endpoint
  fastify.post('/upload', async (request: FastifyRequest<{ Querystring: UploadQuery }>, reply: FastifyReply) => {
    try {
      const { type } = uploadSchema.parse(request.query);

      const data = await request.file();

      if (!data) {
        return reply.code(400).send({
          error: {
            message: 'No file uploaded',
            statusCode: 400,
          },
        });
      }

      // Validate file type
      if (!Object.keys(ALLOWED_IMAGE_TYPES).includes(data.mimetype)) {
        return reply.code(400).send({
          error: {
            message: `Invalid file type. Allowed types: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}`,
            statusCode: 400,
          },
        });
      }

      // Validate file size
      if (data.file.bytesRead > MAX_FILE_SIZE) {
        return reply.code(400).send({
          error: {
            message: 'File too large. Maximum size is 10MB',
            statusCode: 400,
          },
        });
      }

      // Generate unique filename
      const fileExtension = ALLOWED_IMAGE_TYPES[data.mimetype as keyof typeof ALLOWED_IMAGE_TYPES][0];
      const filename = `${uuidv4()}${fileExtension}`;

      // Determine upload path based on type
      const subdir = UPLOAD_SUBDIRS[type];
      const uploadPath = path.join(uploadRoot, subdir, filename);

      // Save file
      const buffer = await data.toBuffer();
      await fs.writeFile(uploadPath, buffer);

      // Return file URL
      const fileUrl = `/api/uploads/${subdir}/${filename}`;

      return reply.send({
        success: true,
        data: {
          filename,
          type,
          url: fileUrl,
          size: buffer.length,
          mimetype: data.mimetype,
        },
      });

    } catch (error) {
      fastify.log.error(error, 'Upload error');
      return reply.code(500).send({
        error: {
          message: 'Upload failed',
          statusCode: 500,
        },
      });
    }
  });

  // Delete uploaded file
  fastify.delete('/upload/:type/:filename', async (request: FastifyRequest<{ Params: { type: string; filename: string } }>, reply: FastifyReply) => {
    try {
      const { type, filename } = request.params;

      // Validate type
      if (!UPLOAD_TYPES.includes(type as UploadQuery['type'])) {
        return reply.code(400).send({
          error: {
            message: 'Invalid upload type',
            statusCode: 400,
          },
        });
      }

      const subdir = UPLOAD_SUBDIRS[type as UploadQuery['type']];
      const filePath = path.join(uploadRoot, subdir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return reply.code(404).send({
          error: {
            message: 'File not found',
            statusCode: 404,
          },
        });
      }

      // Delete file
      await fs.unlink(filePath);

      return reply.send({
        success: true,
        message: 'File deleted successfully',
      });

    } catch (error) {
      fastify.log.error(error, 'Delete error');
      return reply.code(500).send({
        error: {
          message: 'Failed to delete file',
          statusCode: 500,
        },
      });
    }
  });

  // Get upload info
  fastify.get('/upload/:type/:filename', async (request: FastifyRequest<{ Params: { type: string; filename: string } }>, reply: FastifyReply) => {
    try {
      const { type, filename } = request.params;

      // Validate type
      if (!UPLOAD_TYPES.includes(type as UploadQuery['type'])) {
        return reply.code(400).send({
          error: {
            message: 'Invalid upload type',
            statusCode: 400,
          },
        });
      }

      const subdir = UPLOAD_SUBDIRS[type as UploadQuery['type']];
      const filePath = path.join(uploadRoot, subdir, filename);

      // Check if file exists
      try {
        const stats = await fs.stat(filePath);
        return reply.send({
          success: true,
          data: {
            filename,
            type,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          },
        });
      } catch {
        return reply.code(404).send({
          error: {
            message: 'File not found',
            statusCode: 404,
          },
        });
      }

    } catch (error) {
      fastify.log.error(error, 'Get file info error');
      return reply.code(500).send({
        error: {
          message: 'Failed to get file info',
          statusCode: 500,
        },
      });
    }
  });
}
