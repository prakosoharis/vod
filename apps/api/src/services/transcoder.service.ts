/**
 * HLS Transcoder Service
 * Handles communication with HLS Transcoder microservice
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

interface TranscoderConfig {
  baseUrl: string;
  timeout?: number;
}

interface TranscodeResult {
  videoId: string;
  hlsUrl: string;
  playlistUrl: string;
  cdnUrl: string;
  originalFilename: string;
  permanentStorage: string;
}

interface TranscodeError {
  success: false;
  error: string;
  message: string;
  videoId?: string;
}

export class TranscoderService {
  private baseUrl: string;
  private timeout: number;

  constructor(config?: TranscoderConfig) {
    this.baseUrl = config?.baseUrl || process.env.TRANSCODER_URL || 'http://localhost:5000';
    this.timeout = config?.timeout || 600000; // 10 minutes default
  }

  /**
   * Upload and transcode video file to HLS format
   */
  async transcodeVideo(filePath: string, originalName?: string): Promise<TranscodeResult> {
    try {
      // Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Video file not found: ${filePath}`);
      }

      // Create form data
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      const fileName = originalName || path.basename(filePath);

      formData.append('video', fileStream, {
        filename: fileName,
        contentType: this.getVideoMimeType(fileName)
      });

      // Upload to transcoder
      const response = await axios.post<{ success: true; data: TranscodeResult }>(
        `${this.baseUrl}/api/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: this.timeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (!response.data.success) {
        throw new Error('Transcoding failed');
      }

      return response.data.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as TranscodeError;
        throw new Error(
          errorData?.message ||
          error.message ||
          'Failed to transcode video'
        );
      }
      throw error;
    }
  }

  /**
   * Upload video from buffer
   */
  async transcodeFromBuffer(buffer: Buffer, filename: string): Promise<TranscodeResult> {
    try {
      const formData = new FormData();
      formData.append('video', buffer, {
        filename,
        contentType: this.getVideoMimeType(filename)
      });

      const response = await axios.post<{ success: true; data: TranscodeResult }>(
        `${this.baseUrl}/api/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: this.timeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (!response.data.success) {
        throw new Error('Transcoding failed');
      }

      return response.data.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as TranscodeError;
        throw new Error(
          errorData?.message ||
          error.message ||
          'Failed to transcode video'
        );
      }
      throw error;
    }
  }

  /**
   * Get video info by ID
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/video/${videoId}`,
        { timeout: 5000 }
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Video not found');
      }
      throw error;
    }
  }

  /**
   * Check transcoder service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get video MIME type from filename
   */
  private getVideoMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.flv': 'video/x-flv',
      '.wmv': 'video/x-ms-wmv',
      '.mpeg': 'video/mpeg',
      '.mpg': 'video/mpeg'
    };

    return mimeTypes[ext] || 'video/mp4';
  }
}

// Export singleton instance
export const transcoderService = new TranscoderService();
