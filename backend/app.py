"""
PCOS Smart Assistant - Backend API
Analyzes user data, generates health reports, and recommends doctors
"""

from flask import Flask, request, jsonify, send_from_directory
from marshmallow import Schema, fields, ValidationError
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import re
import time
from functools import wraps

# Optional external imports guarded to avoid import-time failures in tests
try:
    from supabase._sync.client import create_client
except Exception:
    create_client = None

try:
    from analysis_engine import PCOSAnalyzer
except Exception:
    PCOSAnalyzer = None

try:
    from doctor_recommendations import DoctorRecommender
except Exception:
    DoctorRecommender = None

import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pcos-backend")

load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")

# Configure CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
]
if os.getenv("VERCEL_URL"):
    ALLOWED_ORIGINS.append(f"https://{os.getenv('VERCEL_URL')}")

CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=False)


@app.after_request
def add_security_headers(response):
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers[
        "Content-Security-Policy"
    ] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Rate limiting
rate_limit_store = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "60"))
RATE_LIMIT_WINDOW = 60

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if os.getenv("SKIP_RATE_LIMIT") == "1":
            return f(*args, **kwargs)

        ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip:
            ip = ip.split(",")[0].strip()

        current_time = time.time()
        history = [t for t in rate_limit_store.get(ip, []) if current_time - t < RATE_LIMIT_WINDOW]
        rate_limit_store[ip] = history

        if len(rate_limit_store.get(ip, [])) >= RATE_LIMIT:
            return (
                jsonify({"error": "Rate limit exceeded. Please try again later.", "retry_after": RATE_LIMIT_WINDOW}),
                429,
            )

        rate_limit_store.setdefault(ip, []).append(current_time)
        return f(*args, **kwargs)

    return decorated_function


def sanitize_input(data):
    if not isinstance(data, str):
        return data
    sanitized = re.sub(r"[<>\"']", "", data)
    return sanitized.strip()


# Serve static pages
@app.route("/form.html")
def serve_form():
    return send_from_directory(app.static_folder, "form.html")


@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")


# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SKIP_SUPABASE = os.getenv("SKIP_SUPABASE") == "1"

if SKIP_SUPABASE or not SUPABASE_URL or not SUPABASE_KEY or create_client is None:
    supabase = None
    logger.info("Supabase is not configured. Skipping persistence.")
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        supabase = None


# Initialize analyzers if available
if PCOSAnalyzer is not None:
    try:
        analyzer = PCOSAnalyzer(supabase)
    except Exception:
        analyzer = None
else:
    analyzer = None

if DoctorRecommender is not None:
    try:
        doctor_recommender = DoctorRecommender()
    except Exception:
        doctor_recommender = None
else:
    doctor_recommender = None


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "PCOS Smart Assistant API"}), 200


@app.route("/api/analyze-step", methods=["POST"])
@rate_limit
def analyze_step():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is empty"}), 400

        step = data.get("step", 1)
        if not isinstance(step, int) or step < 1 or step > 10:
            return jsonify({"error": "Step must be between 1 and 10"}), 400

        step_data = data.get("stepData", {})
        if isinstance(step_data, dict):
            for k, v in step_data.items():
                if isinstance(v, str):
                    step_data[k] = sanitize_input(v)

        if analyzer is None:
            return jsonify({"error": "Analyzer not available"}), 503

        analysis_result = analyzer.analyze_step(step, step_data)
        return jsonify({"success": True, "step": step, "analysis": analysis_result}), 200

    except ValidationError as ve:
        logger.error(f"Validation error: {ve.messages}")
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        logger.error(f"Error in step analysis: {e}")
        return jsonify({"error": str(e)}), 500


class AnalyzeSchema(Schema):
    age = fields.Integer(required=True, validate=lambda x: 10 <= x <= 80)
    cycle_length = fields.Integer(required=True, validate=lambda x: 15 <= x <= 120)
    period_length = fields.Integer(required=True, validate=lambda x: 1 <= x <= 30)
    symptoms = fields.List(fields.String(), required=True)
    city = fields.String()
    weight = fields.Float()
    height = fields.Float()


@app.route("/api/analyze", methods=["POST"])
@rate_limit
def analyze_data():
    try:
        data = request.json
        schema = AnalyzeSchema()
        validated = schema.load(data)

        entry_id = save_entry(validated)
        if analyzer is None:
            return jsonify({"error": "Analyzer not available"}), 503

        analysis_result = analyzer.analyze(validated)

        doctors = []
        if doctor_recommender is not None:
            try:
                doctors = doctor_recommender.get_recommendations(
                    city=validated.get("city", ""),
                    severity=analysis_result.get("risk_level"),
                    symptoms=validated.get("symptoms", []),
                )
            except Exception:
                doctors = []

        report = generate_report(validated, analysis_result, doctors)

        return (
            jsonify(
                {
                    "success": True,
                    "entry_id": entry_id,
                    "analysis": analysis_result,
                    "doctors": doctors,
                    "report": report,
                }
            ),
            200,
        )
    except ValidationError as ve:
        logger.error(f"Validation error: {ve.messages}")
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        logger.error(f"Error in analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_statistics():
    try:
        if analyzer is None:
            return jsonify({"error": "Analyzer not available"}), 503
        stats = analyzer.get_dataset_statistics()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ai/chat", methods=["POST"])
@rate_limit
def ai_chat():
    """Proxy AI chat requests to configured AI provider from the server.

    Supports: OpenRouter (primary - cheapest), OpenAI, Perplexity. Falls back to local AI if all fail.
    Expects JSON payload: {model, messages, temperature, max_tokens (optional)}
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid request body"}), 400

    # Basic validation to avoid misuse
    if "model" not in payload or "messages" not in payload:
        return jsonify({"error": "Missing required fields: model, messages"}), 400

    try:
        import requests

        # Try OpenRouter first (primary - cheapest)
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_key and openrouter_key != "sk-or-v1-...":
            try:
                OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openrouter_key}",
                    "HTTP-Referer": "https://pcos-zeta.vercel.app",
                    "X-Title": "PCOS AI Assistant",
                }
                resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=30)
                if resp.status_code == 200:
                    try:
                        return jsonify(resp.json()), 200
                    except Exception:
                        pass
                else:
                    logger.warning(f"OpenRouter returned {resp.status_code}, trying fallback...")
            except Exception as e:
                logger.warning(f"OpenRouter proxy error: {e}, trying OpenAI...")

        # Try OpenAI as fallback
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and openai_key != "sk-proj-...":
            try:
                OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}",
                }
                resp = requests.post(OPENAI_API_URL, json=payload, headers=headers, timeout=30)
                if resp.status_code == 200:
                    try:
                        return jsonify(resp.json()), 200
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"OpenAI proxy error: {e}, trying Perplexity...")

        # Try Perplexity as second fallback
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key and perplexity_key != "pplx-...":
            try:
                PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {perplexity_key}",
                }
                resp = requests.post(PERPLEXITY_API_URL, json=payload, headers=headers, timeout=30)
                if resp.status_code == 200:
                    try:
                        return jsonify(resp.json()), 200
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"Perplexity proxy error: {e}")

        # Fallback to local AI if all external APIs fail
        logger.info("Using local AI fallback (all external APIs unavailable)")
        return jsonify(generate_local_ai_response(payload)), 200

    except Exception as e:
        logger.error(f"AI proxy error: {e}")
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


def save_entry(data):
    try:
        if supabase is None:
            logger.info("Supabase not configured; skipping save")
            return None
        result = (
            supabase.table("pcos_entries").insert({**data, "timestamp": datetime.now().isoformat()}).execute()
        )
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        logger.error(f"Error saving entry: {e}")
        return None


def generate_report(user_data, analysis, doctors):
    report = {
        "summary": analysis.get("summary"),
        "risk_level": analysis.get("risk_level"),
        "risk_score": analysis.get("risk_score"),
        "key_findings": [
            f"Your cycle length ({user_data['cycle_length']} days) is {analysis.get('cycle_status')}",
            f"Period length ({user_data['period_length']} days) is {analysis.get('period_status')}",
            f"Risk level: {analysis.get('risk_level', '').upper()}",
            f"{len(user_data.get('symptoms', []))} symptoms reported",
        ],
        "recommendations": analysis.get("recommendations", []),
        "lifestyle_tips": [
            "Exercise 30 minutes daily to improve insulin sensitivity",
            "Maintain a balanced diet low in processed foods",
            "Get 7-8 hours of quality sleep",
            "Manage stress through yoga or meditation",
            "Track your cycle consistently for pattern recognition",
        ],
        "when_to_see_doctor": [
            "If irregular periods persist for more than 3 months",
            "Experiencing severe pelvic pain",
            "Difficulty conceiving after 6-12 months of trying",
            "Sudden weight changes or severe acne",
            "Heavy bleeding or periods lasting > 7 days",
        ],
        "next_steps": [
            "Consult with recommended gynecologist",
            "Get hormone level tests (testosterone, LH, FSH)",
            "Consider ultrasound if PCOS suspected",
            "Track symptoms for next 2-3 cycles",
            "Book appointment with nutritionist if needed",
        ],
        "comparison_to_dataset": {
            "your_cycle": user_data["cycle_length"],
            "dataset_average": analysis.get("dataset_avg_cycle", 28),
            "percentile": analysis.get("percentile", 50),
        },
    }

    return report


# Error handlers for security
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    # Don't expose internal error details
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    is_production = os.getenv("FLASK_ENV") == "production"
    logger.info(f"Starting PCOS Smart Assistant backend on port {port} (production={is_production})")
    app.run(host="0.0.0.0", port=port, debug=not is_production)
