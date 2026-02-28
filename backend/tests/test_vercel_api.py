"""
Tests for the Vercel serverless API wrapper in api/index.py.
"""

import importlib
import json
import os
import sys
from unittest.mock import Mock

import pytest


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

api_module = importlib.import_module("api.index")


@pytest.fixture
def client():
    api_module.app.config["TESTING"] = True
    with api_module.app.test_client() as test_client:
        yield test_client


def test_api_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "PCOS Smart Assistant API" in data["service"]


def test_analyze_step_returns_503_when_analyzer_unavailable(client, monkeypatch):
    monkeypatch.setattr(api_module, "ANALYZER_AVAILABLE", False)

    response = client.post(
        "/api/analyze-step",
        data=json.dumps({"step": 1, "stepData": {"age": 25}}),
        content_type="application/json",
    )

    assert response.status_code == 503
    assert response.get_json()["error"] == "Analysis service unavailable"


def test_analyze_returns_400_when_required_fields_missing(client, monkeypatch):
    mock_analyzer = Mock()
    monkeypatch.setattr(api_module, "ANALYZER_AVAILABLE", True)
    monkeypatch.setattr(api_module, "analyzer", mock_analyzer)

    response = client.post(
        "/api/analyze",
        data=json.dumps({"age": 25, "cycle_length": 28}),
        content_type="application/json",
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "Missing required fields"
    mock_analyzer.analyze.assert_not_called()


def test_analyze_step_returns_incremental_insight(client, monkeypatch):
    mock_analyzer = Mock()
    mock_analyzer.analyze_step.return_value = {"tip": "Track hydration."}

    monkeypatch.setattr(api_module, "ANALYZER_AVAILABLE", True)
    monkeypatch.setattr(api_module, "analyzer", mock_analyzer)

    payload = {"step": 3, "stepData": {"symptoms": ["acne"]}}
    response = client.post(
        "/api/analyze-step",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["step"] == 3
    assert data["analysis"] == {"tip": "Track hydration."}
    mock_analyzer.analyze_step.assert_called_once_with(3, {"symptoms": ["acne"]})


def test_analyze_returns_full_payload(client, monkeypatch):
    mock_analyzer = Mock()
    mock_analyzer.analyze.return_value = {
        "risk_score": 48,
        "risk_level": "moderate",
        "cycle_status": "slightly irregular",
        "period_status": "within normal range",
        "summary": "Moderate risk profile.",
        "recommendations": ["Keep tracking symptoms."],
        "dataset_avg_cycle": 28,
        "percentile": 54,
    }
    mock_analyzer.get_dataset_statistics.return_value = {"total_entries": 120}

    mock_doctors = Mock()
    mock_doctors.get_recommendations.return_value = {
        "primary_doctors": [{"name": "Dr. Demo", "specialty": "Gynecologist"}]
    }

    monkeypatch.setattr(api_module, "ANALYZER_AVAILABLE", True)
    monkeypatch.setattr(api_module, "analyzer", mock_analyzer)
    monkeypatch.setattr(api_module, "doctor_recommender", mock_doctors)

    payload = {
        "age": 26,
        "cycle_length": 34,
        "period_length": 5,
        "symptoms": ["acne"],
        "city": "Hyderabad",
    }

    response = client.post(
        "/api/analyze",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["analysis"]["risk_level"] == "moderate"
    assert "report" in data
    assert "doctors" in data
    assert "key_findings" in data["report"]
    mock_analyzer.analyze.assert_called_once()
    mock_doctors.get_recommendations.assert_called_once()


def test_stats_returns_503_when_analyzer_unavailable(client, monkeypatch):
    monkeypatch.setattr(api_module, "ANALYZER_AVAILABLE", False)

    response = client.get("/api/stats")

    assert response.status_code == 503
    assert response.get_json()["error"] == "Analysis service unavailable"

