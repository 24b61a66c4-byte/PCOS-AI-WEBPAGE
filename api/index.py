"""
Vercel Python API for PCOS Smart Assistant
Simplified version that works with Vercel's serverless functions
"""

import os
import sys

# Add backend directory to path for imports
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Try to import analysis modules
ANALYZER_AVAILABLE = False
analyzer = None
doctor_recommender = None

try:
    from analysis_engine import PCOSAnalyzer
    from doctor_recommendations import DoctorRecommender
    analyzer = PCOSAnalyzer(None)
    doctor_recommender = DoctorRecommender()
    ANALYZER_AVAILABLE = True
except Exception as e:
    print(f"Analysis modules not available: {e}")

# Create Flask app
app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "PCOS Smart Assistant API",
        "analyzer_available": ANALYZER_AVAILABLE
    }), 200


@app.route("/api/analyze-step", methods=["POST"])
def analyze_step():
    """
    Analyzes partial user data after each step and returns incremental insights.
    """
    if not ANALYZER_AVAILABLE:
        # Return mock data when analyzer is not available
        data = request.json or {}
        step = data.get("step", 1)
        return jsonify({
            "success": True,
            "step": step,
            "analysis": {
                "findings": ["Analysis service is in demo mode"],
                "tips": ["Configure backend for full analysis"],
                "has_sufficient_data": step >= 6
            }
        }), 200
        
    try:
        data = request.json
        step = data.get("step", 1)
        step_data = data.get("stepData", {})
        
        analysis_result = analyzer.analyze_step(step, step_data)
        
        return jsonify({
            "success": True,
            "step": step,
            "analysis": analysis_result
        }), 200
        
    except Exception as e:
        print(f"Error in step analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_data():
    """
    Accepts user health data and returns comprehensive analysis
    """
    if not ANALYZER_AVAILABLE:
        # Return mock analysis when analyzer is not available
        data = request.json or {}
        return jsonify({
            "success": True,
            "analysis": {
                "risk_score": 45,
                "risk_level": "moderate",
                "cycle_status": "within normal range",
                "period_status": "within normal range",
                "summary": "This is a demo response. Configure the backend analysis engine for full functionality.",
                "recommendations": ["Consult a healthcare provider for proper diagnosis"],
                "dataset_avg_cycle": 28,
                "dataset_avg_period": 5,
                "percentile": 50
            },
            "doctors": [],
            "report": {
                "summary": "Demo mode - configure backend for full analysis",
                "risk_level": "moderate",
                "risk_score": 45,
                "key_findings": ["Demo mode active"],
                "recommendations": ["Set up backend analysis engine"],
                "lifestyle_tips": ["Maintain healthy lifestyle"],
                "when_to_see_doctor": ["Consult for proper diagnosis"],
                "next_steps": ["Configure full backend"]
            }
        }), 200

    try:
        data = request.json

        # Validate required fields
        required = ["age", "cycle_length", "period_length", "symptoms"]
        if not all(field in data for field in required):
            return jsonify({"error": "Missing required fields"}), 400

        # Perform analysis
        analysis_result = analyzer.analyze(data)

        # Get doctor recommendations based on city and severity
        doctors = doctor_recommender.get_recommendations(
            city=data.get("city", ""),
            severity=analysis_result["risk_level"],
            symptoms=data.get("symptoms", []),
        )

        # Generate complete report
        report = generate_report(data, analysis_result, doctors)

        return jsonify({
            "success": True,
            "analysis": analysis_result,
            "doctors": doctors,
            "report": report,
        }), 200

    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_statistics():
    """
    Returns anonymized statistics from the dataset
    """
    if not ANALYZER_AVAILABLE:
        # Return demo stats
        return jsonify({
            "total_entries": 0,
            "avg_cycle_length": 28,
            "avg_period_length": 5,
            "pcos_percentage": 0,
            "most_common_symptoms": [],
            "age_distribution": {}
        }), 200
        
    try:
        stats = analyzer.get_dataset_statistics()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_report(user_data, analysis, doctors):
    """Generate comprehensive health report"""
    report = {
        "summary": analysis.get("summary", ""),
        "risk_level": analysis.get("risk_level", "unknown"),
        "risk_score": analysis.get("risk_score", 0),
        "key_findings": [
            f"Your cycle length ({user_data.get('cycle_length', 'N/A')} days) is {analysis.get('cycle_status', 'N/A')}",
            f"Period length ({user_data.get('period_length', 'N/A')} days) is {analysis.get('period_status', 'N/A')}",
            f"Risk level: {analysis.get('risk_level', 'unknown').upper()}",
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
            "your_cycle": user_data.get("cycle_length", 0),
            "dataset_average": analysis.get("dataset_avg_cycle", 28),
            "percentile": analysis.get("percentile", 50),
        },
    }
    return report


# Vercel handler - use Flask's WSGI app
def handler(request):
    """Vercel serverless handler"""
    return app.wsgi_app(request.environ, start_response)

def start_response(status, headers):
    """WSGI start_response callable"""
    return lambda x: None
