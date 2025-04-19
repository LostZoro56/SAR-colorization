from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
import os
from datetime import datetime
import cv2
import sys

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

def process_image(image):
    """Simple image processing function."""
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
        
        return colorized
    except Exception as e:
        print(f"Error in processing: {str(e)}", file=sys.stderr)
        return None

@app.get("/")
async def root():
    return {"message": "Image Processing API is running"}

@app.post("/process")
async def process_image_endpoint(file: UploadFile = File(...)):
    try:
        # Read the uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Process the image
        processed_image = process_image(image)
        
        if processed_image is None:
            raise HTTPException(status_code=500, detail="Failed to process image")
        
        # Save the result
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"processed_{timestamp}.jpg"
        output_path = os.path.join(STATIC_DIR, output_filename)
        
        # Save the image
        cv2.imwrite(output_path, processed_image)
        
        # Return the URL
        return JSONResponse({
            "message": "Image processed successfully",
            "imageUrl": f"/static/{output_filename}"
        })
        
    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    try:
        # Try different ports
        for port in range(5001, 5010):
            try:
                print(f"Trying to start server on port {port}...")
                uvicorn.run(app, host="127.0.0.1", port=port)
                break
            except OSError as e:
                if "address already in use" in str(e):
                    continue
                raise
    except Exception as e:
        print(f"Error starting server: {str(e)}", file=sys.stderr)
        sys.exit(1)