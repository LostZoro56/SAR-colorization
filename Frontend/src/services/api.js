const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

export const uploadAndProcessImage = async (imageFile) => {
  try {
    // Step 1: Upload image to backend
    const formData = new FormData();
    formData.append('image', imageFile);

    const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const { jobId } = await uploadResponse.json();

    // Step 2: Poll for processing status
    let processedImageUrl = null;
    while (!processedImageUrl) {
      const statusResponse = await fetch(`${API_BASE_URL}/status/${jobId}`);
      const { status, imageUrl } = await statusResponse.json();

      if (status === 'completed') {
        processedImageUrl = imageUrl;
        break;
      } else if (status === 'failed') {
        throw new Error('Image processing failed');
      }

      // Wait for 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return processedImageUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}; 