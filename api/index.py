"""
Vercel Python API for PCOS Smart Assistant
"""

from flask import Flask, jsonify, Response
from flask_cors import CORS
import json

# Create Flask app
app = Flask(__name__)
CORS(app)


@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "PCOS Smart Assistant API"
    })


@app.route("/api/analyze-step", methods=["POST"])
def analyze_step():
    """Analyzes partial user data"""
    return jsonify({
        "success": True,
        "step": 1,
        "analysis": {
            "findings": ["Demo mode"],
            "tips": ["Configure backend for full analysis"],
            "has_sufficient_data": False
        }
    })


@app.route("/api/analyze", methods=["POST"])
def analyze_data():
    """Accepts user health data"""
    return jsonify({
        "success": True,
        "analysis": {
            "risk_score": 45,
            "risk_level": "moderate",
            "summary": "Demo response - configure backend for full analysis"
        },
        "doctors": [],
        "report": {"summary": "Demo mode"}
    })


@app.route("/api/stats")
def get_statistics():
    """Returns statistics"""
    return jsonify({
        "total_entries": 0,
        "avg_cycle_length": 28,
        "avg_period_length": 5
    })


# Vercel handler - return WSGI app
app_wsgi = app.wsgi_app
