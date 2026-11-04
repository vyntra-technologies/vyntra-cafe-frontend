import { apiClient } from './api';

export interface UploadedMedia {
  url: string;
  secureUrl: string;
  publicId?: string;
  filename: string;
  mimetype: string;
  size: number;
}

export const uploadService = {
  /**
   * Upload a single image to Cloudinary via backend API
   */
  uploadSingle: async (file: File, folder: string = 'general'): Promise<UploadedMedia> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Upload multiple images to Cloudinary via backend API
   */
  uploadMultiple: async (files: File[], folder: string = 'general'): Promise<UploadedMedia[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const response = await apiClient.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete an image from Cloudinary by its publicId
   */
  deleteImage: async (publicId: string): Promise<boolean> => {
    if (!publicId) return false;
    const response = await apiClient.delete('/uploads', {
      data: { publicId },
    });
    return response.data.success;
  },
};

export default uploadService;
