"""
PCOS Smart Assistant - Backend API
Analyzes user data, generates health reports, and recommends doctors
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from supabase._sync.client import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Import analysis modules
from analysis_engine import PCOSAnalyzer
from doctor_recommendations import DoctorRecommender

load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
# Serve form.html and other static files
@app.route("/form.html")
def serve_form():
    return send_from_directory(app.static_folder, "form.html")

# Optionally serve index.html at root
@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")
CORS(app)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for backend
SKIP_SUPABASE = os.getenv("SKIP_SUPABASE") == "1"

if SKIP_SUPABASE or not SUPABASE_URL or not SUPABASE_KEY:
    supabase = None
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize analyzers
analyzer = PCOSAnalyzer(supabase)
doctor_recommender = DoctorRecommender()


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "PCOS Smart Assistant API"}), 200


@app.route("/api/analyze-step", methods=["POST"])
def analyze_step():
    """
    Analyzes partial user data after each step and returns incremental insights.
    This provides step-by-step feedback as user progresses through the form.
    """
    try:
        data = request.json
        step = data.get("step", 1)
        step_data = data.get("stepData", {})
        
        # Perform incremental analysis based on current step
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
    try:
        data = request.json

        # Validate required fields
        required = ["age", "cycle_length", "period_length", "symptoms"]
        if not all(field in data for field in required):
            return jsonify({"error": "Missing required fields"}), 400

        # Save to Supabase
        entry_id = save_entry(data)

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

    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_statistics():
    """
    Returns anonymized statistics from the dataset
    """
    try:
        stats = analyzer.get_dataset_statistics()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def save_entry(data):
    """Save user entry to Supabase"""
    try:
        if supabase is None:
            print("Supabase is not configured. Skipping entry save.")
            return None
        result = (
            supabase.table("pcos_entries")
            .insert({**data, "timestamp": datetime.now().isoformat()})
            .execute()
        )
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving entry: {e}")
        return None


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


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    is_production = os.getenv("FLASK_ENV") == "production"
    app.run(host="0.0.0.0", port=port, debug=not is_production)
