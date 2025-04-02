from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
import numpy as np
import os
from datetime import datetime
import io
import shutil
import torch
import torch.nn as nn
from torchvision import transforms, models
import cv2
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ColorizationNet(nn.Module):
    def __init__(self):
        super(ColorizationNet, self).__init__()
        
        # Use ResNet18 as backbone
        resnet = models.resnet18(pretrained=True)
        self.encoder = nn.Sequential(*list(resnet.children())[:-2])
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(512, 256, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1),  
            nn.Tanh()
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5002"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]  # Allow download headers
)

# Ensure directories exist
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

# Mount static files directory
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Global model variable
model = None

def load_model():
    """Load the colorization model."""
    try:
        model = ColorizationNet()
        model_path = os.path.join("models", "colorization_model.pth")
        
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path))
            logger.info("Loaded pre-trained model")
        else:
            logger.warning("No pre-trained model found, using initialized weights")
        
        model.eval()
        return model
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None

def preprocess_image(image):
    """Preprocess the input image for the model."""
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Resize to 256x256
        gray = cv2.resize(gray, (256, 256))
        
        # Normalize to [0, 1]
        gray = gray.astype(np.float32) / 255.0
        
        # Convert to tensor and replicate to 3 channels (since ResNet expects 3 channels)
        image_tensor = torch.from_numpy(gray).unsqueeze(0)  
        image_tensor = image_tensor.unsqueeze(0)  
        image_tensor = image_tensor.repeat(1, 3, 1, 1)  
        
        return image_tensor
    except Exception as e:
        logger.error(f"Error in preprocessing: {str(e)}")
        raise

def postprocess_image(output):
    """Convert model output to RGB image."""
    try:
        # Convert to numpy array
        output = output.detach().cpu().squeeze().permute(1, 2, 0).numpy()
        
        # Scale the values from [-1, 1] to [0, 255]
        output = ((output + 1) * 127.5).astype(np.uint8)
        
        return output
    except Exception as e:
        logger.error(f"Error in postprocessing: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup."""
    global model
    logger.info("Starting up model server...")
    try:
        model = load_model()
        if model is None:
            raise Exception("Failed to load model")
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise

@app.get("/static/{filename}")
async def get_image(filename: str):
    """Serve static files with proper headers for download."""
    file_path = os.path.join(STATIC_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(
        file_path,
        media_type="image/jpeg",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    """Process the uploaded image."""
    logger.info(f"Received image upload: {file.filename}")
    try:
        # Read the uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("Failed to decode image")
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        logger.info(f"Image shape: {image.shape}")
        
        # Preprocess the image
        processed_image = preprocess_image(image)
        logger.info(f"Preprocessed image shape: {processed_image.shape}")
        
        # Process with model
        with torch.no_grad():
            output = model(processed_image)
        
        # Postprocess the output
        colorized_image = postprocess_image(output)
        
        # Save the result
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"colorized_{timestamp}.jpg"
        output_path = os.path.join(STATIC_DIR, output_filename)
        
        # Save the image
        cv2.imwrite(output_path, colorized_image)
        logger.info(f"Saved colorized image to: {output_path}")
        
        # Verify the file exists
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Failed to save processed image")
        
        # Return the full URL
        return JSONResponse({
            "message": "Image processed successfully",
            "imageUrl": f"http://localhost:8082/static/{output_filename}"  
        })
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8082)