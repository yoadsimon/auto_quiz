# Auto Quiz App

A React-based quiz application that processes text files into interactive quizzes.

## Quick Start

1. **Process quiz data:**
   ```bash
   python quiz_processor_final.py
   ```

2. **Run frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Structure

- `raw_data/` - Source text files
- `quiz_processor_final.py` - Converts text to quiz CSV
- `frontend/` - React TypeScript app
- `data/quiz_data.csv` - Generated quiz questions

## Docker Option
```bash
cd frontend/docker
docker-compose up
``` 