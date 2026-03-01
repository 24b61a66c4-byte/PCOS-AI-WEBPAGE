// PCOS Smart Assistant - Results Page Handler

const INSIGHT_LANG_KEY = 'pcos_insight_lang';

const insightI18n = {
  en: {
    headerTitle: 'PCOS Insight',
    headerNote: 'Educational only. This does not diagnose PCOS. For medical advice, consult a clinician.',
    labelLevel: 'Indicator level',
    labelImpacts: 'Possible longer-term impacts',
    defaultReason: 'Fill in cycle length and symptoms to see insights.',
    basedOn: 'Based on {reasons}.',
    levels: {
      insufficient: 'Not enough data',
      low: 'Lower indicators',
      moderate: 'Moderate indicators',
      high: 'Higher indicators',
    },
    reasons: {
      cycle_outside: 'cycle length outside 21-35 days',
      cycle_within: 'cycle length within a common range',
      period_outside: 'period length outside 2-7 days',
      symptoms_selected: 'selected symptoms: {list}',
    },
    symptoms: {
      irregular_cycles: 'irregular cycles',
      weight_gain: 'weight gain',
      hirsutism: 'excess hair growth',
      acne: 'acne',
      hair_loss: 'hair loss',
      mood_changes: 'mood changes',
      fatigue: 'fatigue',
      pelvic_pain: 'pelvic pain',
      infertility: 'fertility concerns',
      darkening: 'skin darkening',
    },
    impacts: [
      'Irregular ovulation and fertility challenges',
      'Insulin resistance and blood sugar changes',
      'Weight changes and metabolism shifts',
      'Cholesterol and cardiovascular risk factors',
      'Mood, stress, or sleep disruptions',
      'Skin and hair changes',
      'Endometrial health changes with infrequent periods',
      'Fatigue and energy fluctuations',
    ],
  },
  te: {
    headerTitle: 'పీసీఓఎస్ అవగాహన',
    headerNote: 'ఇది విద్యాపరమైన సమాచారం మాత్రమే. ఇది పీసీఓఎస్ నిర్ధారణ కాదు. వైద్య సలహా కోసం వైద్యుణ్ని సంప్రదించండి.',
    labelLevel: 'సూచన స్థాయి',
    labelImpacts: 'దీర్ఘకాలిక ప్రభావాలు (సాధ్యమైనవి)',
    defaultReason: 'సూచనలు చూడడానికి సైకిల్ పొడవు మరియు లక్షణాలను నమోదు చేయండి.',
    basedOn: '{reasons} ఆధారంగా.',
    levels: {
      insufficient: 'డేటా సరిపోదు',
      low: 'తక్కువ సూచనలు',
      moderate: 'మధ్యమ సూచనలు',
      high: 'ఎక్కువ సూచనలు',
    },
    reasons: {
      cycle_outside: '21–35 రోజుల పరిధి వెలుపల సైకిల్ పొడవు',
      cycle_within: 'సాధారణ పరిధిలో సైకిల్ పొడవు',
      period_outside: '2–7 రోజుల పరిధి వెలుపల పీరియడ్ పొడవు',
      symptoms_selected: 'ఎంచుకున్న లక్షణాలు: {list}',
    },
    symptoms: {
      irregular_cycles: 'అనియత సైకిళ్లు',
      weight_gain: 'బరువు పెరుగుదల',
      hirsutism: 'అధిక రోమ వృద్ధి',
      acne: 'మొటిమలు',
      hair_loss: 'జుట్టు రాలడం',
      mood_changes: 'మూడ్ మార్పులు',
      fatigue: 'అలసట',
      pelvic_pain: 'పెల్విక్ నొప్పి',
      infertility: 'సంతానోత్పత్తి ఆందోళనలు',
      darkening: 'చర్మం నలుపుగా మారడం',
    },
    impacts: [
      'అనియత ఒవ్యులేషన్ మరియు ఫెర్టిలిటీ సవాళ్లు',
      'ఇన్సులిన్ రెసిస్టెన్స్ మరియు రక్తంలో చక్కెర మార్పులు',
      'బరువు మార్పులు మరియు మెటబాలిజం మార్పులు',
      'కొలెస్ట్రాల్ మరియు గుండె సంబంధిత ప్రమాద కారకాలు',
      'మూడ్, ఒత్తిడి లేదా నిద్రలో అంతరాలు',
      'చర్మం మరియు జుట్టు మార్పులు',
      'అరుదైన పీరియడ్స్‌లో ఎండోమెట్రియం ఆరోగ్య మార్పులు',
      'అలసట మరియు శక్తి మార్పులు',
    ],
  },
  hi: {
    headerTitle: 'पीसीओएस समझ',
    headerNote: 'यह केवल शैक्षिक जानकारी है. यह पीसीओएस का निदान नहीं है. चिकित्सा सलाह के लिए डॉक्टर से संपर्क करें.',
    labelLevel: 'संकेत स्तर',
    labelImpacts: 'संभावित दीर्घकालिक प्रभाव',
    defaultReason: 'सूझाव देखने के लिए साइकिल लंबाई और लक्षण भरें।',
    basedOn: '{reasons} के आधार पर.',
    levels: {
      insufficient: 'पर्याप्त डेटा नहीं',
      low: 'कम संकेत',
      moderate: 'मध्यम संकेत',
      high: 'उच्च संकेत',
    },
    reasons: {
      cycle_outside: '21–35 दिनों की सीमा से बाहर साइकिल लंबाई',
      cycle_within: 'सामान्य सीमा में साइकिल लंबाई',
      period_outside: '2–7 दिनों की सीमा से बाहर पीरियड लंबाई',
      symptoms_selected: 'चुने हुए लक्षण: {list}',
    },
    symptoms: {
      irregular_cycles: 'अनियमित चक्र',
      weight_gain: 'वजन बढ़ना',
      hirsutism: 'अधिक बाल वृद्धि',
      acne: 'मुहांसे',
      hair_loss: 'बाल झड़ना',
      mood_changes: 'मूड बदलाव',
      fatigue: 'थकान',
      pelvic_pain: 'पेल्विक दर्द',
      infertility: 'प्रजनन संबंधी चिंता',
      darkening: 'त्वचा का काला पड़ना',
    },
    impacts: [
      'अनियमित अंडोत्सर्जन और प्रजनन चुनौतियाँ',
      'इंसुलिन प्रतिरोध और रक्त शर्करा में बदलाव',
      'वजन और मेटाबॉलिज्म में बदलाव',
      'कोलेस्ट्रॉल और हृदय जोखिम कारक',
      'मूड, तनाव या नींद में बाधा',
      'त्वचा और बालों में बदलाव',
      'अनियमित पीरियड्स के साथ एंडोमेट्रियम स्वास्थ्य में बदलाव',
      'थकान और ऊर्जा में उतार-चढ़ाव',
    ],
  },
};

document.addEventListener('DOMContentLoaded', function () {
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

  requestAnimationFrame(loadAnalysisResults);

  const printBtn = document.getElementById('printReport');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  const downloadBtn = document.getElementById('downloadPDF');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      alert('PDF download will be available in a future update. Please use Print and Save as PDF for now.');
    });
  }
});

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse localStorage key: ${key}`, err);
    return null;
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getInsightLanguage() {
  const stored = localStorage.getItem(INSIGHT_LANG_KEY) || 'en';
  if (stored in insightI18n) return stored;
  return 'en';
}

function buildCareSuggestions(entry) {
  const safeEntry = entry && typeof entry === 'object' ? entry : {};
  const suggestions = [];
  const symptoms = Array.isArray(safeEntry.symptoms) ? safeEntry.symptoms : [];
  const cycle = Number(safeEntry.cycle_length);
  const period = Number(safeEntry.period_length);
  const sleep = Number(safeEntry.sleep);
  const stress = safeEntry.stress;
  const city = (safeEntry.city || '').trim();
  const pcos = safeEntry.pcos;

  suggestions.push('Save your primary clinic or OB-GYN phone number in your contacts for quick access.');
  suggestions.push('If you ever feel severe pain, heavy bleeding, or faintness, seek urgent care using your local emergency number.');

  if (city) {
    suggestions.push(`Check for women's health or endocrinology clinics in ${city} if you need a specialist.`);
  }

  if (pcos === 'not_diagnosed' && symptoms.length > 0) {
    suggestions.push('If symptoms persist, consider a clinical checkup for PCOS screening.');
  }

  if (pcos === 'diagnosed') {
    suggestions.push('Bring your recent cycle and symptom notes to your next appointment.');
  }

  if (Number.isFinite(cycle) && (cycle < 21 || cycle > 35)) {
    suggestions.push('Long or short cycles are worth monitoring; schedule a check-in if this pattern continues.');
  }

  if (Number.isFinite(period) && (period < 2 || period > 7)) {
    suggestions.push('Unusually short or long periods can be discussed with a clinician.');
  }

  if (stress === 'high' || (Number.isFinite(sleep) && sleep > 0 && sleep < 6)) {
    suggestions.push('If stress or sleep issues are ongoing, ask about supportive care options.');
  }

  if (symptoms.includes('pelvic_pain')) {
    suggestions.push('Pelvic pain that is new or severe should be evaluated.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Keep tracking consistently so your care team can spot trends.');
  }

  return Array.from(new Set(suggestions)).slice(0, 6);
}

function buildPcosInsight(entry) {
  const safeEntry = entry && typeof entry === 'object' ? entry : {};
  const symptoms = Array.isArray(safeEntry.symptoms) ? safeEntry.symptoms : [];
  const cycle = Number(safeEntry.cycle_length);
  const period = Number(safeEntry.period_length);
  const reasonParts = [];
  let score = 0;

  if (Number.isFinite(cycle)) {
    if (cycle < 21 || cycle > 35) {
      score += 2;
      reasonParts.push({ key: 'cycle_outside' });
    } else {
      reasonParts.push({ key: 'cycle_within' });
    }
  }

  if (Number.isFinite(period)) {
    if (period < 2 || period > 7) {
      score += 1;
      reasonParts.push({ key: 'period_outside' });
    }
  }

  const symptomSignals = [
    { key: 'acne', label: 'acne' },
    { key: 'hirsutism', label: 'excess hair growth' },
    { key: 'hair_loss', label: 'hair loss' },
    { key: 'weight_gain', label: 'weight gain' },
    { key: 'infertility', label: 'fertility concerns' },
    { key: 'irregular_cycles', label: 'irregular cycles' },
  ];

  const matchedSymptoms = symptomSignals
    .filter(item => symptoms.includes(item.key))
    .map(item => item.label);

  if (matchedSymptoms.length > 0) {
    score += Math.min(3, matchedSymptoms.length);
    reasonParts.push({ key: 'symptoms_selected', data: { list: matchedSymptoms } });
  }

  let levelKey = 'insufficient';
  if (Number.isFinite(cycle) || matchedSymptoms.length > 0 || Number.isFinite(period)) {
    if (score <= 1) levelKey = 'low';
    else if (score <= 3) levelKey = 'moderate';
    else levelKey = 'high';
  }

  return {
    levelKey,
    reasonParts,
  };
}

function getFallbackRiskFromInsight(levelKey) {
  if (levelKey === 'high') return { score: 72, level: 'high' };
  if (levelKey === 'moderate') return { score: 48, level: 'moderate' };
  if (levelKey === 'low') return { score: 24, level: 'low' };
  return { score: 16, level: 'low' };
}

function buildFallbackFindings(entry, insight) {
  const safeEntry = entry && typeof entry === 'object' ? entry : {};
  const findings = [];
  const cycle = Number(safeEntry.cycle_length);
  const period = Number(safeEntry.period_length);
  const symptoms = Array.isArray(safeEntry.symptoms) ? safeEntry.symptoms : [];

  if (Number.isFinite(cycle)) {
    findings.push(
      cycle >= 21 && cycle <= 35
        ? `Cycle length (${cycle} days) is within a common range.`
        : `Cycle length (${cycle} days) is outside the common 21-35 day range.`
    );
  }
  if (Number.isFinite(period)) {
    findings.push(
      period >= 2 && period <= 7
        ? `Period length (${period} days) is within a common range.`
        : `Period length (${period} days) is outside the common 2-7 day range.`
    );
  }
  findings.push(
    symptoms.length > 0
      ? `${symptoms.length} symptom(s) were selected in your entry.`
      : 'No symptoms were selected in your entry.'
  );
  findings.push(`Local indicator level: ${insight.levelKey}.`);
  return findings;
}

function buildFallbackSummary(levelKey) {
  if (levelKey === 'high') {
    return 'Your entry shows higher PCOS indicators. Please consider speaking with a clinician for a detailed evaluation.';
  }
  if (levelKey === 'moderate') {
    return 'Your entry shows moderate PCOS indicators. Continue tracking and consider a clinical checkup if symptoms continue.';
  }
  if (levelKey === 'low') {
    return 'Your entry shows lower PCOS indicators right now. Keep healthy routines and continue tracking for trends.';
  }
  return 'Not enough data to estimate PCOS indicators. Complete more details and keep tracking consistently.';
}

function buildFallbackAnalysis(entry) {
  const insight = buildPcosInsight(entry);
  const risk = getFallbackRiskFromInsight(insight.levelKey);
  const findings = buildFallbackFindings(entry, insight);
  const recommendations = buildCareSuggestions(entry);
  const summary = buildFallbackSummary(insight.levelKey);

  return {
    success: true,
    source: 'local_fallback',
    analysis: {
      risk_score: risk.score,
      risk_level: risk.level,
      summary: summary,
      key_findings: findings,
      recommendations: recommendations,
    },
    report: {
      summary: summary,
      risk_level: risk.level,
      risk_score: risk.score,
      key_findings: findings,
      recommendations: recommendations,
    },
    doctors: [],
  };
}

function getAnalysisSummary(analysis) {
  if (!analysis || typeof analysis !== 'object') return '';
  return analysis.analysis?.summary || analysis.report?.summary || analysis.summary || '';
}

function getAnalysisFindings(analysis) {
  if (!analysis || typeof analysis !== 'object') return [];
  return analysis.analysis?.key_findings || analysis.report?.key_findings || analysis.key_findings || [];
}

function getAnalysisRecommendations(analysis) {
  if (!analysis || typeof analysis !== 'object') return [];
  return analysis.analysis?.recommendations || analysis.report?.recommendations || analysis.recommendations || [];
}

function loadAnalysisResults() {
  const analysis = readJSON('pcos_last_analysis');
  const entry = readJSON('pcos_last_entry');

  if (!analysis && !entry) {
    showNoDataState();
    return;
  }

  const safeEntry = entry && typeof entry === 'object' ? entry : {};
  const safeAnalysis = analysis && typeof analysis === 'object'
    ? analysis
    : buildFallbackAnalysis(safeEntry);

  renderRiskAssessment(safeAnalysis);
  renderPcosInsightResult(safeEntry, safeAnalysis);
  renderCareSuggestionsResult(safeEntry, safeAnalysis);
  renderFindings(safeAnalysis, safeEntry);
  renderRecommendations(safeAnalysis, safeEntry);
  renderDoctors(safeAnalysis, safeEntry);
  renderNextSteps(safeAnalysis);
  renderTips(safeAnalysis);
  renderWarnings(safeAnalysis);
}

function showNoDataState() {
  const container = document.querySelector('.container');
  if (!container) return;

  container.innerHTML = `
    <div class="no-data-message reveal" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 0;animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;">
      <div style="font-size:4rem;">📭</div>
      <h2 style="margin:1.2rem 0 0.5rem 0; color:var(--color-text-primary,#1e293b);font-weight:700;">No Analysis Data Found</h2>
      <p style="color:var(--color-text-muted,#94a3b8);font-size:1.1rem;max-width:340px;text-align:center;">Please complete the health form first to get your personalized report.<br>All your data stays private and secure.</p>
      <a href="form.html" class="btn btn--primary btn--lg" style="margin-top:2rem;">Complete Health Form</a>
    </div>
  `;
}

function renderRiskAssessment(analysis) {
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
    const summary = getAnalysisSummary(analysis);
    summaryText.textContent = summary || 'Based on your health data, maintain healthy lifestyle habits and regular checkups.';
  }
}

function getRiskLevel(score) {
  if (score <= 25) return { key: 'low', label: 'Low Risk' };
  if (score <= 50) return { key: 'moderate', label: 'Moderate Risk' };
  return { key: 'high', label: 'Higher Risk' };
}

function renderPcosInsightResult(entry, analysis) {
  const levelEl = document.getElementById('pcosLevel');
  const reasonEl = document.getElementById('pcosReason');
  const impactsEl = document.getElementById('pcosImpacts');
  const titleEl = document.getElementById('pcosInsightTitle');
  const noteEl = document.getElementById('pcosInsightNote');
  const levelLabelEl = document.getElementById('pcosLevelLabel');
  const impactsLabelEl = document.getElementById('pcosImpactsLabel');
  if (!levelEl || !reasonEl || !impactsEl || !titleEl || !noteEl || !levelLabelEl || !impactsLabelEl) return;

  const insight = buildPcosInsight(entry);
  const lang = getInsightLanguage();
  const t = insightI18n[lang] || insightI18n.en;

  titleEl.textContent = t.headerTitle;
  noteEl.textContent = t.headerNote;
  levelLabelEl.textContent = t.labelLevel;
  impactsLabelEl.textContent = t.labelImpacts;
  levelEl.textContent = t.levels[insight.levelKey] || t.levels.insufficient;

  let localReason = t.defaultReason;
  if (insight.reasonParts.length > 0) {
    const reasonsText = insight.reasonParts.map(part => {
      if (part.key === 'symptoms_selected') {
        const list = Array.isArray(part.data?.list) ? part.data.list : [];
        const labels = list.map(key => t.symptoms[key] || key).join(', ');
        return t.reasons.symptoms_selected.replace('{list}', labels);
      }
      return t.reasons[part.key] || part.key;
    }).join('; ');
    localReason = t.basedOn.replace('{reasons}', reasonsText);
  }

  const summary = getAnalysisSummary(analysis);
  const findings = getAnalysisFindings(analysis);
  const enrichedParts = [localReason];
  if (summary) enrichedParts.push(summary);
  if (findings.length > 0) {
    enrichedParts.push(`Key findings: ${findings.slice(0, 2).join(' ')}`);
  }
  reasonEl.textContent = enrichedParts.join(' ');

  impactsEl.innerHTML = t.impacts.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderCareSuggestionsResult(entry, analysis) {
  const listEl = document.getElementById('assistantInlineList');
  if (!listEl) return;

  const backend = getAnalysisRecommendations(analysis);
  const local = buildCareSuggestions(entry);
  const merged = Array.from(new Set([...(Array.isArray(backend) ? backend : []), ...local])).slice(0, 6);
  const finalItems = merged.length > 0
    ? merged
    : ['Keep tracking consistently. Regular entries improve your personalized report.'];

  listEl.innerHTML = finalItems.map(item => `
    <div class="assistant-inline-item">${escapeHtml(item)}</div>
  `).join('');
}

function renderFindings(analysis, entry) {
  const findingsList = document.getElementById('findingsList');
  if (!findingsList) return;

  let findings = getAnalysisFindings(analysis);
  if (!Array.isArray(findings) || findings.length === 0) {
    findings = buildFallbackFindings(entry, buildPcosInsight(entry));
  }
  findingsList.innerHTML = findings.map(f => `<li>${escapeHtml(f)}</li>`).join('');
}

function renderRecommendations(analysis, entry) {
  const recList = document.getElementById('recommendationsList');
  if (!recList) return;

  let recs = getAnalysisRecommendations(analysis);
  if (!Array.isArray(recs) || recs.length === 0) {
    recs = buildCareSuggestions(entry).slice(0, 4);
  }
  recList.innerHTML = recs.map(r => `<li>${escapeHtml(r)}</li>`).join('');
}

function renderDoctors() {
  const doctorsGrid = document.getElementById('doctorsGrid');
  const helplinesGrid = document.getElementById('helplinesGrid');
  if (!doctorsGrid || !helplinesGrid) return;

  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Gynecologist',
      hospital: "City Women's Health Center",
      rating: '4.8',
      expertise: ['PCOS', 'Fertility', 'Endocrinology'],
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Endocrinologist',
      hospital: 'Metro Medical Center',
      rating: '4.6',
      expertise: ['Hormonal Disorders', 'PCOS', 'Diabetes'],
    },
  ];

  doctorsGrid.innerHTML = doctors.map(doc => `
    <div class="doctor-card" tabindex="0" aria-label="Doctor ${escapeHtml(doc.name)}, ${escapeHtml(doc.specialty)}, ${escapeHtml(doc.hospital)}">
      <div class="doctor-header">
        <h3>${escapeHtml(doc.name)}</h3>
        <span class="doctor-rating">★ ${escapeHtml(doc.rating)}</span>
      </div>
      <div class="doctor-specialty">${escapeHtml(doc.specialty)}</div>
      <div class="doctor-hospital">🏥 ${escapeHtml(doc.hospital)}</div>
      <div class="doctor-expertise">
        ${doc.expertise.map(e => `<span class="expertise-tag">${escapeHtml(e)}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const helplines = [
    { name: 'Emergency Services', number: '102' },
    { name: 'Women Health Helpline', number: '104' },
  ];

  helplinesGrid.innerHTML = helplines.map(h => `
    <div class="helpline-item">
      <strong>${escapeHtml(h.name)}</strong>
      <a href="tel:${escapeHtml(h.number)}">${escapeHtml(h.number)}</a>
    </div>
  `).join('');
}

function renderNextSteps() {
  const nextStepsList = document.getElementById('nextStepsList');
  if (!nextStepsList) return;

  const steps = [
    'Schedule a follow-up appointment with your healthcare provider',
    'Continue tracking your cycle and symptoms regularly',
    'Consider lifestyle modifications as recommended',
    'Share this report with your doctor during your next visit',
  ];

  nextStepsList.innerHTML = steps.map(s => `<li>${escapeHtml(s)}</li>`).join('');
}

function renderTips() {
  const tipsList = document.getElementById('tipsList');
  if (!tipsList) return;

  const tips = [
    'Maintain a balanced diet rich in fiber and protein',
    'Exercise regularly - aim for 30 minutes most days',
    'Get 7-9 hours of quality sleep each night',
    'Manage stress through meditation or yoga',
    'Stay hydrated and limit processed foods',
  ];

  if (tipsList.offsetParent !== null) {
    tipsList.innerHTML = tips.map(t => `<li>${escapeHtml(t)}</li>`).join('');
  }
}

function renderWarnings() {
  const warningList = document.getElementById('warningList');
  if (!warningList) return;

  const warnings = [
    'Severe pelvic pain or heavy bleeding - seek immediate care',
    'Signs of ovarian torsion (sudden severe pain, vomiting)',
    'Difficulty breathing or chest pain',
    'Persistent high fever (above 101°F or 38.3°C)',
    'Feeling faint or losing consciousness',
  ];

  warningList.innerHTML = warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('');
}
