from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
import numpy as np
import os
from datetime import datetime
import io
import shutil

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
os.makedirs("static", exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    try:
        # Read the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to grayscale (placeholder for actual model processing)
        gray_image = image.convert('L')
        
        # Create a colorized version (placeholder)
        # In a real implementation, this would be replaced with your actual model
        colorized = Image.merge('RGB', [gray_image, gray_image, gray_image])
        
        # Save the processed image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"colorized_{timestamp}.png"
        filepath = os.path.join("static", filename)
        colorized.save(filepath)
        
        return {
            "message": "Image processed successfully",
            "imageUrl": f"/static/{filename}"
        }
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 