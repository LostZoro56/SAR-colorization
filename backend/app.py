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
MODEL_SERVER_URL = os.getenv('MODEL_SERVER_URL', 'http://localhost:8000')

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
        
        # Forward to model server
        forward_to_model(file_path, unique_id)
        
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

def forward_to_model(file_path, job_id):
    try:
        # Prepare the file for upload
        files = {'file': ('image.jpg', open(file_path, 'rb'), 'image/jpeg')}
        
        # Send request to model server
        print(f"Sending request to {MODEL_SERVER_URL}/process")
        response = requests.post(
            f"{MODEL_SERVER_URL}/process",
            files=files
        )
        
        print(f"Model server response status: {response.status_code}")
        print(f"Model server response: {response.text}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'imageUrl' in result:
                    # Download the processed image
                    processed_filename = f"processed_{job_id}.jpg"
                    processed_path = os.path.join(PROCESSED_FOLDER, processed_filename)
                    
                    # Get the image from model server
                    image_url = f"{MODEL_SERVER_URL}{result['imageUrl']}"
                    print(f"Downloading processed image from: {image_url}")
                    image_response = requests.get(image_url)
                    
                    if image_response.status_code == 200:
                        with open(processed_path, 'wb') as f:
                            f.write(image_response.content)
                        
                        # Update status
                        processing_status[job_id].update({
                            'status': 'completed',
                            'image_path': processed_path
                        })
                    else:
                        raise Exception(f'Failed to download processed image: {image_response.status_code} {image_response.text}')
                else:
                    raise Exception('No image URL in response')
            except Exception as e:
                processing_status[job_id].update({
                    'status': 'failed',
                    'error': f'Failed to process response: {str(e)}'
                })
        else:
            processing_status[job_id].update({
                'status': 'failed',
                'error': f'Model server error: {response.text}'
            })
                
    except Exception as e:
        processing_status[job_id].update({
            'status': 'failed',
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 