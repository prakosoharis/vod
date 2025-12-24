const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const winston = require('winston');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { Readable } = require('stream');

// ============================================================================
// CONFIGURATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 5000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// MinIO/S3 Client Configuration
const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  },
  forcePathStyle: true
});

const TEMP_BUCKET = process.env.TEMP_BUCKET || 'temp-raw-aws';
const PERM_BUCKET = process.env.PERM_BUCKET || 'perm-storage-wasabi';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
fs.ensureDirSync(UPLOAD_DIR);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'video/x-matroska', 'video/webm', 'video/x-flv',
      'video/x-ms-wmv', 'video/mpeg'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create MinIO buckets if they don't exist
 */
async function ensureBucketsExist() {
  const buckets = [TEMP_BUCKET, PERM_BUCKET];

  for (const bucket of buckets) {
    try {
      const { S3 } = require('@aws-sdk/client-s3');
      const s3 = new S3({
        endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY,
          secretAccessKey: process.env.MINIO_SECRET_KEY
        },
        forcePathStyle: true
      });

      await s3.headBucket({ Bucket: bucket });
      logger.info(`Bucket "${bucket}" already exists`);
    } catch (error) {
      if (error.name === 'NotFound') {
        try {
          const { CreateBucketCommand } = require('@aws-sdk/client-s3');
          await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
          logger.info(`Created bucket "${bucket}"`);
        } catch (createError) {
          logger.error(`Failed to create bucket "${bucket}": ${createError.message}`);
        }
      }
    }
  }
}

/**
 * Upload file to MinIO bucket
 */
async function uploadToMinIO(filePath, bucketName, key) {
  const fileStream = fs.createReadStream(filePath);
  const fileStats = await fs.stat(filePath);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentLength: fileStats.size
    }
  });

  await upload.done();
  logger.info(`Uploaded to MinIO: ${bucketName}/${key}`);
}

/**
 * Download file from MinIO bucket
 */
async function downloadFromMinIO(bucketName, key, destinationPath) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  const response = await s3Client.send(command);
  const stream = response.Body;

  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destinationPath);
    stream.pipe(writeStream);
    stream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  logger.info(`Downloaded from MinIO: ${bucketName}/${key} to ${destinationPath}`);
}

/**
 * Delete file from MinIO bucket
 */
async function deleteFromMinIO(bucketName, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  await s3Client.send(command);
  logger.info(`Deleted from MinIO: ${bucketName}/${key}`);
}

/**
 * Transcode video to HLS format with multi-bitrate
 */
async function transcodeToHLS(inputPath, outputDir, videoId) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, 'playlist.m3u8');

    logger.info(`Starting HLS transcoding for video: ${videoId}`);

    ffmpeg(inputPath)
      // Video codec settings
      .outputOptions([
        '-c:v libx264',           // H.264 codec
        '-c:a aac',               // AAC audio codec
        '-strict -2',
        '-hls_time 6',            // 6 second segments
        '-hls_list_size 0',       // Include all segments in playlist
        '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
        '-f hls',

        // Multi-bitrate variants
        '-b:v:0 5000k', '-maxrate:v:0 5350k', '-bufsize:v:0 7500k', '-s:v:0 1920x1080', // 1080p
        '-b:v:1 2800k', '-maxrate:v:1 2996k', '-bufsize:v:1 4200k', '-s:v:1 1280x720',  // 720p
        '-b:v:2 1400k', '-maxrate:v:2 1498k', '-bufsize:v:2 2100k', '-s:v:2 854x480',   // 480p
        '-b:v:3 800k',  '-maxrate:v:3 856k',  '-bufsize:v:3 1200k', '-s:v:3 640x360',   // 360p

        // Audio bitrate
        '-b:a 128k'
      ])
      .on('start', (commandLine) => {
        logger.info(`FFmpeg command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.info(`Processing: ${progress.percent?.toFixed(2)}% done`);
      })
      .on('end', () => {
        logger.info(`HLS transcoding completed for video: ${videoId}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`FFmpeg error: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Upload HLS files (m3u8 + segments) to MinIO - Recursive for nested folders
 */
async function uploadHLSFiles(hlsDir, videoId) {
  async function uploadRecursive(dir, prefix = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const s3Key = prefix ? `${videoId}/${prefix}/${entry.name}` : `${videoId}/${entry.name}`;

      if (entry.isDirectory()) {
        // Recursively upload subdirectory
        const subPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
        await uploadRecursive(fullPath, subPrefix);
      } else {
        // Upload file
        await uploadToMinIO(fullPath, PERM_BUCKET, s3Key);
        logger.info(`Uploaded: ${s3Key}`);
      }
    }
  }

  await uploadRecursive(hlsDir);
  logger.info(`All HLS files uploaded for video: ${videoId}`);
}

/**
 * Cleanup local files
 */
async function cleanupLocalFiles(...paths) {
  for (const filePath of paths) {
    try {
      await fs.remove(filePath);
      logger.info(`Cleaned up local file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to cleanup ${filePath}: ${error.message}`);
    }
  }
}

// ============================================================================
// JOB STATUS TRACKING
// ============================================================================

// In-Memory Job Status Storage
const jobStatus = new Map();

/**
 * Update job status
 */
function updateJobStatus(videoId, status, progress = 0, error = null, data = {}) {
  jobStatus.set(videoId, {
    videoId,
    status, // 'uploading', 'transcoding', 'completed', 'failed'
    progress, // 0-100
    error,
    ...data,
    updatedAt: new Date().toISOString()
  });
  logger.info(`[${videoId}] Status updated: ${status} (${progress}%)`);
}

/**
 * Get job status
 */
function getJobStatus(videoId) {
  return jobStatus.get(videoId) || null;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'HLS Transcoder',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get job status endpoint
 */
app.get('/api/status/:videoId', (req, res) => {
  const { videoId } = req.params;
  const status = getJobStatus(videoId);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Video ID not found'
    });
  }

  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * Background transcode worker
 * Processes the video in the background without blocking the API response
 */
async function processVideoInBackground(videoId, localRawPath, originalFilename, tempS3Key) {
  let localHLSDir = null;
  let downloadedPath = null;

  try {
    // STEP 2: Download from temp-raw-aws to local (simulating re-download)
    logger.info(`[${videoId}] Step 2: Downloading from transit storage to local temp`);
    updateJobStatus(videoId, 'downloading', 10);
    downloadedPath = path.join(UPLOAD_DIR, `${videoId}_downloaded${path.extname(originalFilename)}`);
    await downloadFromMinIO(TEMP_BUCKET, tempS3Key, downloadedPath);
    updateJobStatus(videoId, 'downloading', 20);

    // STEP 3: Transcode to HLS
    logger.info(`[${videoId}] Step 3: Transcoding to HLS format`);
    updateJobStatus(videoId, 'transcoding', 25);
    localHLSDir = path.join(UPLOAD_DIR, `${videoId}_hls`);
    await fs.ensureDir(localHLSDir);

    // Modify transcodeToHLS to update progress
    await transcodeToHLSWithProgress(downloadedPath, localHLSDir, videoId);

    // STEP 4: Upload HLS files to perm-storage-wasabi
    logger.info(`[${videoId}] Step 4: Uploading HLS files to permanent storage (${PERM_BUCKET})`);
    updateJobStatus(videoId, 'uploading_hls', 90);
    await uploadHLSFiles(localHLSDir, videoId);

    // STEP 5: Cleanup (DELETE raw files from transit and local)
    logger.info(`[${videoId}] Step 5: Cleaning up transit storage and local files`);
    updateJobStatus(videoId, 'cleanup', 95);

    // Delete from temp-raw-aws
    await deleteFromMinIO(TEMP_BUCKET, tempS3Key);

    // Delete local files
    await cleanupLocalFiles(localRawPath, downloadedPath, localHLSDir);

    // Success
    const hlsUrl = `http://localhost:8089/videos/${videoId}/playlist.m3u8`;
    logger.info(`[${videoId}] ✅ Processing completed successfully`);

    updateJobStatus(videoId, 'completed', 100, null, {
      hlsUrl,
      playlistUrl: hlsUrl,
      originalFilename,
      permanentStorage: PERM_BUCKET,
      cdnUrl: `http://localhost:8089/videos/${videoId}/`
    });

  } catch (error) {
    logger.error(`[${videoId}] ❌ Background processing error: ${error.message}`);
    logger.error(error.stack);

    updateJobStatus(videoId, 'failed', 0, error.message);

    // Cleanup on error
    try {
      if (tempS3Key) {
        await deleteFromMinIO(TEMP_BUCKET, tempS3Key).catch(() => {});
      }
      if (localRawPath) await fs.remove(localRawPath).catch(() => {});
      if (downloadedPath) await fs.remove(downloadedPath).catch(() => {});
      if (localHLSDir) await fs.remove(localHLSDir).catch(() => {});
    } catch (cleanupError) {
      logger.error(`Cleanup error: ${cleanupError.message}`);
    }
  }
}

/**
 * Transcode with progress updates - Creates HLS adaptive bitrate with multiple resolutions
 */
async function transcodeToHLSWithProgress(inputPath, outputDir, videoId) {
  const variants = [
    { name: '1080p', width: 1920, height: 1080, videoBitrate: '5000k', maxrate: '5350k', bufsize: '7500k' },
    { name: '720p', width: 1280, height: 720, videoBitrate: '2800k', maxrate: '2996k', bufsize: '4200k' },
    { name: '480p', width: 854, height: 480, videoBitrate: '1400k', maxrate: '1498k', bufsize: '2100k' },
    { name: '360p', width: 640, height: 360, videoBitrate: '800k', maxrate: '856k', bufsize: '1200k' }
  ];

  logger.info(`Starting HLS transcoding for video: ${videoId} with adaptive bitrate (1080p, 720p, 480p, 360p)`);

  // Transcode each variant sequentially
  let overallProgress = 0;
  const progressPerVariant = 65 / variants.length; // 65% total progress divided by 4 variants

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const variantDir = path.join(outputDir, variant.name);
    await fs.ensureDir(variantDir);

    logger.info(`[${videoId}] Transcoding ${variant.name} (${i + 1}/${variants.length})`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-profile:v main',
          '-crf 23',
          `-s ${variant.width}x${variant.height}`,
          `-b:v ${variant.videoBitrate}`,
          `-maxrate ${variant.maxrate}`,
          `-bufsize ${variant.bufsize}`,
          '-c:a aac',
          '-b:a 128k',
          '-ac 2',
          '-f hls',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', path.join(variantDir, 'segment_%03d.ts')
        ])
        .on('start', (commandLine) => {
          logger.info(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          const variantPercent = progress.percent || 0;
          // Calculate overall progress: 25% base + (variant index * progress per variant) + (current variant progress)
          const currentProgress = 25 + (i * progressPerVariant) + ((variantPercent / 100) * progressPerVariant);
          updateJobStatus(videoId, 'transcoding', Math.min(Math.round(currentProgress), 90));
        })
        .on('end', () => {
          logger.info(`[${videoId}] ${variant.name} transcoding completed`);
          resolve();
        })
        .on('error', (err) => {
          logger.error(`FFmpeg error for ${variant.name}: ${err.message}`);
          reject(err);
        })
        .save(path.join(variantDir, 'playlist.m3u8'));
    });
  }

  // Generate master playlist
  const masterPlaylistPath = path.join(outputDir, 'playlist.m3u8');
  const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5350000,RESOLUTION=1920x1080,NAME="1080p"
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2996000,RESOLUTION=1280x720,NAME="720p"
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1498000,RESOLUTION=854x480,NAME="480p"
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=856000,RESOLUTION=640x360,NAME="360p"
360p/playlist.m3u8
`;

  await fs.writeFile(masterPlaylistPath, masterPlaylistContent, 'utf8');
  logger.info(`[${videoId}] Master playlist created with 4 variants`);

  return masterPlaylistPath;
}

/**
 * Main upload endpoint - Now returns immediately and processes in background
 *
 * Workflow:
 * 1. Accept file upload and upload to temp-raw-aws
 * 2. Return 202 Accepted with videoId immediately
 * 3. Process transcode in background (async)
 * 4. Client polls /api/status/:videoId for progress
 */
app.post('/api/upload', upload.single('video'), async (req, res) => {
  const videoId = uuidv4();
  let localRawPath = null;
  let tempS3Key = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    localRawPath = req.file.path;
    const originalFilename = req.file.originalname;
    tempS3Key = `${videoId}/${originalFilename}`;

    logger.info(`[${videoId}] Starting upload process for: ${originalFilename}`);

    // Initialize job status
    updateJobStatus(videoId, 'uploading', 0, null, { originalFilename });

    // STEP 1: Upload to temp-raw-aws (transit storage)
    logger.info(`[${videoId}] Step 1: Uploading to transit storage (${TEMP_BUCKET})`);
    await uploadToMinIO(localRawPath, TEMP_BUCKET, tempS3Key);
    updateJobStatus(videoId, 'uploaded', 5, null, { originalFilename });

    // Return immediate response (202 Accepted)
    logger.info(`[${videoId}] Upload completed, starting background processing`);

    res.status(202).json({
      success: true,
      message: 'Video uploaded successfully. Transcoding started in background.',
      data: {
        videoId,
        status: 'processing',
        statusUrl: `http://localhost:8089/api/status/${videoId}`,
        originalFilename
      }
    });

    // Start background processing (non-blocking)
    setImmediate(() => {
      processVideoInBackground(videoId, localRawPath, originalFilename, tempS3Key);
    });

  } catch (error) {
    logger.error(`[${videoId}] ❌ Upload error: ${error.message}`);
    logger.error(error.stack);

    updateJobStatus(videoId, 'failed', 0, error.message);

    // Cleanup on error
    try {
      if (tempS3Key) {
        await deleteFromMinIO(TEMP_BUCKET, tempS3Key).catch(() => {});
      }
      if (localRawPath) await fs.remove(localRawPath).catch(() => {});
    } catch (cleanupError) {
      logger.error(`Cleanup error: ${cleanupError.message}`);
    }

    res.status(500).json({
      success: false,
      error: 'Video upload failed',
      message: error.message,
      videoId
    });
  }
});

/**
 * Get video info endpoint
 */
app.get('/api/video/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const hlsUrl = `http://localhost:8089/videos/${videoId}/playlist.m3u8`;

    res.status(200).json({
      success: true,
      data: {
        videoId,
        hlsUrl,
        status: 'ready'
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    // Ensure buckets exist
    await ensureBucketsExist();

    // Start server
    app.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`🚀 HLS Transcoder Service Started`);
      logger.info(`========================================`);
      logger.info(`Port: ${PORT}`);
      logger.info(`MinIO Endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
      logger.info(`Transit Bucket: ${TEMP_BUCKET}`);
      logger.info(`Permanent Bucket: ${PERM_BUCKET}`);
      logger.info(`Upload Directory: ${UPLOAD_DIR}`);
      logger.info(`========================================`);
      logger.info(`API Endpoints:`);
      logger.info(`  POST http://localhost:${PORT}/api/upload`);
      logger.info(`  GET  http://localhost:${PORT}/health`);
      logger.info(`========================================`);
      logger.info(`Frontend: http://localhost:8089`);
      logger.info(`MinIO Console: http://localhost:9001`);
      logger.info(`========================================`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, cleaning up...');
  await cleanupLocalFiles(UPLOAD_DIR);
  process.exit(0);
});

// Start the server
startServer();
