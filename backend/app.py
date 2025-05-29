import os
import io
import time
import random
import asyncio
import onnxruntime
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SAR Image Colorization API")

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load the ONNX model
try:
    onnx_model_path = "sar2rgb.onnx"
    sess = onnxruntime.InferenceSession(onnx_model_path)
    print(f"Model loaded successfully from {onnx_model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Function to process the input and make predictions
def predict(input_image):
    try:
        # Preprocess the input image
        input_image = input_image.resize((256, 256))  # Resize to model input size
        
        # Convert to numpy array and preprocess
        input_array = np.array(input_image).transpose(2, 0, 1)  # HWC to CHW
        input_array = input_array.astype(np.float32) / 255.0  # [0,1]
        input_array = (input_array - 0.5) / 0.5  # [-1,1] 
        input_array = np.expand_dims(input_array, axis=0)  # Add batch dimension
        
        # Run the model
        inputs = {sess.get_inputs()[0].name: input_array}
        output = sess.run(None, inputs)
        
        # Post-process the output image
        output_image = output[0].squeeze().transpose(1, 2, 0)  # CHW to HWC
        output_image = (output_image + 1) / 2  # [-1,1] to [0,1]
        output_image = (output_image * 255).astype(np.uint8)  # [0,1] to [0,255]
        
        return Image.fromarray(output_image)
    except Exception as e:
        print(f"Error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "SAR Image Colorization API is running"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            return JSONResponse(
                status_code=400,
                content={"error": "Uploaded file is not an image"}
            )
        
        # Read the image file
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if input_image.mode != "RGB":
            input_image = input_image.convert("RGB")
        
        # Simulate processing time with a random delay between 25-45 seconds
        processing_time = random.uniform(25, 45)
        print(f"Processing image... (simulated time: {processing_time:.2f} seconds)")
        await asyncio.sleep(processing_time)
        
        # Process the image
        output_image = predict(input_image)
        
        # Convert the output image to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        # Return the image as a downloadable file
        filename = f"colorized_{file.filename}"
        return StreamingResponse(
            content=img_byte_arr,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        print(f"Error processing upload: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error processing image: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
