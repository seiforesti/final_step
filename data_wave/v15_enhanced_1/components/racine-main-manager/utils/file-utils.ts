// ============================================================================
// FILE UTILITIES
// ============================================================================

import type { FileUploadResult, ImageProcessingResult } from '../types/racine-core.types';

/**
 * Upload file to server
 */
export const uploadFile = async (
  file: File, 
  endpoint: string, 
  options: {
    onProgress?: (progress: number) => void;
    headers?: Record<string, string>;
  } = {}
): Promise<FileUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = (event.loaded / event.total) * 100;
          options.onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              url: response.url,
              filename: response.filename,
              size: response.size,
              message: 'File uploaded successfully'
            });
          } catch {
            resolve({
              success: true,
              url: xhr.responseText,
              filename: file.name,
              size: file.size,
              message: 'File uploaded successfully'
            });
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', endpoint);
      
      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      message: 'Failed to upload file'
    };
  }
};

/**
 * Resize image to specified dimensions
 */
export const resizeImage = (
  file: File, 
  maxWidth: number, 
  maxHeight: number,
  quality: number = 0.8
): Promise<ImageProcessingResult> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve({
              success: true,
              file: resizedFile,
              originalSize: file.size,
              newSize: blob.size,
              width,
              height,
              message: 'Image resized successfully'
            });
          } else {
            resolve({
              success: false,
              error: 'Failed to process image',
              message: 'Image processing failed'
            });
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to load image',
        message: 'Invalid image file'
      });
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = (
  file: File, 
  size: number = 150,
  quality: number = 0.7
): Promise<ImageProcessingResult> => {
  return resizeImage(file, size, size, quality);
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 10MB`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Convert file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (file: File): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  return documentTypes.includes(file.type);
};

/**
 * Create download link for file
 */
export const createDownloadLink = (file: File | Blob, filename?: string): string => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || (file instanceof File ? file.name : 'download');
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
  
  return url;
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Compress file using browser APIs
 */
export const compressFile = async (
  file: File, 
  quality: number = 0.8
): Promise<File> => {
  if (isImageFile(file)) {
    const result = await resizeImage(file, 1920, 1080, quality);
    if (result.success && result.file) {
      return result.file;
    }
  }
  
  // For non-image files, return original
  return file;
};

/**
 * Batch upload multiple files
 */
export const batchUploadFiles = async (
  files: File[], 
  endpoint: string,
  options: {
    onProgress?: (progress: number) => void;
    onFileProgress?: (filename: string, progress: number) => void;
    headers?: Record<string, string>;
  } = {}
): Promise<FileUploadResult[]> => {
  const results: FileUploadResult[] = [];
  let completedFiles = 0;

  for (const file of files) {
    try {
      const result = await uploadFile(file, endpoint, {
        ...options,
        onProgress: (progress) => {
          options.onFileProgress?.(file.name, progress);
        }
      });
      
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        message: `Failed to upload ${file.name}`
      });
    }
    
    completedFiles++;
    options.onProgress?.(completedFiles / files.length * 100);
  }

  return results;
};

// Named exports are declared above; avoid duplicate re-export block
