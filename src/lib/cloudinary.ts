import { getSettings } from './settings';
import type { CloudinaryUploadResponse, UploadOptions } from '../types/cloudinary';

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  const settings = getSettings();
  return !!(settings.cloudinary.cloudName && settings.cloudinary.uploadPreset);
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const settings = getSettings();

  // Check file type
  if (!settings.cloudinary.validation.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF supported.'
    };
  }

  // Check file size
  const maxBytes = settings.cloudinary.validation.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File too large. Max size: ${settings.cloudinary.validation.maxFileSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Upload image to Cloudinary with retry logic
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  const settings = getSettings();

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured. Please add credentials in Settings.');
  }

  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { cloudName, uploadPreset } = settings.cloudinary;
  const folder = options.folder || settings.cloudinary.folder;

  // Build FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('timestamp', Date.now().toString());

  // Upload with retry logic
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data as CloudinaryUploadResponse;

    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError!;
}

/**
 * Generate Cloudinary URL with transformations
 */
export function getCloudinaryUrl(publicId: string, customTransformations?: object): string {
  const settings = getSettings();
  const { cloudName, transformations } = settings.cloudinary;

  // Build transformation string
  const parts: string[] = [];
  if (transformations.autoFormat) parts.push('f_auto');
  if (transformations.quality) parts.push(`q_${transformations.quality}`);
  if (transformations.maxWidth) parts.push(`w_${transformations.maxWidth}`);

  const transformString = parts.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/v1/${publicId}`;
}
