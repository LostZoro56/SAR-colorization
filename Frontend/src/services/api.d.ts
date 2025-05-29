// Type declarations for API service

declare module '../services/api' {
  export function uploadAndProcessImage(imageFile: File): Promise<string>;
}
