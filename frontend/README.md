# Frontend - Streamlit UI

Simple and clean Streamlit interface for the Agentic Writing Assistant.

## Features

- ✍️ Generate cover letters, motivational letters, social responses, and emails
- 👤 User profile management
- 📊 Quality metrics and assessment display
- 💡 Improvement suggestions
- 📈 Text statistics (word count, pages, etc.)

## Setup

**Option 1: Using pyproject.toml (Recommended)**
```bash
pip install -e .
```

**Option 2: Using requirements.txt**
```bash
pip install -r requirements.txt
```

## Running

1. **Start the backend server first:**
```bash
cd ../backend
python -m uvicorn src.main:app --reload
```

2. **In a new terminal, start the Streamlit app:**
```bash
cd frontend
streamlit run app.py
```

3. **Open your browser:**
   - The app will automatically open at `http://localhost:8501`

## Usage

1. **Set up your profile** (sidebar):
   - Enter your User ID
   - Add personal information (name, background, skills)
   - Set writing preferences (tone, style)
   - Click "Save Profile"

2. **Generate writing** (main tab):
   - Select writing type
   - Fill in context information
   - Set word limit and quality threshold
   - Click "Generate Writing"

3. **View results**:
   - Generated content
   - Quality scores and metrics
   - Text statistics
   - Improvement suggestions

## Configuration

The frontend connects to the API at `http://localhost:8000/api/v1` by default.

To change the API URL, edit `app.py`:
```python
API_BASE_URL = "http://localhost:8000/api/v1"
```

