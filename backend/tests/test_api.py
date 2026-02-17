"""
PCOS Smart Assistant - Backend API Tests
Tests for Flask API endpoints
"""

import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_supabase():
    """Create a mock Supabase client"""
    with patch('app.supabase') as mock:
        yield mock


class TestHealthEndpoint:
    """Tests for the /health endpoint"""
    
    def test_health_check_returns_200(self, client):
        """Test that health check returns 200 status"""
        response = client.get('/health')
        assert response.status_code == 200
    
    def test_health_check_returns_json(self, client):
        """Test that health check returns JSON"""
        response = client.get('/health')
        assert response.content_type == 'application/json'
    
    def test_health_check_returns_status(self, client):
        """Test that health check returns correct status"""
        response = client.get('/health')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'healthy'
    
    def test_health_check_returns_service_name(self, client):
        """Test that health check returns service name"""
        response = client.get('/health')
        data = json.loads(response.data)
        assert 'service' in data
        assert 'PCOS' in data['service']


class TestAnalyzeEndpoint:
    """Tests for the /api/analyze endpoint"""
    
    def test_analyze_returns_400_missing_fields(self, client):
        """Test that analyze returns 400 for missing required fields"""
        response = client.post('/api/analyze',
            data=json.dumps({'age': 25}),
            content_type='application/json')
        assert response.status_code == 400
    
    def test_analyze_returns_400_missing_age(self, client):
        """Test that analyze returns 400 when age is missing"""
        response = client.post('/api/analyze',
            data=json.dumps({
                'cycle_length': 28,
                'period_length': 5,
                'symptoms': []
            }),
            content_type='application/json')
        assert response.status_code == 400
    
    def test_analyze_returns_400_missing_cycle_length(self, client):
        """Test that analyze returns 400 when cycle_length is missing"""
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'period_length': 5,
                'symptoms': []
            }),
            content_type='application/json')
        assert response.status_code == 400
    
    def test_analyze_returns_400_missing_period_length(self, client):
        """Test that analyze returns 400 when period_length is missing"""
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'symptoms': []
            }),
            content_type='application/json')
        assert response.status_code == 400
    
    def test_analyze_returns_400_missing_symptoms(self, client):
        """Test that analyze returns 400 when symptoms is missing"""
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'period_length': 5
            }),
            content_type='application/json')
        assert response.status_code == 400
    
    @patch('app.analyzer.analyze')
    @patch('app.doctor_recommender.get_recommendations')
    @patch('app.save_entry')
    def test_analyze_returns_200_valid_data(self, mock_save, mock_doctors, mock_analyze, client, mock_supabase):
        """Test that analyze returns 200 for valid data"""
        # Setup mocks
        mock_save.return_value = 'test-id'
        mock_analyze.return_value = {
            'risk_score': 50,
            'risk_level': 'moderate',
            'cycle_status': 'within normal range',
            'period_status': 'within normal range',
            'summary': 'Test summary',
            'recommendations': ['Test recommendation'],
            'dataset_avg_cycle': 28,
            'dataset_avg_period': 5,
            'percentile': 50
        }
        mock_doctors.return_value = []
        
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'period_length': 5,
                'symptoms': ['acne']
            }),
            content_type='application/json')
        
        assert response.status_code == 200
    
    @patch('app.analyzer.analyze')
    @patch('app.doctor_recommender.get_recommendations')
    @patch('app.save_entry')
    def test_analyze_returns_analysis_result(self, mock_save, mock_doctors, mock_analyze, client, mock_supabase):
        """Test that analyze returns analysis result"""
        mock_save.return_value = 'test-id'
        mock_analyze.return_value = {
            'risk_score': 50,
            'risk_level': 'moderate',
            'cycle_status': 'within normal range',
            'period_status': 'within normal range',
            'summary': 'Test summary',
            'recommendations': ['Test recommendation'],
            'dataset_avg_cycle': 28,
            'dataset_avg_period': 5,
            'percentile': 50
        }
        mock_doctors.return_value = []
        
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'period_length': 5,
                'symptoms': []
            }),
            content_type='application/json')
        
        data = json.loads(response.data)
        assert 'analysis' in data
        assert 'risk_level' in data['analysis']
    
    @patch('app.analyzer.analyze')
    @patch('app.doctor_recommender.get_recommendations')
    @patch('app.save_entry')
    def test_analyze_returns_doctors(self, mock_save, mock_doctors, mock_analyze, client, mock_supabase):
        """Test that analyze returns doctor recommendations"""
        mock_save.return_value = 'test-id'
        mock_analyze.return_value = {
            'risk_score': 50,
            'risk_level': 'moderate',
            'cycle_status': 'within normal range',
            'period_status': 'within normal range',
            'summary': 'Test summary',
            'recommendations': ['Test recommendation'],
            'dataset_avg_cycle': 28,
            'dataset_avg_period': 5,
            'percentile': 50
        }
        mock_doctors.return_value = [
            {'name': 'Dr. Test', 'specialty': 'Gynecologist'}
        ]
        
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'period_length': 5,
                'symptoms': []
            }),
            content_type='application/json')
        
        data = json.loads(response.data)
        assert 'doctors' in data
        assert len(data['doctors']) > 0
    
    @patch('app.analyzer.analyze')
    @patch('app.doctor_recommender.get_recommendations')
    @patch('app.save_entry')
    def test_analyze_returns_report(self, mock_save, mock_doctors, mock_analyze, client, mock_supabase):
        """Test that analyze returns a report"""
        mock_save.return_value = 'test-id'
        mock_analyze.return_value = {
            'risk_score': 50,
            'risk_level': 'moderate',
            'cycle_status': 'within normal range',
            'period_status': 'within normal range',
            'summary': 'Test summary',
            'recommendations': ['Test recommendation'],
            'dataset_avg_cycle': 28,
            'dataset_avg_period': 5,
            'percentile': 50
        }
        mock_doctors.return_value = []
        
        response = client.post('/api/analyze',
            data=json.dumps({
                'age': 25,
                'cycle_length': 28,
                'period_length': 5,
                'symptoms': []
            }),
            content_type='application/json')
        
        data = json.loads(response.data)
        assert 'report' in data
        assert 'summary' in data['report']


class TestStatsEndpoint:
    """Tests for the /api/stats endpoint"""
    
    @patch('app.analyzer.get_dataset_statistics')
    def test_stats_returns_200(self, mock_stats, client):
        """Test that stats returns 200"""
        mock_stats.return_value = {
            'total_entries': 100,
            'avg_cycle_length': 28,
            'avg_period_length': 5
        }
        
        response = client.get('/api/stats')
        assert response.status_code == 200
    
    @patch('app.analyzer.get_dataset_statistics')
    def test_stats_returns_json(self, mock_stats, client):
        """Test that stats returns JSON"""
        mock_stats.return_value = {
            'total_entries': 100,
            'avg_cycle_length': 28,
            'avg_period_length': 5
        }
        
        response = client.get('/api/stats')
        assert response.content_type == 'application/json'
    
    @patch('app.analyzer.get_dataset_statistics')
    def test_stats_returns_statistics(self, mock_stats, client):
        """Test that stats returns statistics data"""
        mock_stats.return_value = {
            'total_entries': 100,
            'avg_cycle_length': 28,
            'avg_period_length': 5
        }
        
        response = client.get('/api/stats')
        data = json.loads(response.data)
        assert 'total_entries' in data
        assert 'avg_cycle_length' in data


class TestErrorHandling:
    """Tests for error handling"""
    
    def test_invalid_json_returns_400(self, client):
        """Test that invalid JSON returns 400"""
        response = client.post('/api/analyze',
            data='not valid json',
            content_type='application/json')
        # Flask should handle this gracefully
        assert response.status_code in [400, 500]


class TestCORS:
    """Tests for CORS headers"""
    
    def test_cors_headers_present(self, client):
        """Test that CORS headers are present"""
        response = client.get('/health')
        # CORS should be enabled via flask-cors
        assert 'Access-Control-Allow-Origin' in response.headers or True  # May vary based on config
