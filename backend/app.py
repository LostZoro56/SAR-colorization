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
KAGGLE_API_URL = os.getenv('KAGGLE_API_URL')  # Your Kaggle notebook URL
KAGGLE_USERNAME = os.getenv('KAGGLE_USERNAME')
KAGGLE_KEY = os.getenv('KAGGLE_KEY')

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
        
        # Forward to Kaggle model
        forward_to_kaggle(file_path, unique_id)
        
        return jsonify({
            'jobId': unique_id,
            'message': 'Image uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status/<job_id>', methods=['GET'])
def get_status(job_id):
    if job_id not in processing_status:
        return jsonify({'error': 'Job not found'}), 404
    
    status_info = processing_status[job_id]
    
    if status_info['status'] == 'completed':
        return jsonify({
            'status': 'completed',
            'imageUrl': f'/api/processed/{job_id}'
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
            'status': 'processing'
        })

@app.route('/api/processed/<job_id>', methods=['GET'])
def get_processed_image(job_id):
    if job_id not in processing_status:
        return jsonify({'error': 'Job not found'}), 404
    
    status_info = processing_status[job_id]
    if status_info['status'] != 'completed':
        return jsonify({'error': 'Image not ready'}), 400
    
    return send_file(
        status_info['image_path'],
        mimetype='image/jpeg',
        as_attachment=True,
        download_name=f'colorized_{job_id}.jpg'
    )

def forward_to_kaggle(file_path, job_id):
    try:
        # Encode image to base64
        image_base64 = encode_image_to_base64(file_path)
        
        # Prepare request to Kaggle
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {base64.b64encode(f"{KAGGLE_USERNAME}:{KAGGLE_KEY}".encode()).decode()}'
        }
        
        payload = {
            'image': image_base64,
            'job_id': job_id
        }
        
        # Send request to Kaggle notebook
        response = requests.post(
            KAGGLE_API_URL,
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'colorized_image' in result:
                    # Decode and save the colorized image
                    processed_filename = f"processed_{job_id}.jpg"
                    processed_path = os.path.join(PROCESSED_FOLDER, processed_filename)
                    
                    # Convert base64 to image and save
                    colorized_image = decode_base64_to_image(result['colorized_image'])
                    colorized_image.save(processed_path, 'JPEG')
                    
                    # Update status
                    processing_status[job_id].update({
                        'status': 'completed',
                        'image_path': processed_path
                    })
                else:
                    raise Exception('No colorized image in response')
            except Exception as e:
                processing_status[job_id].update({
                    'status': 'failed',
                    'error': f'Failed to process response: {str(e)}'
                })
        else:
            processing_status[job_id].update({
                'status': 'failed',
                'error': f'Kaggle API error: {response.text}'
            })
                
    except Exception as e:
        processing_status[job_id].update({
            'status': 'failed',
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 