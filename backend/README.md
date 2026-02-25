# PCOS Smart Assistant - Backend API

## Features
- 📊 Analyzes user health data against PCOS dataset
- 🏥 Recommends doctors based on location and severity
- 📈 Generates comprehensive health reports
- 🔍 Provides risk assessment and personalized recommendations
- 📞 Emergency helpline information

## Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. Run the Server
```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Analyze User Data
```
POST /api/analyze
Content-Type: application/json

{
  "age": 25,
  "cycle_length": 35,
  "period_length": 6,
  "symptoms": ["irregular_cycles", "acne"],
  "city": "Hyderabad",
  "weight": 65,
  "height": 160,
  ...
}

Response:
{
  "success": true,
  "analysis": {
    "risk_score": 55,
    "risk_level": "moderate",
    "summary": "...",
    "recommendations": [...]
  },
  "doctors": {
    "primary_doctors": [...],
    "helplines": {...}
  },
  "report": {
    "key_findings": [...],
    "next_steps": [...]
  }
}
```

### Get Dataset Statistics
```
GET /api/stats

Response:
{
  "total_entries": 1000,
  "avg_cycle_length": 28,
  "avg_period_length": 5,
  "pcos_percentage": 45.2
}
```

## Doctor Database

Currently supports cities:
- Hyderabad
- Vijayawada
- Bangalore
- Chennai
- Delhi
- Mumbai
- Pune

Each city has 2-3 specialists including:
- Gynecologists
- Endocrinologists
- PCOS Specialists
- Fertility Experts

## Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
heroku login
heroku create pcos-assistant-api

# Add buildpack
heroku buildpacks:add heroku/python

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_KEY=your_key

# Deploy
git push heroku main
```

### Deploy to Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically from main branch

## Development

### Project Structure
```
backend/
├── app.py                      # Main Flask application
├── analysis_engine.py          # PCOS analysis logic
├── doctor_recommendations.py   # Doctor recommendation system
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

### Adding New Cities/Doctors

Edit `doctor_recommendations.py`:
```python
self.doctors_db = {
    "YourCity": [
        {
            "name": "Dr. Name",
            "specialty": "Gynecologist",
            "hospital": "Hospital Name",
            "phone": "+91 xxx xxx xxxx",
            ...
        }
    ]
}
```

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test analysis endpoint
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "cycle_length": 40,
    "period_length": 5,
    "symptoms": ["irregular_cycles", "weight_gain"],
    "city": "Hyderabad"
  }'
```

## Security Notes

- Never commit `.env` file
- Use service key only on backend (not in frontend)
- Implement rate limiting for production
- Add authentication for sensitive endpoints
- Use HTTPS in production

## Support

For issues or questions, check the main project README or create an issue on GitHub.
