const API_BASE_URL = 'http://localhost:9000'; // FastAPI backend URL

export const uploadAndProcessImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let the browser set it with the correct boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to process image');
    }

    // Return the image blob URL
    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};