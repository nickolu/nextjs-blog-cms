export interface CloudinarySettings {
  enabled: boolean;
  cloudName: string;
  uploadPreset: string;
  folder: string;
  usePostFolders: boolean;
  transformations: {
    autoFormat: boolean;
    quality: number;
    maxWidth: number;
  };
  validation: {
    maxFileSizeMB: number;
    allowedTypes: string[];
  };
}

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  url: string;
  secure_url: string;
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}
