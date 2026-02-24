"""
Vercel Python API for PCOS Smart Assistant
This file wraps the Flask app to work with Vercel's serverless functions
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Import analysis modules
try:
    from analysis_engine import PCOSAnalyzer
    from doctor_recommendations import DoctorRecommender
    ANALYZER_AVAILABLE = True
except ImportError:
    ANALYZER_AVAILABLE = False
    print("Warning: Analysis modules not available in Vercel environment")

# Create Flask app
app = Flask(__name__)
CORS(app)

# Initialize analyzers (if available)
if ANALYZER_AVAILABLE:
    analyzer = PCOSAnalyzer(None)  # No Supabase in serverless for now
    doctor_recommender = DoctorRecommender()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "PCOS Smart Assistant API"}), 200


@app.route("/api/analyze-step", methods=["POST"])
def analyze_step():
    """
    Analyzes partial user data after each step and returns incremental insights.
    """
    if not ANALYZER_AVAILABLE:
        return jsonify({"error": "Analysis service unavailable"}), 503
        
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
        return jsonify({"error": "Analysis service unavailable"}), 503
        
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
        return jsonify({"error": "Analysis service unavailable"}), 503
        
    try:
        stats = analyzer.get_dataset_statistics()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_report(user_data, analysis, doctors):
    """Generate comprehensive health report"""
    report = {
        "summary": analysis["summary"],
        "risk_level": analysis["risk_level"],
        "risk_score": analysis["risk_score"],
        "key_findings": [
            f"Your cycle length ({user_data['cycle_length']} days) is {analysis['cycle_status']}",
            f"Period length ({user_data['period_length']} days) is {analysis['period_status']}",
            f"Risk level: {analysis['risk_level'].upper()}",
            f"{len(user_data.get('symptoms', []))} symptoms reported",
        ],
        "recommendations": analysis["recommendations"],
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


# Vercel handler
def handler(request):
    """Vercel serverless handler"""
    return app(request.environ, lambda status, headers: status, headers)
