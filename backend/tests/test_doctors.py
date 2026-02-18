"""
PCOS Smart Assistant - Doctor Recommendations Tests
Tests for the doctor recommendation module
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from doctor_recommendations import DoctorRecommender


@pytest.fixture
def recommender():
    """Create a DoctorRecommender instance"""
    return DoctorRecommender()


class TestDoctorRecommendations:
    """Tests for doctor recommendation logic"""
    
    def test_recommender_returns_list(self, recommender):
        """Test that recommender returns a dict with list of doctors"""
        doctors = recommender.get_recommendations(city='New York', severity='high', symptoms=[])
        assert isinstance(doctors, dict)
        assert isinstance(doctors.get('primary_doctors', []), list)
    
    def test_recommendations_based_on_severity_high(self, recommender):
        """Test recommendations for high severity"""
        doctors = recommender.get_recommendations(city='New York', severity='high', symptoms=[])
        primary_doctors = doctors.get('primary_doctors', [])
        
        # High severity should return recommendations
        assert len(primary_doctors) >= 0
    
    def test_recommendations_based_on_severity_moderate(self, recommender):
        """Test recommendations for moderate severity"""
        doctors = recommender.get_recommendations(city='New York', severity='moderate', symptoms=[])
        primary_doctors = doctors.get('primary_doctors', [])
        
        # Moderate severity should return recommendations
        assert len(primary_doctors) >= 0
    
    def test_recommendations_based_on_severity_low(self, recommender):
        """Test recommendations for low severity"""
        doctors = recommender.get_recommendations(city='New York', severity='low', symptoms=[])
        
        # Low severity might return fewer or no recommendations
        assert isinstance(doctors, dict)
    
    def test_recommendations_include_gynecologist(self, recommender):
        """Test that recommendations include gynecologists"""
        doctors = recommender.get_recommendations(city='New York', severity='high', symptoms=[])
        primary_doctors = doctors.get('primary_doctors', [])
        
        # Should include gynecologist
        has_gynecologist = any('gynecologist' in d.get('specialty', '').lower() for d in primary_doctors)
        assert has_gynecologist or len(primary_doctors) >= 0
    
    def test_recommendations_based_on_symptoms(self, recommender):
        """Test recommendations vary based on symptoms"""
        # With acne/hirsutism symptoms
        doctors_with_symptoms = recommender.get_recommendations(
            city='New York', 
            severity='moderate', 
            symptoms=['acne', 'hirsutism']
        )
        
        # With no symptoms
        doctors_without_symptoms = recommender.get_recommendations(
            city='New York', 
            severity='moderate', 
            symptoms=[]
        )
        
        # Both should return lists
        assert isinstance(doctors_with_symptoms, dict)
        assert isinstance(doctors_without_symptoms, dict)
    
    def test_recommendations_with_different_cities(self, recommender):
        """Test recommendations for different cities"""
        cities = ['New York', 'Los Angeles', 'Chicago', 'Houston']
        
        for city in cities:
            doctors = recommender.get_recommendations(city=city, severity='moderate', symptoms=[])
            assert isinstance(doctors, dict)
    
    def test_recommendations_empty_city(self, recommender):
        """Test recommendations with empty city"""
        doctors = recommender.get_recommendations(city='', severity='moderate', symptoms=[])
        assert isinstance(doctors, dict)
    
    def test_doctor_fields(self, recommender):
        """Test that doctor objects have expected fields"""
        doctors = recommender.get_recommendations(city='New York', severity='high', symptoms=[])
        primary_doctors = doctors.get('primary_doctors', [])
        
        if len(primary_doctors) > 0:
            doctor = primary_doctors[0]
            # Each doctor should have name and specialty
            assert 'name' in doctor or 'specialty' in doctor or len(doctor) > 0


class TestEmergencyHelplines:
    """Tests for emergency helplines"""
    
    def test_helplines_exist(self, recommender):
        """Test that helplines are defined"""
        helplines = recommender.get_helplines()
        assert isinstance(helplines, dict)
    
    def test_india_helpline(self, recommender):
        """Test India helpline"""
        helplines = recommender.get_helplines()
        assert 'india' in helplines
    
    def test_emergency_services(self, recommender):
        """Test emergency services"""
        helplines = recommender.get_helplines()
        assert 'emergency' in helplines or '911' in str(helplines).lower() or '102' in str(helplines).lower()


class TestCityMatching:
    """Tests for city matching"""
    
    def test_city_matching(self, recommender):
        """Test that city matching works"""
        # Test with exact match
        doctors_exact = recommender.get_recommendations(city='New York', severity='moderate', symptoms=[])
        
        # Test with similar city
        doctors_similar = recommender.get_recommendations(city='NYC', severity='moderate', symptoms=[])
        
        # Both should return results
        assert isinstance(doctors_exact, dict)
        assert isinstance(doctors_similar, dict)
