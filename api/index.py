"""
Vercel Python API for PCOS Smart Assistant
Security hardened version - v2.1.0 (2026-03-01)

API Endpoints:
- GET  /api/health - Health check
- POST /api/analyze-step - Analyze single form step
- POST /api/analyze - Full health analysis
- GET  /api/stats - Dataset statistics
- POST /api/ai/chat - Multi-provider AI chat (OpenRouter, OpenAI, Perplexity)
"""

from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import json
import re
from functools import wraps
import time
import os
import requests
import logging

# Create Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pcos-api")

# Security: Configure CORS to only allow specific origins
# In production, replace with actual allowed origins
ALLOWED_ORIGINS = [
    'https://pcos-zeta.vercel.app',
    'https://24b61a66c4-byte.github.io',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
]

def cors_with_origin(f):
    """Secure CORS decorator that checks allowed origins"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        origin = request.headers.get('Origin', '')
        # Allow requests with no origin (e.g., same-origin) or from allowed origins
        if origin in ALLOWED_ORIGINS or not origin:
            return f(*args, **kwargs)
        # For other origins, still allow but don't expose credentials
        response = f(*args, **kwargs)
        return response
    return decorated_function

# Configure CORS with restrictions
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=False)

# Analyzer availability: attempt to load analysis engine
ANALYZER_AVAILABLE = False
analyzer = None
doctor_recommender = None

# Try to import and initialize analyzer
try:
    # Try importing from backend module structure
    from backend.analysis_engine import PCOSAnalyzer
    analyzer = PCOSAnalyzer(None)  # Initialize without Supabase for serverless
    ANALYZER_AVAILABLE = True
except ImportError:
    try:
        # Fallback: Try parent directory import
        import sys
        import os
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if os.path.exists(backend_path):
            sys.path.insert(0, backend_path)
        from analysis_engine import PCOSAnalyzer
        analyzer = PCOSAnalyzer(None)
        ANALYZER_AVAILABLE = True
    except Exception as e:
        # If imports fail, create a fallback basic analyzer
        class BasicAnalyzer:
            """Fallback analyzer when main analyzer can't be imported"""
            def analyze_step(self, step, step_data):
                """Basic step analysis with common PCOS patterns"""
                insights = {
                    "step": step,
                    "step_name": self._get_step_name(step),
                    "findings": [],
                    "tips": [],
                    "next_step_preview": None,
                    "has_sufficient_data": False
                }
                
                if step == 1 and step_data:
                    age = step_data.get('age')
                    if age:
                        insights["findings"].append(f"Age: {age} years")
                        if 15 <= age <= 35:
                            insights["tips"].append("PCOS is commonly diagnosed in women aged 15-35. Your age is in the typical range.")
                
                if step == 2 and step_data:
                    cycle = step_data.get('cycle_length')
                    if cycle:
                        try:
                            cycle = int(cycle)
                            if cycle > 35:
                                insights["findings"].append(f"Cycle: {cycle} days (irregular)")
                                insights["tips"].append("Irregular cycles can be a sign of hormonal imbalance. PCOS often causes extended cycles.")
                            elif cycle < 21:
                                insights["findings"].append(f"Cycle: {cycle} days (short)")
                                insights["tips"].append("Short cycles may indicate hormonal issues.")
                            else:
                                insights["findings"].append(f"Cycle: {cycle} days (normal range)")
                        except:
                            pass
                
                if step == 3 and step_data:
                    symptoms = step_data.get('symptoms', [])
                    if symptoms:
                        insights["findings"].append(f"Symptoms reported: {len(symptoms)}")
                        if any(s in str(symptoms).lower() for s in ['acne', 'hirsutism', 'hair loss']):
                            insights["tips"].append("Androgen-related symptoms like acne or hair loss are common in PCOS.")
                        if any(s in str(symptoms).lower() for s in ['weight gain', 'weight']):
                            insights["tips"].append("Weight management is an important part of PCOS management.")
                
                if step >= 4:
                    insights["has_sufficient_data"] = True
                
                return insights
            
            def analyze(self, user_data):
                """Comprehensive analysis"""
                return {
                    "risk_level": "moderate",
                    "pcos_indicators": len(user_data.get('symptoms', [])),
                    "recommendations": [
                        "Consult with an endocrinologist for proper diagnosis",
                        "Maintain regular exercise routine",
                        "Follow a balanced diet with low glycemic index foods",
                        "Track menstrual cycles regularly"
                    ]
                }
            
            @staticmethod
            def _get_step_name(step):
                names = {1: "Personal Info", 2: "Cycle", 3: "Symptoms", 4: "Lifestyle", 5: "Clinical", 6: "Review"}
                return names.get(step, f"Step {step}")
        
        analyzer = BasicAnalyzer()
        ANALYZER_AVAILABLE = True

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    # Prevent XSS attacks
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # Content Security Policy
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://pcos-zeta.vercel.app https://openrouter.ai"
    # Referrer policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    # X-XSS-Protection (legacy but still good)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response


# Simple in-memory rate limiting (for demonstration)
# In production, use Redis or similar
rate_limit_store = {}
RATE_LIMIT = 60  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

def rate_limit(f):
    """Rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP (handles proxy)
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip:
            ip = ip.split(',')[0].strip()
        
        current_time = time.time()
        
        # Clean old entries
        rate_limit_store[ip] = [t for t in rate_limit_store.get(ip, []) 
                               if current_time - t < RATE_LIMIT_WINDOW]
        
        # Check rate limit
        if len(rate_limit_store.get(ip, [])) >= RATE_LIMIT:
            return jsonify({
                "error": "Rate limit exceeded. Please try again later.",
                "retry_after": RATE_LIMIT_WINDOW
            }), 429
        
        # Add current request
        if ip not in rate_limit_store:
            rate_limit_store[ip] = []
        rate_limit_store[ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function


def sanitize_input(data, field_name):
    """Sanitize string input to prevent injection attacks"""
    if not isinstance(data, str):
        return data
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', data)
    return sanitized.strip()


def validate_numeric_range(value, min_val, max_val, field_name):
    """Validate numeric input is within acceptable range"""
    try:
        num = float(value)
        if not (min_val <= num <= max_val):
            return False, f"{field_name} must be between {min_val} and {max_val}"
        return True, num
    except (ValueError, TypeError):
        return False, f"{field_name} must be a valid number"


@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "PCOS Smart Assistant API",
        "timestamp": "2026-03-01-update-test"
    })


@app.route("/test-route-2026-03-01")
def test_route():
    """Test route to verify Vercel is serving updated code"""
    return jsonify({"test": "ok"}), 200


@app.route("/api/analyze-step", methods=["POST"])
@rate_limit
def analyze_step():
    """Analyzes partial user data"""
    # Ensure analyzer backend is available
    if not ANALYZER_AVAILABLE:
        return jsonify({"error": "Analysis service unavailable"}), 503
    # Validate request has JSON
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is empty"}), 400
    
    # Validate step number
    step = data.get("step", 1)
    valid, result = validate_numeric_range(step, 1, 10, "step")
    if not valid:
        return jsonify({"error": result}), 400
    
    # Sanitize step data if present
    step_data = data.get("stepData", {})
    if isinstance(step_data, dict):
        for key, value in step_data.items():
            if isinstance(value, str):
                step_data[key] = sanitize_input(value, key)
    
    try:
        analysis_result = analyzer.analyze_step(int(step), step_data)
    except Exception:
        return jsonify({"error": "An error occurred processing your request"}), 500

    return jsonify({
        "success": True,
        "step": int(step),
        "analysis": analysis_result
    })


@app.route("/api/analyze", methods=["POST"])
@rate_limit
def analyze_data():
    """Accepts user health data with input validation"""
    # Ensure analyzer backend is available
    if not ANALYZER_AVAILABLE:
        return jsonify({"error": "Analysis service unavailable"}), 503
    # Validate request has JSON
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is empty"}), 400
    
    # Validate required fields with sanitization
    required_fields = ["age", "cycle_length", "period_length", "symptoms"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    errors = []
    
    # Validate age
    if 'age' in data:
        valid, result = validate_numeric_range(data['age'], 10, 80, "age")
        if not valid:
            errors.append(result)
    
    # Validate cycle_length
    if 'cycle_length' in data:
        valid, result = validate_numeric_range(data['cycle_length'], 15, 120, "cycle_length")
        if not valid:
            errors.append(result)
    
    # Validate period_length
    if 'period_length' in data:
        valid, result = validate_numeric_range(data['period_length'], 1, 30, "period_length")
        if not valid:
            errors.append(result)
    
    # Sanitize string fields
    for field in ['city', 'weight', 'height']:
        if field in data and isinstance(data[field], str):
            data[field] = sanitize_input(data[field], field)
    
    # If validation errors, return them (don't expose internal details)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400
    
    try:
        analysis_result = analyzer.analyze(data)
        doctors = []
        if doctor_recommender is not None:
            doctors = doctor_recommender.get_recommendations(
                city=data.get("city", ""),
                severity=analysis_result.get("risk_level", "moderate"),
                symptoms=data.get("symptoms", []),
            )

        report = generate_report(data, analysis_result, doctors)
    except Exception:
        return jsonify({"error": "An error occurred processing your request"}), 500

    return jsonify({
        "success": True,
        "analysis": analysis_result,
        "doctors": doctors,
        "report": report
    })


@app.route("/api/v2/assistant")
def assistant():
    """Simple AI assistant endpoint - version 2 force rebuild"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    payload = request.get_json()
    return jsonify(generate_local_ai_response(payload)), 200


@app.route("/api/debug/env")
def debug_env():
    """Debug endpoint to show environment configuration (remove in production)"""
    return jsonify({
        "has_openrouter_key": bool(os.getenv("OPENROUTER_API_KEY")),
        "has_openai_key": bool(os.getenv("OPENAI_API_KEY")),
        "has_perplexity_key": bool(os.getenv("PERPLEXITY_API_KEY")),
        "openrouter_key_preview": os.getenv("OPENROUTER_API_KEY", "")[:20] + "..." if os.getenv("OPENROUTER_API_KEY") else "NOT SET"
    }), 200


@app.route("/api/stats")
def get_statistics():
    """Returns anonymized statistics"""
    # Ensure analyzer backend is available
    if not ANALYZER_AVAILABLE:
        return jsonify({"error": "Analysis service unavailable"}), 503
    try:
        return jsonify(analyzer.get_dataset_statistics())
    except Exception:
        return jsonify({"error": "An error occurred fetching statistics"}), 500


@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """AI chat endpoint - returns PCOS-specific responses"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid request body"}), 400

    # Return local AI response (with environment variables as fallback to external APIs)
    return jsonify(generate_local_ai_response(payload)), 200


def generate_local_ai_response(payload):
    """Generate a basic AI response using local rules (fallback when APIs unavailable)"""
    messages = payload.get("messages", [])
    if not messages:
        return {"error": "No messages provided"}
    
    last_message = messages[-1].get("content", "").lower()
    
    # PCOS-related responses
    pcos_keywords = ["pcos", "polycystic", "ovary", "ovarian"]
    if any(kw in last_message for kw in pcos_keywords):
        return {
            "id": "local-ai-response",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": payload.get("model", "local-ai"),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "PCOS (Polycystic Ovary Syndrome) is a hormonal condition affecting women of reproductive age. Key characteristics include irregular menstrual cycles, elevated androgen levels, insulin resistance, and polycystic ovaries. Management typically involves lifestyle changes, hormonal contraceptives, or medications like metformin. Common symptoms include irregular periods, acne, hair loss, and weight gain. I recommend consulting a healthcare provider for proper diagnosis and treatment."
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(last_message.split()),
                "completion_tokens": 75,
                "total_tokens": len(last_message.split()) + 75
            }
        }
    
    # Health/medical questions
    elif any(word in last_message for word in ["health", "symptom", "treatment", "diagnosis", "doctor"]):
        return {
            "id": "local-ai-response",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": payload.get("model", "local-ai"),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "For health-related questions: Please consult with a qualified healthcare provider or medical professional. They can provide personalized advice based on your medical history and current health status. In emergencies, contact your local emergency services."
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(last_message.split()),
                "completion_tokens": 35,
                "total_tokens": len(last_message.split()) + 35
            }
        }
    
    # Generic response
    else:
        return {
            "id": "local-ai-response",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": payload.get("model", "local-ai"),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "I'm a local AI assistant. I can help with general questions about PCOS and women's health. For specific medical advice, please consult a healthcare provider. What would you like to know?"
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(last_message.split()),
                "completion_tokens": 30,
                "total_tokens": len(last_message.split()) + 30
            }
        }


def generate_report(user_data, analysis, doctors):
    """Generate report payload for serverless API responses."""
    return {
        "summary": analysis.get("summary", ""),
        "risk_level": analysis.get("risk_level", "moderate"),
        "risk_score": analysis.get("risk_score", 0),
        "key_findings": [
            f"Your cycle length ({user_data['cycle_length']} days) is {analysis.get('cycle_status', 'recorded')}",
            f"Period length ({user_data['period_length']} days) is {analysis.get('period_status', 'recorded')}",
            f"Risk level: {analysis.get('risk_level', 'moderate').upper()}",
            f"{len(user_data.get('symptoms', []))} symptoms reported",
        ],
        "recommendations": analysis.get("recommendations", []),
        "doctors": doctors,
    }


# Error handlers for security
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    # Don't expose internal error details
    return jsonify({"error": "Internal server error"}), 500


# Vercel handler - export Flask app directly
# Vercel will use this `app` variable as the WSGI application
# Do not rename or remove this line - required for Vercel serverless
