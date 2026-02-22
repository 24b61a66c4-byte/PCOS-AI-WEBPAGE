"""
pytest configuration and fixtures for backend tests
"""

import pytest
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "age": 25,
        "cycle_length": 28,
        "period_length": 5,
        "last_period": "2024-01-15",
        "symptoms": ["acne", "weight_gain"],
        "activity": "moderate",
        "sleep": 7,
        "stress": "moderate",
        "diet": "vegetarian",
        "city": "New York",
        "pcos": "not_diagnosed",
        "medications": "",
    }


@pytest.fixture
def high_risk_user_data():
    """High risk user data for testing"""
    return {
        "age": 25,
        "cycle_length": 45,
        "period_length": 10,
        "last_period": "2024-01-01",
        "symptoms": [
            "irregular_cycles",
            "hirsutism",
            "acne",
            "weight_gain",
            "hair_loss",
        ],
        "activity": "sedentary",
        "sleep": 5,
        "stress": "high",
        "diet": "",
        "city": "Los Angeles",
        "pcos": "diagnosed",
        "medications": "Metformin",
    }


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing"""
    from unittest.mock import Mock

    client = Mock()

    # Mock table().select().execute()
    mock_response = Mock()
    mock_response.data = [
        {"cycle_length": "28", "period_length": "5", "pcos": "Yes", "age": "25"},
        {"cycle_length": "30", "period_length": "6", "pcos": "No", "age": "28"},
    ]

    client.table.return_value.select.return_value.execute.return_value = mock_response

    # Mock table().insert()
    client.table.return_value.insert.return_value.execute.return_value = mock_response

    return client
