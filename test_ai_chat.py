#!/usr/bin/env python3
"""Test the AI chat endpoint"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_ai_chat():
    """Test the /api/ai/chat endpoint"""
    print("\n=== Testing /api/ai/chat ===")
    
    payload = {
        "model": "gpt-3.5-turbo",  # or any OpenRouter/OpenAI model
        "messages": [
            {
                "role": "user",
                "content": "Hello! Can you briefly explain what PCOS is?"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ AI Chat is working!")
            print(f"\nAI Response:")
            print("-" * 60)
            if "choices" in data and len(data["choices"]) > 0:
                message = data["choices"][0].get("message", {})
                content = message.get("content", "No content")
                print(content[:300] + "..." if len(content) > 300 else content)
            else:
                print(json.dumps(data, indent=2))
            print("-" * 60)
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Error: Could not connect to server")
        print("  Make sure the Flask server is running: python backend/app.py")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    print("Testing AI Chat Endpoint...")
    test_ai_chat()
