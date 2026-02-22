"""
PCOS Analysis Engine
Analyzes user data against the PCOS dataset and generates health insights
"""

import numpy as np
from typing import Dict, List, Any


class PCOSAnalyzer:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        self.dataset_cache = None

    def analyze_step(self, step: int, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform incremental analysis after each form step.
        Returns immediate feedback based on the data entered in the current step.
        """
        insights = {
            "step": step,
            "step_name": self._get_step_name(step),
            "findings": [],
            "tips": [],
            "partial_risk_indicators": [],
            "next_step_preview": self._get_step_preview(step + 1) if step < 6 else None,
            "has_sufficient_data": False
        }
        
        # Analyze based on current step
        if step == 1:
            insights = self._analyze_step1(step_data, insights)
        elif step == 2:
            insights = self._analyze_step2(step_data, insights)
        elif step == 3:
            insights = self._analyze_step3(step_data, insights)
        elif step == 4:
            insights = self._analyze_step4(step_data, insights)
        elif step == 5:
            insights = self._analyze_step5(step_data, insights)
        elif step == 6:
            insights["has_sufficient_data"] = True
            insights["findings"].append("All information collected. Ready for comprehensive analysis.")
            insights["tips"].append("Click 'Save My Data' to get your complete health report with doctor recommendations.")
        
        return insights
    
    def _get_step_name(self, step: int) -> str:
        step_names = {1: "Personal Information", 2: "Menstrual Cycle", 3: "Symptoms", 
                      4: "Lifestyle & Habits", 5: "Clinical Information", 6: "Review"}
        return step_names.get(step, "Unknown")
    
    def _get_step_preview(self, step: int) -> str:
        step_previews = {
            2: "Next: We'll ask about your menstrual cycle details",
            3: "Next: Select any symptoms you're currently experiencing",
            4: "Next: Tell us about your daily lifestyle and habits",
            5: "Next: Share any clinical information and your location",
            6: "Next: Review all your information before submission"
        }
        return step_previews.get(step, "")
    
    def _analyze_step1(self, data: Dict, insights: Dict) -> Dict:
        age = data.get("age")
        if age:
            if 10 <= age <= 80:
                insights["findings"].append(f"Age {age} recorded")
                if 15 <= age <= 25:
                    insights["tips"].append("PCOS is commonly diagnosed in women aged 15-35.")
                elif 26 <= age <= 35:
                    insights["tips"].append("This is a common age range for PCOS diagnosis.")
        
        weight = data.get("weight")
        height = data.get("height")
        if weight and height:
            try:
                bmi = weight / ((height/100) ** 2)
                bmi_category = self._get_bmi_category(bmi)
                insights["findings"].append(f"BMI: {bmi:.1f} ({bmi_category})")
                if bmi > 25:
                    insights["tips"].append("Weight management can help improve PCOS symptoms.")
            except:
                pass
        return insights
    
    def _analyze_step2(self, data: Dict, insights: Dict) -> Dict:
        cycle_length = data.get("cycle_length")
        period_length = data.get("period_length")
        
        if cycle_length:
            try:
                cycle = int(cycle_length)
                if 21 <= cycle <= 35:
                    insights["findings"].append(f"Cycle length: {cycle} days (normal range)")
                elif cycle < 21:
                    insights["findings"].append(f"Cycle length: {cycle} days (shorter than typical)")
                    insights["tips"].append("Short cycles may indicate hormonal imbalances.")
                else:
                    insights["findings"].append(f"Cycle length: {cycle} days (longer than typical)")
                    insights["tips"].append("Longer cycles are common with PCOS.")
            except:
                pass
        
        if period_length:
            try:
                period = int(period_length)
                if 2 <= period <= 7:
                    insights["findings"].append(f"Period length: {period} days (normal range)")
                elif period < 2:
                    insights["findings"].append(f"Period length: {period} days (shorter than typical)")
                else:
                    insights["findings"].append(f"Period length: {period} days (longer than typical)")
            except:
                pass
        
        return insights
    
    def _analyze_step3(self, data: Dict, insights: Dict) -> Dict:
        symptoms = data.get("symptoms", [])
        if isinstance(symptoms, str):
            symptoms = symptoms.split(",") if symptoms else []
        
        symptom_count = len(symptoms)
        if symptom_count > 0:
            insights["findings"].append(f"{symptom_count} symptom(s) reported")
            
            if "irregular_cycles" in symptoms:
                insights["tips"].append("Irregular cycles are a key PCOS indicator.")
            if "weight_gain" in symptoms:
                insights["tips"].append("Weight changes may relate to insulin resistance.")
            if "hirsutism" in symptoms or "acne" in symptoms:
                insights["tips"].append("These symptoms often improve with hormonal treatments.")
            if symptom_count >= 5:
                insights["tips"].append("Multiple symptoms reported. A comprehensive checkup is recommended.")
        else:
            insights["findings"].append("No symptoms selected")
            insights["tips"].append("Adding symptoms helps us understand your health better.")
        
        return insights
    
    def _analyze_step4(self, data: Dict, insights: Dict) -> Dict:
        activity = data.get("activity")
        sleep = data.get("sleep")
        stress = data.get("stress")
        
        if activity:
            activity_labels = {"sedentary": "Sedentary", "light": "Lightly active", 
                             "moderate": "Moderately active", "active": "Very active"}
            insights["findings"].append(f"Activity level: {activity_labels.get(activity, activity)}")
            if activity == "sedentary":
                insights["tips"].append("Regular exercise improves insulin sensitivity.")
        
        if sleep:
            try:
                sleep_hours = float(sleep)
                insights["findings"].append(f"Sleep: {sleep_hours} hours/night")
                if sleep_hours < 6:
                    insights["tips"].append("Poor sleep can worsen PCOS symptoms. Aim for 7-8 hours.")
            except:
                pass
        
        if stress:
            stress_labels = {"low": "Low", "moderate": "Moderate", "high": "High"}
            insights["findings"].append(f"Stress level: {stress_labels.get(stress, stress)}")
            if stress == "high":
                insights["tips"].append("High stress affects hormones. Try yoga or meditation.")
        
        return insights
    
    def _analyze_step5(self, data: Dict, insights: Dict) -> Dict:
        city = data.get("city")
        pcos = data.get("pcos")
        
        if city:
            insights["findings"].append(f"Location: {city}")
            insights["tips"].append("Based on your location, we'll recommend nearby specialists if needed.")
        
        if pcos:
            pcos_labels = {"diagnosed": "Already diagnosed with PCOS", "suspected": "Suspected PCOS",
                         "family_history": "Family history of PCOS", "not_diagnosed": "Not diagnosed"}
            insights["findings"].append(f"PCOS status: {pcos_labels.get(pcos, pcos)}")
            
            if pcos == "diagnosed":
                insights["tips"].append("Regular follow-ups with your doctor help manage PCOS effectively.")
            elif pcos == "suspected":
                insights["tips"].append("Getting proper tests can confirm diagnosis.")
        
        insights["tips"].append("Great! Almost done. The next step will show a summary.")
        return insights
    
    def _get_bmi_category(self, bmi: float) -> str:
        if bmi < 18.5: return "Underweight"
        elif bmi < 25: return "Normal"
        elif bmi < 30: return "Overweight"
        else: return "Obese"

    def analyze(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive PCOS analysis
        """
        # Load dataset for comparison
        dataset_stats = self.get_dataset_statistics()

        # Calculate risk score
        risk_score = self._calculate_risk_score(user_data, dataset_stats)

        # Determine risk level
        risk_level = self._determine_risk_level(risk_score)

        # Analyze cycle patterns
        cycle_status = self._analyze_cycle(user_data["cycle_length"])
        period_status = self._analyze_period(user_data["period_length"])

        # Generate recommendations
        recommendations = self._generate_recommendations(user_data, risk_level)

        # Create summary
        summary = self._create_summary(user_data, risk_level, cycle_status)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "cycle_status": cycle_status,
            "period_status": period_status,
            "summary": summary,
            "recommendations": recommendations,
            "dataset_avg_cycle": dataset_stats.get("avg_cycle_length", 28),
            "dataset_avg_period": dataset_stats.get("avg_period_length", 5),
            "percentile": self._calculate_percentile(user_data, dataset_stats),
        }

    def _calculate_risk_score(self, data: Dict, dataset: Dict) -> int:
        """Calculate PCOS risk score (0-100)"""
        score = 0

        # Cycle length analysis (0-30 points)
        cycle = data.get("cycle_length", 28)
        if cycle < 21:
            score += 25
        elif cycle > 35:
            score += 30
        elif 35 >= cycle > 32:
            score += 15

        # Period length analysis (0-15 points)
        period = data.get("period_length", 5)
        if period < 3:
            score += 10
        elif period > 7:
            score += 15

        # Symptom analysis (0-40 points)
        symptoms = data.get("symptoms", [])
        high_risk_symptoms = [
            "irregular_cycles",
            "hirsutism",
            "acne",
            "weight_gain",
            "hair_loss",
            "infertility",
        ]

        symptom_count = len(symptoms)
        high_risk_count = len([s for s in symptoms if s in high_risk_symptoms])

        score += min(25, symptom_count * 4)
        score += min(15, high_risk_count * 5)

        # Age factor (0-10 points)
        age = data.get("age", 25)
        if 15 <= age <= 35:  # Peak PCOS diagnosis age
            score += 10

        # Lifestyle factors (0-5 points)
        if data.get("stress") == "high":
            score += 3
        if data.get("sleep", 7) < 6:
            score += 2

        return min(100, score)  # Cap at 100

    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level based on score"""
        if score < 30:
            return "low"
        elif score < 60:
            return "moderate"
        else:
            return "high"

    def _analyze_cycle(self, cycle_length: int) -> str:
        """Analyze cycle length"""
        if 21 <= cycle_length <= 35:
            return "within normal range"
        elif cycle_length < 21:
            return "shorter than typical (may indicate hormonal imbalance)"
        else:
            return "longer than typical (common in PCOS)"

    def _analyze_period(self, period_length: int) -> str:
        """Analyze period length"""
        if 3 <= period_length <= 7:
            return "within normal range"
        elif period_length < 3:
            return "shorter than typical"
        else:
            return "longer than typical (may need evaluation)"

    def _generate_recommendations(self, data: Dict, risk_level: str) -> List[str]:
        """Generate personalized recommendations"""
        recs = []

        # Based on risk level
        if risk_level == "high":
            recs.append("⚠️ Consult a gynecologist or endocrinologist soon")
            recs.append("Schedule hormone panel tests (LH, FSH, testosterone, insulin)")
            recs.append("Consider pelvic ultrasound to check for ovarian cysts")
        elif risk_level == "moderate":
            recs.append("Schedule a checkup with a gynecologist within 1-2 months")
            recs.append("Start tracking your cycles and symptoms consistently")
        else:
            recs.append("Continue monitoring your cycles regularly")

        # Based on symptoms
        symptoms = data.get("symptoms", [])

        if "weight_gain" in symptoms:
            recs.append("Consider consulting a nutritionist for diet management")
            recs.append("Regular exercise can help with insulin sensitivity")

        if "acne" in symptoms or "hirsutism" in symptoms:
            recs.append("Dermatologist consultation may help with skin/hair concerns")

        if "irregular_cycles" in symptoms:
            recs.append("Track ovulation with BBT or ovulation kits")

        if "infertility" in symptoms:
            recs.append("Fertility specialist consultation recommended")

        if "mood_changes" in symptoms or data.get("stress") == "high":
            recs.append("Consider mental health support or stress management therapy")

        # Lifestyle based
        if data.get("sleep", 7) < 6:
            recs.append("Improve sleep hygiene - aim for 7-8 hours nightly")

        if data.get("activity") in ["sedentary", "light"]:
            recs.append(
                "Increase physical activity - aim for 150 min/week moderate exercise"
            )

        return recs[:8]  # Limit to top 8 recommendations

    def _create_summary(self, data: Dict, risk_level: str, cycle_status: str) -> str:
        """Create human-readable summary"""
        age = data.get("age")
        symptoms_count = len(data.get("symptoms", []))

        summary = f"Based on your health data (age {age}, {symptoms_count} symptoms reported), "

        if risk_level == "high":
            summary += "you show several indicators commonly associated with PCOS. "
            summary += "We strongly recommend consulting a healthcare provider for proper diagnosis and treatment."
        elif risk_level == "moderate":
            summary += "you show some indicators that may warrant further evaluation. "
            summary += "Consider scheduling a checkup with a gynecologist to discuss your symptoms."
        else:
            summary += "your symptoms appear mild. "
            summary += (
                "Continue monitoring your health and maintain a healthy lifestyle."
            )

        return summary

    def _calculate_percentile(self, data: Dict, dataset: Dict) -> int:
        """Calculate where user falls in dataset percentile"""
        # Simplified percentile calculation
        cycle = data.get("cycle_length", 28)
        avg_cycle = dataset.get("avg_cycle_length", 28)

        if cycle < avg_cycle:
            return 35
        elif cycle == avg_cycle:
            return 50
        else:
            diff = cycle - avg_cycle
            return min(90, 50 + (diff * 5))

    def get_dataset_statistics(self) -> Dict[str, Any]:
        """Get statistics from PCOS dataset"""
        if self.dataset_cache:
            return self.dataset_cache

        try:
            # Query dataset
            response = (
                self.supabase.table("pcos_dataset_raw")
                .select("*")
                .limit(1000)
                .execute()
            )

            if not response.data:
                # Return default stats if no data
                return self._default_stats()

            data = response.data

            # Calculate statistics
            cycle_lengths = [
                int(d["cycle_length"])
                for d in data
                if d.get("cycle_length") and d["cycle_length"].isdigit()
            ]
            period_lengths = [
                int(d["period_length"])
                for d in data
                if d.get("period_length") and d["period_length"].isdigit()
            ]

            stats = {
                "total_entries": len(data),
                "avg_cycle_length": (
                    int(np.mean(cycle_lengths)) if cycle_lengths else 28
                ),
                "avg_period_length": (
                    int(np.mean(period_lengths)) if period_lengths else 5
                ),
                "pcos_percentage": self._calculate_pcos_percentage(data),
                "most_common_symptoms": self._get_common_symptoms(data),
                "age_distribution": self._get_age_distribution(data),
            }

            self.dataset_cache = stats
            return stats

        except Exception as e:
            print(f"Error fetching dataset: {e}")
            return self._default_stats()

    def _default_stats(self) -> Dict:
        """Return default statistics"""
        return {
            "total_entries": 0,
            "avg_cycle_length": 28,
            "avg_period_length": 5,
            "pcos_percentage": 0,
            "most_common_symptoms": [],
            "age_distribution": {},
        }

    def _calculate_pcos_percentage(self, data: List[Dict]) -> float:
        """Calculate percentage with PCOS diagnosis"""
        pcos_count = sum(1 for d in data if d.get("pcos") == "Yes")
        return round((pcos_count / len(data)) * 100, 1) if data else 0

    def _get_common_symptoms(self, data: List[Dict]) -> List[str]:
        """Get most common symptoms from dataset"""
        symptom_fields = [
            "irregular_missed_periods",
            "hair_growth_chin",
            "acne_or_skin_tags",
            "weight_change",
            "hair_thinning_or_hair_loss",
            "always_tired",
        ]

        symptom_counts = {}
        for field in symptom_fields:
            count = sum(1 for d in data if d.get(field) == "Yes")
            if count > 0:
                symptom_counts[field] = count

        # Sort by count and return top 5
        sorted_symptoms = sorted(
            symptom_counts.items(), key=lambda x: x[1], reverse=True
        )
        return [s[0] for s in sorted_symptoms[:5]]

    def _get_age_distribution(self, data: List[Dict]) -> Dict[str, int]:
        """Get age distribution"""
        age_groups = {"15-20": 0, "21-25": 0, "26-30": 0, "31-35": 0, "36+": 0}

        for d in data:
            age_str = d.get("age", "")
            if age_str and age_str.isdigit():
                age = int(age_str)
                if age <= 20:
                    age_groups["15-20"] += 1
                elif age <= 25:
                    age_groups["21-25"] += 1
                elif age <= 30:
                    age_groups["26-30"] += 1
                elif age <= 35:
                    age_groups["31-35"] += 1
                else:
                    age_groups["36+"] += 1

        return age_groups
