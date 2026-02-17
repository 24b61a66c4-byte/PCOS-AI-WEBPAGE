// Results Page - Display Health Analysis and Recommendations
document.addEventListener('DOMContentLoaded', function() {
  // Initialize smooth scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Theme management
  const THEME_KEY = 'pcos_theme';
  
  function initTheme() {
    const theme = localStorage.getItem(THEME_KEY) || 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  initTheme();

  // Load analysis results
  loadResults();

  function loadResults() {
    const analysisData = localStorage.getItem('pcos_last_analysis');
    
    if (!analysisData) {
      showNoDataMessage();
      return;
    }

    try {
      const data = JSON.parse(analysisData);
      
      // Display risk assessment
      displayRiskAssessment(data.analysis);
      
      // Display key findings
      displayFindings(data.report.key_findings);
      
      // Display recommendations
      displayRecommendations(data.analysis.recommendations);
      
      // Display doctors
      displayDoctors(data.doctors);
      
      // Display next steps
      displayNextSteps(data.report.next_steps);
      
      // Display lifestyle tips
      displayLifestyleTips(data.report.lifestyle_tips);
      
      // Display warning signs
      displayWarnings(data.report.when_to_see_doctor);
      
    } catch (error) {
      console.error('Error loading results:', error);
      showErrorMessage();
    }
  }

  function displayRiskAssessment(analysis) {
    const riskBadge = document.getElementById('riskBadge');
    const riskScore = document.getElementById('riskScore');
    const summaryText = document.getElementById('summaryText');

    if (!analysis) return;

    // Set risk level badge
    const riskLevels = {
      low: { text: 'Low Risk', class: 'risk-low' },
      moderate: { text: 'Moderate Risk', class: 'risk-moderate' },
      high: { text: 'High Risk', class: 'risk-high' }
    };

    const riskInfo = riskLevels[analysis.risk_level] || riskLevels.moderate;
    riskBadge.textContent = riskInfo.text;
    riskBadge.className = `risk-badge ${riskInfo.class}`;

    // Set risk score
    riskScore.textContent = analysis.risk_score || 0;

    // Set summary
    summaryText.textContent = analysis.summary || 'Analysis complete.';
  }

  function displayFindings(findings) {
    const findingsList = document.getElementById('findingsList');
    if (!findings || findings.length === 0) {
      findingsList.innerHTML = '<li>No key findings available.</li>';
      return;
    }

    findingsList.innerHTML = findings.map(finding => 
      `<li>${escapeHtml(finding)}</li>`
    ).join('');
  }

  function displayRecommendations(recommendations) {
    const recommendationsList = document.getElementById('recommendationsList');
    if (!recommendations || recommendations.length === 0) {
      recommendationsList.innerHTML = '<li>No recommendations available.</li>';
      return;
    }

    recommendationsList.innerHTML = recommendations.map(rec => 
      `<li>${escapeHtml(rec)}</li>`
    ).join('');
  }

  function displayDoctors(doctorsData) {
    const doctorsGrid = document.getElementById('doctorsGrid');
    const urgentMessage = document.getElementById('urgentMessage');
    const helplinesGrid = document.getElementById('helplinesGrid');

    if (!doctorsData) {
      doctorsGrid.innerHTML = '<p>No doctor recommendations available.</p>';
      return;
    }

    // Display urgent message
    if (doctorsData.urgent_care_message) {
      urgentMessage.textContent = doctorsData.urgent_care_message;
    }

    // Display primary doctors
    const doctors = doctorsData.primary_doctors || [];
    
    if (doctors.length === 0) {
      doctorsGrid.innerHTML = '<p>No doctors found in your area. Please check nearby cities or consult the helplines below.</p>';
    } else {
      doctorsGrid.innerHTML = doctors.map(doctor => `
        <div class="doctor-card">
          <div class="doctor-header">
            <h3>${escapeHtml(doctor.name)}</h3>
            <div class="doctor-rating">⭐ ${doctor.rating || 'N/A'}</div>
          </div>
          <p class="doctor-specialty">${escapeHtml(doctor.specialty)}</p>
          <p class="doctor-hospital">🏥 ${escapeHtml(doctor.hospital)}</p>
          <p class="doctor-address">📍 ${escapeHtml(doctor.address)}</p>
          <p class="doctor-experience">👨‍⚕️ ${escapeHtml(doctor.experience)}</p>
          <a href="tel:${doctor.phone}" class="doctor-phone">
            📞 ${escapeHtml(doctor.phone)}
          </a>
          <div class="doctor-expertise">
            ${(doctor.expertise || []).map(exp => 
              `<span class="expertise-tag">${escapeHtml(exp)}</span>`
            ).join('')}
          </div>
        </div>
      `).join('');
    }

    // Display helplines
    if (doctorsData.helplines) {
      const helplines = Object.entries(doctorsData.helplines);
      helplinesGrid.innerHTML = helplines.map(([name, number]) => `
        <div class="helpline-item">
          <strong>${escapeHtml(name)}</strong>
          <a href="tel:${number}">${escapeHtml(number)}</a>
        </div>
      `).join('');
    }
  }

  function displayNextSteps(steps) {
    const nextStepsList = document.getElementById('nextStepsList');
    if (!steps || steps.length === 0) {
      nextStepsList.innerHTML = '<li>No next steps available.</li>';
      return;
    }

    nextStepsList.innerHTML = steps.map(step => 
      `<li>${escapeHtml(step)}</li>`
    ).join('');
  }

  function displayLifestyleTips(tips) {
    const tipsList = document.getElementById('tipsList');
    if (!tips || tips.length === 0) {
      tipsList.innerHTML = '<li>No lifestyle tips available.</li>';
      return;
    }

    tipsList.innerHTML = tips.map(tip => 
      `<li>${escapeHtml(tip)}</li>`
    ).join('');
  }

  function displayWarnings(warnings) {
    const warningList = document.getElementById('warningList');
    if (!warnings || warnings.length === 0) {
      warningList.innerHTML = '<li>No warning signs available.</li>';
      return;
    }

    warningList.innerHTML = warnings.map(warning => 
      `<li>${escapeHtml(warning)}</li>`
    ).join('');
  }

  function showNoDataMessage() {
    document.querySelector('.container').innerHTML = `
      <div class="no-data-message">
        <h2>No Analysis Data Found</h2>
        <p>Please complete the health form first to get your personalized report.</p>
        <a href="form.html" class="btn btn-primary btn-lg">Complete Health Form</a>
      </div>
    `;
  }

  function showErrorMessage() {
    document.querySelector('.container').innerHTML = `
      <div class="error-message">
        <h2>Error Loading Report</h2>
        <p>Sorry, we couldn't load your health report. Please try submitting the form again.</p>
        <a href="form.html" class="btn btn-primary">Back to Form</a>
      </div>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Print functionality
  document.getElementById('printReport')?.addEventListener('click', () => {
    window.print();
  });

  // Download PDF functionality (basic - uses print  to PDF)
  document.getElementById('downloadPDF')?.addEventListener('click', () => {
    window.print();
    alert('Please select "Save as PDF" from the print dialog.');
  });

  // Reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
