import { API_URL, DEFAULT_IMGBB_API_KEY } from '../constants';
import { ImgBBResponse, UploadOptions } from '../types';

export const uploadToImgBB = async (
  file: File,
  options: UploadOptions = {},
  apiKey: string = DEFAULT_IMGBB_API_KEY
): Promise<ImgBBResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Only append key if it's passed, otherwise client relies on what they have
  // But for ImgBB the key is a query param usually, or body param. 
  // ImgBB docs say: POST request to https://api.imgbb.com/1/upload?key=YOUR_CLIENT_API_KEY
  
  if (options.name) {
    formData.append('name', options.name);
  }
  
  if (options.expiration && options.expiration > 0) {
    formData.append('expiration', options.expiration.toString());
  }

  const url = `${API_URL}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data: ImgBBResponse | any = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || `Upload failed with status ${response.status}`);
    }

    return data as ImgBBResponse;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
