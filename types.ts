export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
        filename: string;
        name: string;
        mime: string;
        extension: string;
        url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface UploadError {
  message: string;
  code?: number;
}

export enum UploadStatus {
  IDLE = 'IDLE',
  SELECTING = 'SELECTING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UploadOptions {
  expiration?: number; // seconds, 60-15552000
  name?: string;
}
