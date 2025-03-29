# SAR Image Colorization Backend

This is the backend service for the SAR Image Colorization project. It handles image uploads, forwards them to the model server, and manages the processing status.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the `MODEL_SERVER_URL` in `.env` to point to your model server

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Upload Image
- **POST** `/api/upload`
- Accepts multipart form data with an 'image' field
- Returns a job ID for tracking

### Check Status
- **GET** `/api/status/<job_id>`
- Returns the current status of the processing job

### Get Processed Image
- **GET** `/api/processed/<job_id>`
- Returns the processed image file

## Directory Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
├── uploads/           # Temporary storage for uploaded images
└── processed/         # Storage for processed images
``` 