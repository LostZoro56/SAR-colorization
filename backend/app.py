from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import requests
import json
import time
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
# Use Kaggle notebook URL instead of local model server
KAGGLE_MODEL_URL = os.getenv('KAGGLE_MODEL_URL', 'https://your-kaggle-notebook-url.kaggle.net')

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Store processing status
processing_status = {}

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def decode_base64_to_image(base64_string):
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data))

@app.route('/api/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        file_extension = os.path.splitext(filename)[1]
        new_filename = f"{unique_id}{file_extension}"
        
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
        file.save(file_path)
        
        # Initialize processing status
        processing_status[unique_id] = {
            'status': 'processing',
            'image_path': None,
            'start_time': time.time()
        }
        
        # Forward to Kaggle model server
        forward_to_kaggle(file_path, unique_id)
        
        return jsonify({
            'jobId': unique_id,
            'message': 'Image uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def forward_to_kaggle(file_path, job_id):
    try:
        # Prepare the file for upload to Kaggle
        files = {'image': open(file_path, 'rb')}
        
        # Send request to Kaggle model server
        response = requests.post(f"{KAGGLE_MODEL_URL}/api/colorize", files=files)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('colorizedImageUrl'):
                # Download the colorized image from Kaggle
                colorized_url = f"{KAGGLE_MODEL_URL}{data['colorizedImageUrl']}"
                colorized_response = requests.get(colorized_url)
                
                if colorized_response.status_code == 200:
                    # Save the colorized image
                    output_filename = f"{job_id}_colorized.png"
                    output_path = os.path.join(PROCESSED_FOLDER, output_filename)
                    
                    with open(output_path, 'wb') as f:
                        f.write(colorized_response.content)
                    
                    # Update processing status
                    processing_status[job_id]['status'] = 'completed'
                    processing_status[job_id]['image_path'] = output_path
                else:
                    processing_status[job_id]['status'] = 'failed'
                    processing_status[job_id]['error'] = 'Failed to download colorized image'
            else:
                processing_status[job_id]['status'] = 'failed'
                processing_status[job_id]['error'] = 'Invalid response from model server'
        else:
            processing_status[job_id]['status'] = 'failed'
            processing_status[job_id]['error'] = f'Model server error: {response.text}'
            
    except Exception as e:
        processing_status[job_id]['status'] = 'failed'
        processing_status[job_id]['error'] = str(e)

@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    if job_id not in processing_status:
        return jsonify({'error': 'Job not found'}), 404
    
    status_info = processing_status[job_id]
    
    if status_info['status'] == 'completed':
        return jsonify({
            'status': 'completed',
            'imageUrl': f'/api/processed/{job_id}_colorized.png'
        })
    elif status_info['status'] == 'failed':
        return jsonify({
            'status': 'failed',
            'error': status_info.get('error', 'Processing failed')
        })
    else:
        # Check if processing has timed out (5 minutes)
        if time.time() - status_info['start_time'] > 300:
            status_info['status'] = 'failed'
            status_info['error'] = 'Processing timed out'
            return jsonify({
                'status': 'failed',
                'error': 'Processing timed out'
            })
        
        return jsonify({
            'status': 'processing',
            'message': 'Image is being processed'
        })

@app.route('/api/processed/<filename>', methods=['GET'])
def get_processed_image(filename):
    try:
        return send_file(os.path.join(PROCESSED_FOLDER, filename))
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 