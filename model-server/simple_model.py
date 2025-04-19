import cv2
import numpy as np

def process_image(image):
    """Simple image processing function that enhances and colorizes the image."""
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply simple contrast enhancement
        enhanced = cv2.equalizeHist(gray)
        
        # Create a simple color map
        colorized = cv2.applyColorMap(enhanced, cv2.COLORMAP_JET)
        
        # Resize to a reasonable size for faster processing
        colorized = cv2.resize(colorized, (512, 512))
        
        return colorized
    except Exception as e:
        print(f"Error in processing: {str(e)}")
        return None 