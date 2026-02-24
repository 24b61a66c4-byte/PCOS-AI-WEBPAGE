# 🏥 PCOS Smart Assistant

A comprehensive health analysis platform for PCOS (Polycystic Ovary Syndrome) with AI-powered insights, risk assessment, and personalized doctor recommendations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### Frontend
- **📊 Health Data Tracking**: Track cycles, symptoms, lifestyle, and clinical information
- **🤖 AI Chat Assistant**: Get personalized insights from your health data using AI
- **📸 Image Analysis**: Upload photos for PCOS-related symptom analysis
- **🌍 Multi-language Support**: English, Telugu (తెలుగు), and Hindi (हिंदी)
- **🎨 Dark/Light Theme**: Switch between comfortable viewing modes
- **🔒 Privacy-First**: All data stored locally in your browser
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

### Backend Analysis Engine
- **🔬 Risk Assessment**: Calculate PCOS risk score (0-100) based on symptoms and patterns
- **📈 Data Analysis**: Compare your data against medical PCOS dataset
- **👨‍⚕️ Doctor Recommendations**: Get personalized doctor suggestions based on location and severity
- **📋 Comprehensive Reports**: Detailed health reports with actionable next steps
- **☎️ Emergency Helplines**: Access to national health helplines
- **📍 Location-Based**: Doctors across 7+ major Indian cities

## 🚀 Quick Start

> **📘 New to setup?** Check out our interactive setup guide:  
> **[Open Setup Guide →](setup.html)** | **[Detailed Setup Instructions →](SETUP.md)**

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.8+ (for backend analysis)
- OpenRouter API key (for AI features) - [Get one free here](https://openrouter.ai/)
- Supabase account (optional, for cloud sync) - [Sign up free](https://supabase.com/)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/24b61a66c4-byte/PCOS-AI-WEBPAGE.git
cd PCOS-AI-WEBPAGE
```

#### 2. Set Up Frontend

Create a `config.js` file in the `frontend/` folder:
```javascript
// frontend/config.js
window.CONFIG = {
  OPENROUTER_API_KEY: 'your-openrouter-api-key-here',
  SUPABASE_URL: 'your-supabase-url-here',
  SUPABASE_ANON_KEY: 'your-supabase-anon-key-here',
  BACKEND_URL: 'http://localhost:5000'  // or your deployed API URL
};
```

**⚠️ IMPORTANT**: Never commit `config.js` to Git! It's already in `.gitignore`.

#### 3. Set Up Backend (Python)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Supabase service key
# SUPABASE_URL=your_url
# SUPABASE_SERVICE_KEY=your_service_key
```

#### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python app.py
```
Backend runs on http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
# Use any local server, for example:
python -m http.server 8080
# or
npx serve
```
Frontend runs on http://localhost:8080
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

   Then visit `http://localhost:8000`

## 🔑 API Setup

### OpenRouter (Required for AI features)

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Generate an API key
4. The app uses free models:
   - Text chat: `meta-llama/llama-3.1-8b-instruct:free`
   - Image analysis: `meta-llama/llama-3.2-11b-vision-instruct:free`

### Supabase (Optional for cloud sync)

1. Create account at [Supabase.com](https://supabase.com/)
2. Create a new project
3. Run the SQL scripts from `backend/sql/`:
   - `SUPABASE_DATASET_SETUP.sql`
   - `SUPABASE_ASSISTANT_STATS.sql`
4. Get your project URL and anon key from Settings > API

## 📖 Usage

### Dashboard
- View your latest health entry
- See average cycle and period length
- Access AI assistant for personalized insights
- Export your data as JSON/CSV

### Health Journey Form
- Complete 6-step health assessment
- Track menstrual cycle, symptoms, lifestyle, and clinical data
- Automatic draft saving
- Real-time PCOS indicator insights
- Multi-language support

### AI Assistant
- Ask questions about your health data
- Upload photos for symptom analysis
- Get educational insights and recommendations
- Context-aware responses based on your entries

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with CSS Variables for theming
- **AI**: OpenRouter API (Llama 3.1 & 3.2 Vision models)
- **Database**: Supabase (PostgreSQL) + LocalStorage
- **Icons**: Unicode Emoji

## 📁 Project Structure

```
PSOC/
├── index.html              # Entry point
├── frontend/
│   ├── dashboard.html      # Main dashboard
│   ├── form.html          # Health journey form
│   ├── app.js             # Main application logic
│   ├── styles.css         # All styles
│   ├── manifest.json      # PWA manifest
│   └── assets/            # Images & icons
├── backend/
│   ├── sql/               # Database schemas
│   └── SUPABASE_SETUP.md  # Setup instructions
└── data/
    └── README.md          # Dataset information
```

## 🔒 Privacy & Security

- **Local-First**: All data stored in browser's LocalStorage
- **Optional Cloud Sync**: Supabase integration is opt-in
- **No Analytics**: No tracking scripts or third-party analytics
- **Client-Side Only**: No server required, runs entirely in browser
- **Open Source**: Transparent code you can audit

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This app is for educational and tracking purposes only. It does not diagnose medical conditions. Always consult qualified healthcare providers for medical advice, diagnosis, or treatment.

## 🙏 Acknowledgments

- PCOS awareness community
- OpenRouter for free AI model access
- Supabase for database infrastructure
- [Lenis](https://github.com/studio-freight/lenis) for smooth scrolling

## 📧 Support

If you have questions or need help:
- Open an [issue](https://github.com/YOUR_USERNAME/PSOC/issues)
- Check existing documentation
- Review the code comments

---

Made with ❤️ for PCOS awareness and women's health
