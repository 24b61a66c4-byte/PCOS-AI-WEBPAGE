// PCOS Smart Assistant - Results Page Handler
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  const savedTheme = localStorage.getItem('pcos_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('pcos_theme', isLight ? 'light' : 'dark');
    });
  }

  // Load analysis data with requestAnimationFrame for smoother render
  requestAnimationFrame(loadAnalysisResults);
  
  // Setup print button
  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
  
  // Setup PDF download (placeholder)
  const downloadBtn = document.getElementById('downloadPDF');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      alert('PDF download will be available in a future update. Please use Print and Save as PDF for now.');
    });
  }
});

function loadAnalysisResults() {
  const analysisRaw = localStorage.getItem('pcos_last_analysis');
  const entryRaw = localStorage.getItem('pcos_last_entry');
  
  if (!analysisRaw) {
    showNoDataState();
    return;
  }

  try {
    const analysis = JSON.parse(analysisRaw);
    const entry = entryRaw ? JSON.parse(entryRaw) : null;
    
    renderRiskAssessment(analysis, entry);
    renderFindings(analysis);
    renderRecommendations(analysis);
    renderDoctors(analysis, entry);
    renderNextSteps(analysis);
    renderTips(analysis);
    renderWarnings(analysis);
  } catch (err) {
    console.error('Error parsing analysis:', err);
    showNoDataState();
  }
}

function showNoDataState() {
  // Declare container only once
  const container = document.querySelector('.container');
  // Professional polish: show animated empty state
  if (container) {
    container.innerHTML = `
      <div class="no-data-message reveal" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 0;animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;">
        <div style="font-size:4rem;">📭</div>
        <h2 style="margin:1.2rem 0 0.5rem 0; color:var(--color-text-primary,#1e293b);font-weight:700;">No Analysis Data Found</h2>
        <p style="color:var(--color-text-muted,#94a3b8);font-size:1.1rem;max-width:340px;text-align:center;">Please complete the health form first to get your personalized report.<br>All your data stays private and secure.</p>
        <a href="form.html" class="btn btn--primary btn--lg" style="margin-top:2rem;">Complete Health Form</a>
      </div>
    `;
    return;
  }
  // Professional polish: show animated error state
  if (container) {
    container.innerHTML = `
      <div class="error-message reveal" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 0;animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;">
        <div style="font-size:3.2rem;">⚠️</div>
        <h2 style="margin:1rem 0 0.5rem 0; color:#ef4444;font-weight:700;">Error Loading Report</h2>
        <p style="color:var(--color-text-muted,#94a3b8);font-size:1rem;max-width:340px;text-align:center;">Sorry, we couldn't load your health report.<br>Please try submitting the form again or contact support if the issue persists.</p>
        <a href="form.html" class="btn btn--primary" style="margin-top:1.2rem;">Back to Form</a>
      </div>
    `;
    return;
  }
  const riskBadge = document.getElementById('riskBadge');
  const riskScore = document.getElementById('riskScore');
  const summaryText = document.getElementById('summaryText');
  const findingsList = document.getElementById('findingsList');
  const recommendationsList = document.getElementById('recommendationsList');
  const nextStepsList = document.getElementById('nextStepsList');
  if (riskBadge) riskBadge.textContent = 'No Data';
  if (riskScore) riskScore.textContent = '--';
  if (summaryText) summaryText.textContent = 'No analysis data found. Please submit your health information first.';
  if (findingsList) findingsList.innerHTML = '<li>No data available</li>';
  if (recommendationsList) recommendationsList.innerHTML = '<li>No recommendations available</li>';
  if (nextStepsList) nextStepsList.innerHTML = '<li>Please submit your health information to get started</li>';
}

function renderRiskAssessment(analysis, entry) {
  const riskBadge = document.getElementById('riskBadge');
  const riskScore = document.getElementById('riskScore');
  const summaryText = document.getElementById('summaryText');
  
  let riskScoreValue = analysis && analysis.analysis && typeof analysis.analysis.risk_score === 'number'
    ? analysis.analysis.risk_score
    : (typeof analysis.risk_score === 'number' ? analysis.risk_score : 0);
  if (isNaN(riskScoreValue) || riskScoreValue === undefined) riskScoreValue = 0;
  const riskLevel = getRiskLevel(riskScoreValue);
  if (riskScore) riskScore.textContent = riskScoreValue;
  if (riskBadge) {
    riskBadge.textContent = riskLevel.label;
    riskBadge.className = `risk-badge risk-${riskLevel.key}`;
  }
  if (summaryText) {
    if (analysis && analysis.analysis && analysis.analysis.summary) {
      summaryText.textContent = analysis.analysis.summary;
    } else if (analysis && analysis.summary) {
      summaryText.textContent = analysis.summary;
    } else {
      summaryText.textContent = 'Based on your health data, maintain healthy lifestyle habits and regular checkups.';
    }
  }
}

function getRiskLevel(score) {
  if (score <= 25) return { key: 'low', label: 'Low Risk' };
  if (score <= 50) return { key: 'moderate', label: 'Moderate Risk' };
  return { key: 'high', label: 'Higher Risk' };
}

function renderFindings(analysis) {
  const findingsList = document.getElementById('findingsList');
  const findings = analysis.analysis?.key_findings || analysis.report?.key_findings || [];
  
  if (findings.length > 0) {
    findingsList.innerHTML = findings.map(f => `<li>${f}</li>`).join('');
  } else {
    findingsList.innerHTML = '<li>Your cycle and symptoms are within normal ranges.</li>';
  }
}

function renderRecommendations(analysis) {
  const recList = document.getElementById('recommendationsList');
  const recs = analysis.analysis?.recommendations || analysis.recommendations || [];
  
  if (recs.length > 0) {
    recList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  } else {
    recList.innerHTML = '<li>Maintain a balanced diet and regular exercise routine.</li>';
  }
}

function renderDoctors(analysis, entry) {
  const doctorsGrid = document.getElementById('doctorsGrid');
  const urgentMessage = document.getElementById('urgentMessage');
  const helplinesGrid = document.getElementById('helplinesGrid');
  
  // Default doctors (would come from API in production)
  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Gynecologist',
      hospital: 'City Women\'s Health Center',
      rating: '4.8',
      expertise: ['PCOS', 'Fertility', 'Endocrinology']
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Endocrinologist',
      hospital: 'Metro Medical Center',
      rating: '4.6',
      expertise: ['Hormonal Disorders', 'PCOS', 'Diabetes']
    }
  ];
  
  doctorsGrid.innerHTML = doctors.map(doc => `
    <div class="doctor-card" tabindex="0" aria-label="Doctor ${doc.name}, ${doc.specialty}, ${doc.hospital}">
      <div class="doctor-header">
        <h3>${doc.name}</h3>
        <span class="doctor-rating">★ ${doc.rating}</span>
      </div>
      <div class="doctor-specialty">${doc.specialty}</div>
      <div class="doctor-hospital">🏥 ${doc.hospital}</div>
      <div class="doctor-expertise">
        ${doc.expertise.map(e => `<span class="expertise-tag">${e}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  // Emergency helplines
  const helplines = [
    { name: 'Emergency Services', number: '102' },
    { name: 'Women Health Helpline', number: '104' }
  ];
  
  helplinesGrid.innerHTML = helplines.map(h => `
    <div class="helpline-item">
      <strong>${h.name}</strong>
      <a href="tel:${h.number}">${h.number}</a>
    </div>
  `).join('');
}

function renderNextSteps(analysis) {
  const nextStepsList = document.getElementById('nextStepsList');
  const steps = [
    'Schedule a follow-up appointment with your healthcare provider',
    'Continue tracking your cycle and symptoms regularly',
    'Consider lifestyle modifications as recommended',
    'Share this report with your doctor during your next visit'
  ];
  
  nextStepsList.innerHTML = steps.map(s => `<li>${s}</li>`).join('');
}

function renderTips(analysis) {
  const tipsList = document.getElementById('tipsList');
  const tips = [
    'Maintain a balanced diet rich in fiber and protein',
    'Exercise regularly - aim for 30 minutes most days',
    'Get 7-9 hours of quality sleep each night',
    'Manage stress through meditation or yoga',
    'Stay hydrated and limit processed foods'
  ];
  
  // Lazy-load tips if container is visible
  if (tipsList && tipsList.offsetParent !== null) {
    tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
  }
}

function renderWarnings(analysis) {
  const warningList = document.getElementById('warningList');
  const warnings = [
    'Severe pelvic pain or heavy bleeding - seek immediate care',
    'Signs of ovarian torsion (sudden severe pain, vomiting)',
    'Difficulty breathing or chest pain',
    'Persistent high fever (above 101°F or 38.3°C)',
    'Feeling faint or losing consciousness'
  ];
  
  warningList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
}
