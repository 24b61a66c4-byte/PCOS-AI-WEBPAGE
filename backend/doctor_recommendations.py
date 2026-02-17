"""
Doctor Recommendation System
Recommends gynecologists, endocrinologists, and specialists based on location and condition
"""

from typing import List, Dict, Any


class DoctorRecommender:
    def __init__(self):
        # Doctor database - In production, this would be in a proper database
        self.doctors_db = {
            "Hyderabad": [
                {
                    "name": "Dr. Sunita Rao",
                    "specialty": "Gynecologist & PCOS Specialist",
                    "hospital": "Apollo Hospital",
                    "phone": "+91 40 3333 1234",
                    "address": "Jubilee Hills, Hyderabad",
                    "experience": "15+ years",
                    "rating": 4.8,
                    "expertise": ["PCOS", "Infertility", "Hormonal Disorders"]
                },
                {
                    "name": "Dr. Rajeev Kumar",
                    "specialty": "Endocrinologist",
                    "hospital": "Care Hospitals",
                    "phone": "+91 40 6165 6789",
                    "address": "Banjara Hills, Hyderabad",
                    "experience": "12+ years",
                    "rating": 4.7,
                    "expertise": ["PCOS", "Diabetes", "Thyroid"]
                },
                {
                    "name": "Dr. Priya Reddy",
                    "specialty": "Gynecologist",
                    "hospital": "Yashoda Hospitals",
                    "phone": "+91 40 4444 5678",
                    "address": "Secunderabad, Hyderabad",
                    "experience": "10+ years",
                    "rating": 4.6,
                    "expertise": ["PCOS", "Menstrual Disorders", "Women's Health"]
                }
            ],
            
            "Vijayawada": [
                {
                    "name": "Dr. Lakshmi Devi",
                    "specialty": "Gynecologist & Fertility Specialist",
                    "hospital": "Manipal Hospital",
                    "phone": "+91 866 2429 999",
                    "address": "MG Road, Vijayawada",
                    "experience": "14+ years",
                    "rating": 4.7,
                    "expertise": ["PCOS", "IVF", "Infertility"]
                },
                {
                    "name": "Dr. Srinivas Rao",
                    "specialty": "Endocrinologist",
                    "hospital": "Ramesh Hospitals",
                    "phone": "+91 866 6699 000",
                    "address": "Governorpet, Vijayawada",
                    "experience": "11+ years",
                    "rating": 4.5,
                    "expertise": ["PCOS", "Hormonal Imbalance", "Metabolic Disorders"]
                }
            ],
            
            "Bangalore": [
                {
                    "name": "Dr. Meera Sharma",
                    "specialty": "Gynecologist & PCOS Specialist",
                    "hospital": "Fortis Hospital",
                    "phone": "+91 80 6621 4444",
                    "address": "Bannerghatta Road, Bangalore",
                    "experience": "18+ years",
                    "rating": 4.9,
                    "expertise": ["PCOS", "Endometriosis", "Reproductive Health"]
                },
                {
                    "name": "Dr. Anand Krishnan",
                    "specialty": "Endocrinologist",
                    "hospital": "Columbia Asia Hospital",
                    "phone": "+91 80 6692 6565",
                    "address": "Whitefield, Bangalore",
                    "experience": "13+ years",
                    "rating": 4.7,
                    "expertise": ["PCOS", "Insulin Resistance", "Hormones"]
                }
            ],
            
            "Chennai": [
                {
                    "name": "Dr. Kavitha Menon",
                    "specialty": "Gynecologist",
                    "hospital": "Apollo Hospital",
                    "phone": "+91 44 2829 3333",
                    "address": "Greams Road, Chennai",
                    "experience": "16+ years",
                    "rating": 4.8,
                    "expertise": ["PCOS", "Gynecological Surgery", "Fertility"]
                },
                {
                    "name": "Dr. Ramesh Babu",
                    "specialty": "Endocrinologist",
                    "hospital": "MIOT Hospital",
                    "phone": "+91 44 4200 2288",
                    "address": "Manapakkam, Chennai",
                    "experience": "14+ years",
                    "rating": 4.6,
                    "expertise": ["PCOS", "Diabetes", "Thyroid Disorders"]
                }
            ],
            
            "Delhi": [
                {
                    "name": "Dr. Anjali Kapoor",
                    "specialty": "Gynecologist & Fertility Expert",
                    "hospital": "Max Hospital",
                    "phone": "+91 11 2651 5050",
                    "address": "Saket, New Delhi",
                    "experience": "20+ years",
                    "rating": 4.9,
                    "expertise": ["PCOS", "IVF", "Laparoscopic Surgery"]
                },
                {
                    "name": "Dr. Vikram Singh",
                    "specialty": "Endocrinologist",
                    "hospital": "Fortis Hospital",
                    "phone": "+91 11 4277 6222",
                    "address": "Vasant Kunj, New Delhi",
                    "experience": "15+ years",
                    "rating": 4.7,
                    "expertise": ["PCOS", "Hormonal Disorders", "Obesity"]
                }
            ],
            
            "Mumbai": [
                {
                    "name": "Dr. Sneha Patil",
                    "specialty": "Gynecologist & PCOS Specialist",
                    "hospital": "Lilavati Hospital",
                    "phone": "+91 22 2640 0000",
                    "address": "Bandra West, Mumbai",
                    "experience": "17+ years",
                    "rating": 4.8,
                    "expertise": ["PCOS", "High-Risk Pregnancy", "Menopause"]
                },
                {
                    "name": "Dr. Arun Deshmukh",
                    "specialty": "Endocrinologist",
                    "hospital": "Hinduja Hospital",
                    "phone": "+91 22 2445 1515",
                    "address": "Mahim, Mumbai",
                    "experience": "19+ years",
                    "rating": 4.9,
                    "expertise": ["PCOS", "Metabolism", "Endocrine Disorders"]
                }
            ],
            
            "Pune": [
                {
                    "name": "Dr. Vaishali Joshi",
                    "specialty": "Gynecologist",
                    "hospital": "Ruby Hall Clinic",
                    "phone": "+91 20 6645 8888",
                    "address": "Pune Station, Pune",
                    "experience": "12+ years",
                    "rating": 4.6,
                    "expertise": ["PCOS", "Women's Health", "Reproductive Medicine"]
                },
                {
                    "name": "Dr. Manish Kulkarni",
                    "specialty": "Endocrinologist",
                    "hospital": "Sahyadri Hospital",
                    "phone": "+91 20 6700 6000",
                    "address": "Deccan Gymkhana, Pune",
                    "experience": "11+ years",
                    "rating": 4.5,
                    "expertise": ["PCOS", "Thyroid", "Hormonal Health"]
                }
            ]
        }
        
        # Emergency helplines
        self.helplines = {
            "National Health Helpline": "1800-180-1104",
            "Women's Helpline": "1091",
            "Apollo Hospitals Hotline": "1066"
        }
    
    def get_recommendations(self, city: str = "", severity: str = "moderate", symptoms: List[str] = None) -> Dict[str, Any]:
        """
        Get doctor recommendations based on location and condition severity
        """
        if symptoms is None:
            symptoms = []
        
        # Normalize city name
        city = city.strip().title()
        
        # Get doctors for the city
        doctors = self.doctors_db.get(city, [])
        
        # If no doctors in city, provide nearby alternatives
        nearby_cities = self._get_nearby_cities(city)
        
        # Filter by severity
        recommended_doctors = self._filter_by_severity(doctors, severity, symptoms)
        
        # Add nearby options if needed
        if len(recommended_doctors) < 2 and nearby_cities:
            for nearby_city in nearby_cities[:2]:
                nearby_doctors = self.doctors_db.get(nearby_city, [])
                recommended_doctors.extend(self._filter_by_severity(nearby_doctors[:1], severity, symptoms))
        
        return {
            "primary_doctors": recommended_doctors[:3],
            "all_doctors_in_city": doctors,
            "nearby_cities": nearby_cities,
            "helplines": self.helplines,
            "urgent_care_message": self._get_urgent_message(severity),
            "booking_tips": self._get_booking_tips(),
            "questions_to_ask": self._get_questions_to_ask()
        }
    
    def _filter_by_severity(self, doctors: List[Dict], severity: str, symptoms: List[str]) -> List[Dict]:
        """Filter doctors based on severity and symptoms"""
        result = []
        
        # For high severity or fertility issues, prioritize specialists
        needs_specialist = severity == "high" or 'infertility' in symptoms
        
        for doctor in doctors:
            if needs_specialist:
                if "Specialist" in doctor['specialty'] or "Endocrinologist" in doctor['specialty']:
                    result.append(doctor)
            else:
                result.append(doctor)
        
        # Sort by rating
        result.sort(key=lambda x: x.get('rating', 0), reverse=True)
        
        return result
    
    def _get_nearby_cities(self, city: str) -> List[str]:
        """Get nearby cities with doctors"""
        # Simplified proximity mapping
        proximity = {
            "Vijayawada": ["Hyderabad", "Chennai"],
            "Hyderabad": ["Bangalore", "Chennai"],
            "Bangalore": ["Chennai", "Hyderabad"],
            "Chennai": ["Bangalore", "Hyderabad"],
            "Pune": ["Mumbai", "Bangalore"],
            "Mumbai": ["Pune", "Bangalore"],
            "Delhi": ["Bangalore", "Chennai"]
        }
        
        return proximity.get(city, ["Hyderabad", "Bangalore", "Chennai"])
    
    def _get_urgent_message(self, severity: str) -> str:
        """Get urgency message based on severity"""
        if severity == "high":
            return "⚠️ IMPORTANT: Based on your symptoms, please schedule an appointment within 1-2 weeks. If experiencing severe pain or heavy bleeding, visit emergency care immediately."
        elif severity == "moderate":
            return "📋 RECOMMENDED: Schedule a consultation within 4-6 weeks to discuss your symptoms and get proper diagnosis."
        else:
            return "✅ Your symptoms appear manageable. Schedule a routine checkup within 2-3 months for monitoring."
    
    def _get_booking_tips(self) -> List[str]:
        """Tips for booking appointments"""
        return [
            "Call during morning hours (9-11 AM) for better availability",
            "Mention 'PCOS consultation' when booking to get adequate time slot",
            "Prepare your symptom history and menstrual cycle data before visit",
            "Ask if they need any prior blood tests or ultrasound",
            "Check if the doctor accepts your health insurance",
            "Request for first available appointment for urgent cases"
        ]
    
    def _get_questions_to_ask(self) -> List[str]:
        """Questions to ask the doctor"""
        return [
            "Do I need hormone level tests (LH, FSH, testosterone)?",
            "Should I get an ultrasound to check for ovarian cysts?",
            "What lifestyle changes would you recommend?",
            "Are there medications that might help regulate my cycle?",
            "Should I see a nutritionist or endocrinologist?",
            "What are my options if I'm trying to conceive?",
            "How often should I come for follow-up appointments?",
            "Are there any warning signs I should watch for?"
        ]
    
    def get_all_cities(self) -> List[str]:
        """Get list of all cities with doctors"""
        return list(self.doctors_db.keys())
    
    def search_doctor_by_name(self, name: str) -> List[Dict]:
        """Search for doctor by name"""
        results = []
        name_lower = name.lower()
        
        for city, doctors in self.doctors_db.items():
            for doctor in doctors:
                if name_lower in doctor['name'].lower():
                    doctor_copy = doctor.copy()
                    doctor_copy['city'] = city
                    results.append(doctor_copy)
        
        return results
