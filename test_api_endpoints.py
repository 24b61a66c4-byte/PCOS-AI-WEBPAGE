#!/usr/bin/env python3
"""Test the API endpoints to verify the analyzer is working"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_analyze_step():
    """Test the /api/analyze-step endpoint"""
    print("\n=== Testing /api/analyze-step ===")
    
    # Test Step 1: Personal Information
    payload = {
        "step": 1,
        "stepData": {"age": 28}
    }
    
    response = requests.post(f"{BASE_URL}/api/analyze-step", json=payload)
    print(f"Step 1 Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        assert data["success"] == True
        assert data["analysis"]["findings"] != []
        print("✓ Step 1 analysis working!")
    else:
        print(f"✗ Error: {response.text}")
    
    # Test Step 2: Menstrual Cycle
    payload = {
        "step": 2,
        "stepData": {"cycle_length": 42}
    }
    
    response = requests.post(f"{BASE_URL}/api/analyze-step", json=payload)
    print(f"\nStep 2 Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        assert data["success"] == True
        print("✓ Step 2 analysis working!")


def test_analyze():
    """Test the /api/analyze endpoint"""
    print("\n=== Testing /api/analyze ===")
    
    payload = {
        "age": 28,
        "cycle_length": 42,
        "period_length": 7,
        "symptoms": ["irregular_cycles", "acne", "weight_gain"]
    }
    
    response = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    print(f"Full Analysis Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Analysis endpoint working!")
        print(f"  - Risk Level: {data['analysis'].get('risk_level', 'N/A')}")
        print(f"  - Findings: {len(data['analysis'].get('findings', []))} items")
        print(f"  - Report Generated: {bool(data.get('report'))}")
    else:
        print(f"✗ Error: {response.text}")


def test_health():
    """Test the /api/health endpoint"""
    print("\n=== Testing /api/health ===")
    
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Health Check Response: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        print(f"✓ Health check passed!")


if __name__ == "__main__":
    print("Testing PCOS API Endpoints...")
    
    try:
        test_health()
        test_analyze_step()
        test_analyze()
        print("\n✓ All API tests passed!")
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to server at http://localhost:5000")
        print("  Make sure the Flask server is running: python backend/app.py")
    except AssertionError as e:
        print(f"✗ Assertion failed: {e}")
    except Exception as e:
        print(f"✗ Error: {e}")
