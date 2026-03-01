"""
Vercel Python API for PCOS Smart Assistant
Security hardened version
"""

from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import json
import re
from functools import wraps
import time

# Create Flask app
app = Flask(__name__)

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

# Analyzer availability: attempt to reuse backend analyzer if present
ANALYZER_AVAILABLE = False
analyzer = None
doctor_recommender = None
try:
    from backend import app as backend_app
    analyzer = getattr(backend_app, "analyzer", None)
    doctor_recommender = getattr(backend_app, "doctor_recommender", None)
    ANALYZER_AVAILABLE = analyzer is not None
except Exception:
    ANALYZER_AVAILABLE = False

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
        "service": "PCOS Smart Assistant API"
    })


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


# Vercel handler - return WSGI app
app_wsgi = app.wsgi_app
