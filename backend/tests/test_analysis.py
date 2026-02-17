"""
PCOS Smart Assistant - Analysis Engine Tests
Tests for the PCOS analysis engine
"""

import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analysis_engine import PCOSAnalyzer


@pytest.fixture
def mock_supabase():
    """Create a mock Supabase client"""
    mock = Mock()
    mock.table.return_value.select.return_value.execute.return_value.data = []
    return mock


@pytest.fixture
def analyzer(mock_supabase):
    """Create an analyzer instance with mock Supabase"""
    return PCOSAnalyzer(mock_supabase)


class TestRiskScoreCalculation:
    """Tests for risk score calculation"""
    
    def test_low_risk_score(self, analyzer):
        """Test low risk score calculation"""
        data = {
            'age': 30,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': [],
            'stress': 'low',
            'sleep': 8
        }
        
        score = analyzer._calculate_risk_score(data, {})
        
        # Low risk should have score < 30
        assert score < 30
    
    def test_moderate_risk_score(self, analyzer):
        """Test moderate risk score calculation"""
        data = {
            'age': 25,
            'cycle_length': 38,
            'period_length': 8,
            'symptoms': ['acne', 'weight_gain'],
            'stress': 'moderate',
            'sleep': 6
        }
        
        score = analyzer._calculate_risk_score(data, {})
        
        # Moderate risk should have score between 30 and 60
        assert 30 <= score < 60
    
    def test_high_risk_score(self, analyzer):
        """Test high risk score calculation"""
        data = {
            'age': 25,
            'cycle_length': 45,
            'period_length': 10,
            'symptoms': ['irregular_cycles', 'hirsutism', 'acne', 'weight_gain', 'hair_loss'],
            'stress': 'high',
            'sleep': 5
        }
        
        score = analyzer._calculate_risk_score(data, {})
        
        # High risk should have score >= 60
        assert score >= 60
    
    def test_cycle_outside_range_increases_score(self, analyzer):
        """Test that cycle outside 21-35 increases score"""
        data_normal = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25}
        data_long = {'cycle_length': 45, 'period_length': 5, 'symptoms': [], 'age': 25}
        
        score_normal = analyzer._calculate_risk_score(data_normal, {})
        score_long = analyzer._calculate_risk_score(data_long, {})
        
        assert score_long > score_normal
    
    def test_period_outside_range_increases_score(self, analyzer):
        """Test that period outside 2-7 days increases score"""
        data_normal = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25}
        data_long = {'cycle_length': 28, 'period_length': 10, 'symptoms': [], 'age': 25}
        
        score_normal = analyzer._calculate_risk_score(data_normal, {})
        score_long = analyzer._calculate_risk_score(data_long, {})
        
        assert score_long > score_normal
    
    def test_symptoms_increase_score(self, analyzer):
        """Test that symptoms increase risk score"""
        data_no_symptoms = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25}
        data_with_symptoms = {'cycle_length': 28, 'period_length': 5, 'symptoms': ['acne', 'hirsutism'], 'age': 25}
        
        score_no_symptoms = analyzer._calculate_risk_score(data_no_symptoms, {})
        score_with_symptoms = analyzer._calculate_risk_score(data_with_symptoms, {})
        
        assert score_with_symptoms > score_no_symptoms
    
    def test_high_stress_increases_score(self, analyzer):
        """Test that high stress increases score"""
        data_low_stress = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25, 'stress': 'low'}
        data_high_stress = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25, 'stress': 'high'}
        
        score_low = analyzer._calculate_risk_score(data_low_stress, {})
        score_high = analyzer._calculate_risk_score(data_high_stress, {})
        
        assert score_high > score_low
    
    def test_low_sleep_increases_score(self, analyzer):
        """Test that low sleep increases score"""
        data_normal_sleep = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25, 'sleep': 8}
        data_low_sleep = {'cycle_length': 28, 'period_length': 5, 'symptoms': [], 'age': 25, 'sleep': 5}
        
        score_normal = analyzer._calculate_risk_score(data_normal_sleep, {})
        score_low = analyzer._calculate_risk_score(data_low_sleep, {})
        
        assert score_low > score_normal
    
    def test_risk_score_capped_at_100(self, analyzer):
        """Test that risk score is capped at 100"""
        data = {
            'age': 25,
            'cycle_length': 60,
            'period_length': 15,
            'symptoms': ['irregular_cycles', 'hirsutism', 'acne', 'weight_gain', 'hair_loss', 'infertility'],
            'stress': 'high',
            'sleep': 4
        }
        
        score = analyzer._calculate_risk_score(data, {})
        
        assert score <= 100


class TestRiskLevelDetermination:
    """Tests for risk level determination"""
    
    def test_low_risk_level(self, analyzer):
        """Test low risk level determination"""
        assert analyzer._determine_risk_level(20) == 'low'
        assert analyzer._determine_risk_level(29) == 'low'
    
    def test_moderate_risk_level(self, analyzer):
        """Test moderate risk level determination"""
        assert analyzer._determine_risk_level(30) == 'moderate'
        assert analyzer._determine_risk_level(59) == 'moderate'
    
    def test_high_risk_level(self, analyzer):
        """Test high risk level determination"""
        assert analyzer._determine_risk_level(60) == 'high'
        assert analyzer._determine_risk_level(100) == 'high'


class TestCycleAnalysis:
    """Tests for cycle length analysis"""
    
    def test_cycle_within_normal_range(self, analyzer):
        """Test cycle within normal range"""
        for cycle in [21, 25, 28, 30, 35]:
            result = analyzer._analyze_cycle(cycle)
            assert 'within normal range' in result
    
    def test_cycle_shorter_than_typical(self, analyzer):
        """Test cycle shorter than typical"""
        for cycle in [15, 18, 20]:
            result = analyzer._analyze_cycle(cycle)
            assert 'shorter' in result
    
    def test_cycle_longer_than_typical(self, analyzer):
        """Test cycle longer than typical"""
        for cycle in [36, 40, 45, 60]:
            result = analyzer._analyze_cycle(cycle)
            assert 'longer' in result


class TestPeriodAnalysis:
    """Tests for period length analysis"""
    
    def test_period_within_normal_range(self, analyzer):
        """Test period within normal range"""
        for period in [3, 4, 5, 6, 7]:
            result = analyzer._analyze_period(period)
            assert 'within normal range' in result
    
    def test_period_shorter_than_typical(self, analyzer):
        """Test period shorter than typical"""
        for period in [1, 2]:
            result = analyzer._analyze_period(period)
            assert 'shorter' in result
    
    def test_period_longer_than_typical(self, analyzer):
        """Test period longer than typical"""
        for period in [8, 10, 15]:
            result = analyzer._analyze_period(period)
            assert 'longer' in result


class TestRecommendations:
    """Tests for recommendation generation"""
    
    def test_high_risk_recommendations(self, analyzer):
        """Test recommendations for high risk"""
        data = {
            'age': 25,
            'cycle_length': 45,
            'period_length': 10,
            'symptoms': ['irregular_cycles', 'hirsutism', 'acne'],
            'stress': 'high'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'high')
        
        assert len(recommendations) > 0
        assert any('gynecologist' in r.lower() or 'endocrinologist' in r.lower() for r in recommendations)
    
    def test_moderate_risk_recommendations(self, analyzer):
        """Test recommendations for moderate risk"""
        data = {
            'age': 25,
            'cycle_length': 32,
            'period_length': 6,
            'symptoms': [],
            'stress': 'low'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'moderate')
        
        assert len(recommendations) > 0
    
    def test_low_risk_recommendations(self, analyzer):
        """Test recommendations for low risk"""
        data = {
            'age': 30,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': [],
            'stress': 'low'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'low')
        
        assert len(recommendations) > 0
    
    def test_weight_gain_symptom_recommendations(self, analyzer):
        """Test recommendations when weight gain is a symptom"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': ['weight_gain'],
            'stress': 'low'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'low')
        
        assert any('nutritionist' in r.lower() or 'diet' in r.lower() for r in recommendations)
    
    def test_acne_hirsutism_recommendations(self, analyzer):
        """Test recommendations for skin/hair symptoms"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': ['acne', 'hirsutism'],
            'stress': 'low'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'low')
        
        assert any('dermatologist' in r.lower() for r in recommendations)
    
    def test_infertility_recommendations(self, analyzer):
        """Test recommendations for infertility concerns"""
        data = {
            'age': 25,
            'cycle_length': 35,
            'period_length': 6,
            'symptoms': ['infertility'],
            'stress': 'moderate'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'moderate')
        
        assert any('fertility' in r.lower() for r in recommendations)
    
    def test_poor_sleep_recommendations(self, analyzer):
        """Test recommendations for poor sleep"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': [],
            'stress': 'low',
            'sleep': 5
        }
        
        recommendations = analyzer._generate_recommendations(data, 'low')
        
        assert any('sleep' in r.lower() for r in recommendations)
    
    def test_sedentary_recommendations(self, analyzer):
        """Test recommendations for sedentary lifestyle"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': [],
            'stress': 'low',
            'activity': 'sedentary'
        }
        
        recommendations = analyzer._generate_recommendations(data, 'low')
        
        assert any('exercise' in r.lower() or 'physical' in r.lower() for r in recommendations)


class TestSummaryGeneration:
    """Tests for summary generation"""
    
    def test_high_risk_summary(self, analyzer):
        """Test summary for high risk"""
        data = {
            'age': 25,
            'cycle_length': 45,
            'period_length': 10,
            'symptoms': ['irregular_cycles', 'hirsutism', 'acne']
        }
        
        summary = analyzer._create_summary(data, 'high', 'longer than typical')
        
        assert 'consult' in summary.lower() or 'healthcare provider' in summary.lower()
    
    def test_moderate_risk_summary(self, analyzer):
        """Test summary for moderate risk"""
        data = {
            'age': 25,
            'cycle_length': 32,
            'period_length': 6,
            'symptoms': []
        }
        
        summary = analyzer._create_summary(data, 'moderate', 'within normal range')
        
        assert len(summary) > 0
    
    def test_low_risk_summary(self, analyzer):
        """Test summary for low risk"""
        data = {
            'age': 30,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': []
        }
        
        summary = analyzer._create_summary(data, 'low', 'within normal range')
        
        assert 'mild' in summary.lower() or 'continue' in summary.lower()


class TestPercentileCalculation:
    """Tests for percentile calculation"""
    
    def test_percentile_calculation(self, analyzer):
        """Test percentile calculation"""
        data = {'cycle_length': 28}
        dataset = {'avg_cycle_length': 28}
        
        percentile = analyzer._calculate_percentile(data, dataset)
        
        assert percentile == 50
    
    def test_percentile_below_average(self, analyzer):
        """Test percentile when cycle is below average"""
        data = {'cycle_length': 25}
        dataset = {'avg_cycle_length': 28}
        
        percentile = analyzer._calculate_percentile(data, dataset)
        
        assert percentile < 50
    
    def test_percentile_above_average(self, analyzer):
        """Test percentile when cycle is above average"""
        data = {'cycle_length': 32}
        dataset = {'avg_cycle_length': 28}
        
        percentile = analyzer._calculate_percentile(data, dataset)
        
        assert percentile > 50


class TestDatasetStatistics:
    """Tests for dataset statistics"""
    
    def test_default_statistics(self, analyzer):
        """Test default statistics when no data"""
        stats = analyzer._default_stats()
        
        assert 'total_entries' in stats
        assert 'avg_cycle_length' in stats
        assert 'avg_period_length' in stats
    
    def test_get_dataset_statistics_uses_cache(self, analyzer):
        """Test that get_dataset_statistics uses cache"""
        analyzer.dataset_cache = {'test': 'data'}
        
        stats = analyzer.get_dataset_statistics()
        
        assert stats == {'test': 'data'}
    
    def test_pcos_percentage_calculation(self, analyzer):
        """Test PCOS percentage calculation"""
        data = [
            {'pcos': 'Yes'},
            {'pcos': 'Yes'},
            {'pcos': 'No'},
            {'pcos': 'No'},
            {'pcos': 'No'}
        ]
        
        percentage = analyzer._calculate_pcos_percentage(data)
        
        assert percentage == 40.0
    
    def test_pcos_percentage_empty_data(self, analyzer):
        """Test PCOS percentage with empty data"""
        percentage = analyzer._calculate_pcos_percentage([])
        
        assert percentage == 0


class TestAgeDistribution:
    """Tests for age distribution"""
    
    def test_age_distribution(self, analyzer):
        """Test age distribution calculation"""
        data = [
            {'age': '18'},
            {'age': '22'},
            {'age': '27'},
            {'age': '32'},
            {'age': '40'}
        ]
        
        distribution = analyzer._get_age_distribution(data)
        
        assert '15-20' in distribution
        assert '21-25' in distribution
        assert '26-30' in distribution
        assert '31-35' in distribution
        assert '36+' in distribution
    
    def test_age_distribution_counts(self, analyzer):
        """Test age distribution counts"""
        data = [
            {'age': '18'},  # 15-20
            {'age': '22'},  # 21-25
            {'age': '27'},  # 26-30
        ]
        
        distribution = analyzer._get_age_distribution(data)
        
        assert distribution['15-20'] == 1
        assert distribution['21-25'] == 1
        assert distribution['26-30'] == 1


class TestFullAnalysis:
    """Tests for full analysis"""
    
    def test_full_analysis_returns_all_fields(self, analyzer):
        """Test that full analysis returns all required fields"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': ['acne'],
            'stress': 'low',
            'sleep': 7
        }
        
        # Mock the dataset statistics
        with patch.object(analyzer, 'get_dataset_statistics', return_value={
            'avg_cycle_length': 28,
            'avg_period_length': 5
        }):
            result = analyzer.analyze(data)
        
        assert 'risk_score' in result
        assert 'risk_level' in result
        assert 'cycle_status' in result
        assert 'period_status' in result
        assert 'summary' in result
        assert 'recommendations' in result
        assert 'dataset_avg_cycle' in result
        assert 'dataset_avg_period' in result
        assert 'percentile' in result
    
    def test_full_analysis_with_city(self, analyzer):
        """Test analysis includes city data"""
        data = {
            'age': 25,
            'cycle_length': 28,
            'period_length': 5,
            'symptoms': [],
            'city': 'New York'
        }
        
        with patch.object(analyzer, 'get_dataset_statistics', return_value={
            'avg_cycle_length': 28,
            'avg_period_length': 5
        }):
            result = analyzer.analyze(data)
        
        assert result is not None
