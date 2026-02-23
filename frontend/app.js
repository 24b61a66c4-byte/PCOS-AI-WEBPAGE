// PCOS Smart Assistant - Multi-Step Form with Smooth Scrolling
document.addEventListener('DOMContentLoaded', function() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Theme switching
  const THEME_KEY = 'pcos_theme';
  
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }
  }

  function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  initTheme();

  // Get API keys from config.js (create from config.example.js)
  const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || '';
  const supabaseClient = window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  async function pushEntryToSupabase(entry) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('pcos_entries')
        .insert([entry]);
      if (error) {
        console.warn('Supabase insert failed:', error);
      }
    } catch (err) {
      console.warn('Supabase insert failed:', err);
    }
  }

  async function fetchDatasetStats() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.rpc('pcos_dataset_stats');
      if (error) {
        console.warn('Supabase stats fetch failed:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Supabase stats fetch failed:', err);
      return null;
    }
  }

  async function fetchLatestEntryFromSupabase() {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('pcos_entries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Supabase latest entry fetch failed:', error);
        return null;
      }

      return data || null;
    } catch (err) {
      console.warn('Supabase latest entry fetch failed:', err);
      return null;
    }
  }

  function getLatestEntry() {
    try {
      const raw = localStorage.getItem('pcos_last_entry');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Latest entry parse failed:', err);
      return null;
    }
  }

  function buildSuggestions(entry, stats) {
    if (!entry) {
      return [
        'Add your first details to unlock personalized tips.',
        'Use the Add Details button to capture your cycle and symptoms.',
      ];
    }

    const suggestions = [];
    const cycle = Number(entry.cycle_length);
    const period = Number(entry.period_length);
    const sleep = Number(entry.sleep);
    const stress = entry.stress;
    const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];

    if (Number.isFinite(cycle) && (cycle < 21 || cycle > 35)) {
      suggestions.push('Your cycle length looks outside the common 21-35 day range. Consider tracking a few months to spot patterns.');
    }

    if (Number.isFinite(period) && (period < 2 || period > 7)) {
      suggestions.push('Your period length is outside the typical 2-7 day range. If this continues, consider discussing it with a clinician.');
    }

    if (Number.isFinite(sleep) && sleep > 0 && sleep < 6) {
      suggestions.push('Sleep under 6 hours can worsen fatigue and stress. Aim for 7-8 hours when possible.');
    }

    if (stress === 'high') {
      suggestions.push('High stress can affect cycles. Try short daily breaks, breathing exercises, or light walks.');
    }

    if (symptoms.includes('acne') || symptoms.includes('hirsutism') || symptoms.includes('hair_loss')) {
      suggestions.push('Skin and hair symptoms are common in PCOS. Consider gentle skincare and discuss hormonal options with a clinician.');
    }

    if (symptoms.includes('weight_gain')) {
      suggestions.push('Weight changes can be linked to insulin sensitivity. Balanced meals and consistent movement may help.');
    }

    if (stats) {
      if (stats.top_cycle_length) {
        suggestions.push(`Dataset note: the most common cycle length is ${stats.top_cycle_length}.`);
      }
      if (stats.top_period_length) {
        suggestions.push(`Dataset note: the most common period length is ${stats.top_period_length}.`);
      }
      if (stats.pcos_yes_percent !== null && stats.pcos_yes_percent !== undefined) {
        suggestions.push(`Dataset note: ${stats.pcos_yes_percent}% reported PCOS in the reference data.`);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Keep tracking consistently. The more entries you add, the better the insights.');
    }

    return suggestions.slice(0, 6);
  }

  function buildCareSuggestions(entry) {
    const suggestions = [];
    const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
    const cycle = Number(entry.cycle_length);
    const period = Number(entry.period_length);
    const sleep = Number(entry.sleep);
    const stress = entry.stress;
    const city = (entry.city || '').trim();
    const pcos = entry.pcos;

    suggestions.push('Save your primary clinic or OB-GYN phone number in your contacts for quick access.');
    suggestions.push('If you ever feel severe pain, heavy bleeding, or faintness, seek urgent care using your local emergency number.');

    if (city) {
      suggestions.push(`Check for women\'s health or endocrinology clinics in ${city} if you need a specialist.`);
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
    const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
    const cycle = Number(entry.cycle_length);
    const period = Number(entry.period_length);
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

  // Security: Input sanitization
  function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sanitizeInput(str, maxLength = 500) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
  }

  function getInsightLanguage() {
    const stored = localStorage.getItem(INSIGHT_LANG_KEY) || 'en';
    const select = document.getElementById('insightLanguage');
    if (select) {
      const value = select.value || stored;
      if (select.value !== value) {
        select.value = value;
      }
      return value;
    }
    return stored;
  }

  // Get OpenRouter API key from config.js (create from config.example.js)
  const OPENROUTER_API_KEY = window.CONFIG?.OPENROUTER_API_KEY || '';
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  let chatHistory = [];
  let currentImage = null;

  async function sendChatMessage(userMessage, imageBase64 = null) {
    try {
      const entry = (await fetchLatestEntryFromSupabase()) || getLatestEntry();
      const entries = JSON.parse(localStorage.getItem('pcos_entries') || '[]');
      const stats = await fetchDatasetStats();

      const contextData = {
        latestEntry: entry,
        totalEntries: entries.length,
        stats: stats,
      };

      let systemPrompt = `You are a helpful health assistant specializing in PCOS (Polycystic Ovary Syndrome). You analyze user health data and provide personalized, evidence-based insights.

User's health data:
${JSON.stringify(contextData, null, 2)}

Guidelines:
- Provide clear, supportive, and actionable insights
- Reference specific data points when relevant
- Remind users this is educational guidance, not medical diagnosis
- Suggest consulting healthcare providers for medical decisions
- Be empathetic and encouraging
- Focus on patterns, trends, and general wellness recommendations`;

      if (imageBase64) {
        systemPrompt += `

Image Analysis Instructions:
- Analyze the image for PCOS-related symptoms visible in skin/hair
- Look for: acne, excess facial/body hair (hirsutism), hair thinning, skin darkening (acanthosis nigricans)
- Provide supportive, educational observations
- Suggest when to consult a dermatologist or endocrinologist
- Be sensitive and encouraging`;
      }

      let userContent = userMessage;
      if (imageBase64) {
        userContent = [
          {
            type: 'text',
            text: userMessage || 'Please analyze this image for PCOS-related symptoms.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64
            }
          }
        ];
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: userContent }
      ];

      const modelToUse = imageBase64 
        ? 'meta-llama/llama-3.2-11b-vision-instruct:free'
        : 'meta-llama/llama-3.1-8b-instruct:free';

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: messages,
          temperature: 0.7,
          max_tokens: 600,
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      chatHistory.push({ role: 'user', content: userMessage || 'Image uploaded' });
      chatHistory.push({ role: 'assistant', content: assistantMessage });

      if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-8);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. ';
      if (error.message?.includes('API error: 401')) {
        errorMessage += 'Authentication failed. Please check your API key.';
      } else if (error.message?.includes('API error: 429')) {
        errorMessage += 'Rate limit reached. Please wait a moment and try again.';
      } else if (error.message?.includes('API error')) {
        errorMessage += 'The AI service returned an error. Please try again.';
      } else if (!navigator.onLine) {
        errorMessage += 'No internet connection detected. Please check your connection.';
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      return errorMessage;
    }
  }

  function addChatMessage(content, isUser = false, imageUrl = null) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-msg' : 'assistant-msg'}`;
    
    if (imageUrl && isUser) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.className = 'chat-image';
      img.alt = 'Uploaded image';
      messageDiv.appendChild(img);
    }
    
    if (content) {
      const textDiv = document.createElement('div');
      textDiv.textContent = content;
      messageDiv.appendChild(textDiv);
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function initAssistant() {
    const openBtn = document.querySelector('.assistant-pill');
    const panel = document.getElementById('assistantPanel');
    const closeBtn = document.getElementById('assistantClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImage = document.getElementById('removeImage');
    if (!openBtn || !panel) return;

    const openPanel = () => {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      if (chatInput) chatInput.focus();
    };

    const closePanel = () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    };

    const handleSend = async () => {
      if (!chatInput || !chatSend) return;
      const message = sanitizeInput(chatInput.value.trim(), 1000);
      const hasImage = currentImage !== null;
      
      if (!message && !hasImage) return;

      addChatMessage(message || 'Please analyze this image', true, currentImage);
      chatInput.value = '';
      chatSend.disabled = true;
      chatSend.textContent = hasImage ? 'Analyzing image...' : 'Thinking...';
      chatSend.classList.add('is-loading');

      const response = await sendChatMessage(message || 'Please analyze this image for PCOS-related symptoms', currentImage);
      addChatMessage(response, false);

      if (imagePreview) imagePreview.style.display = 'none';
      currentImage = null;

      chatSend.disabled = false;
      chatSend.textContent = 'Send';
      chatSend.classList.remove('is-loading');
      chatInput.focus();
    };

    if (uploadBtn && imageUpload) {
      uploadBtn.addEventListener('click', () => {
        imageUpload.click();
      });

      imageUpload.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          currentImage = event.target.result;
          if (previewImg && imagePreview) {
            previewImg.src = currentImage;
            imagePreview.style.display = 'flex';
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeImage) {
      removeImage.addEventListener('click', () => {
        currentImage = null;
        if (imagePreview) imagePreview.style.display = 'none';
        if (imageUpload) imageUpload.value = '';
      });
    }

    openBtn.addEventListener('click', (event) => {
      event.preventDefault();
      openPanel();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }

    if (chatSend) {
      chatSend.addEventListener('click', handleSend);
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
    }

    panel.addEventListener('click', (event) => {
      if (event.target === panel) {
        closePanel();
      }
    });
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function initDashboard() {
    const timestampEl = document.getElementById('latest-timestamp');
    const lastPeriodEl = document.getElementById('latest-last-period');
    if (!timestampEl || !lastPeriodEl) return;

    const cycleEl = document.getElementById('latest-cycle');
    const periodEl = document.getElementById('latest-period');
    const symptomsEl = document.getElementById('latest-symptoms');
    const summaryEl = document.getElementById('latest-summary');
    const insightCycleEl = document.getElementById('insight-cycle');
    const insightPeriodEl = document.getElementById('insight-period');
    const insightSymptomsEl = document.getElementById('insight-symptoms');

    const lastRaw = localStorage.getItem('pcos_last_entry');
    const entriesRaw = localStorage.getItem('pcos_entries');
    let lastEntry = null;
    let entries = [];

    try {
      lastEntry = lastRaw ? JSON.parse(lastRaw) : null;
      entries = entriesRaw ? JSON.parse(entriesRaw) : [];
    } catch (err) {
      console.warn('Dashboard load failed:', err);
    }

    if (lastEntry) {
      timestampEl.textContent = `Saved ${formatDate(lastEntry.timestamp)}`;
      lastPeriodEl.textContent = formatDate(lastEntry.last_period);
      cycleEl.textContent = lastEntry.cycle_length ? `${lastEntry.cycle_length} days` : '—';
      periodEl.textContent = lastEntry.period_length ? `${lastEntry.period_length} days` : '—';
      symptomsEl.textContent = Array.isArray(lastEntry.symptoms)
        ? `${lastEntry.symptoms.length} selected`
        : '—';
      summaryEl.textContent = 'Your latest details are ready to review.';
    } else {
      timestampEl.textContent = 'No entries yet';
      summaryEl.textContent = 'Add your first details to unlock insights.';
    }

    if (Array.isArray(entries) && entries.length > 0) {
      const cycleValues = entries.map(entry => Number(entry.cycle_length)).filter(Boolean);
      const periodValues = entries.map(entry => Number(entry.period_length)).filter(Boolean);
      const avgCycle = cycleValues.length
        ? Math.round(cycleValues.reduce((sum, value) => sum + value, 0) / cycleValues.length)
        : null;
      const avgPeriod = periodValues.length
        ? Math.round(periodValues.reduce((sum, value) => sum + value, 0) / periodValues.length)
        : null;

      if (insightCycleEl) {
        insightCycleEl.textContent = avgCycle ? `${avgCycle} days` : '—';
      }
      if (insightPeriodEl) {
        insightPeriodEl.textContent = avgPeriod ? `${avgPeriod} days` : '—';
      }
      if (insightSymptomsEl) {
        const symptomCount = lastEntry && Array.isArray(lastEntry.symptoms)
          ? lastEntry.symptoms.length
          : 0;
        insightSymptomsEl.textContent = `${symptomCount}`;
      }
    }
  }

  initDashboard();
  initAssistant();

  const form = document.getElementById('pcos-form');
  if (!form) {
    return;
  }

  const messageEl = document.getElementById('form-message');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const submitLabel = submitBtn ? submitBtn.textContent : 'Submit';

  let currentStep = 1;
  const totalSteps = 6;
  const formData = {};
  const DRAFT_KEY = 'pcos_draft';
  const DRAFT_DELAY_MS = 500;
  let draftTimer = null;

  const validationRules = {
    1: ['age'],
    2: ['cycle_length', 'period_length', 'last_period'],
    3: [],
    4: [],
    5: [],
    6: []
  };

  function setError(name, text) {
    const el = document.querySelector(`small.error[data-for="${name}"]`);
    if (el) el.textContent = text || '';
  }

  function clearErrors() {
    document.querySelectorAll('small.error').forEach(e => e.textContent = '');
  }

  function showMessage(text, type = 'success', scroll = true) {
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = `form-message show ${type}`;
      if (scroll) {
        lenis.scrollTo(messageEl, {
          offset: -100,
          duration: 1.2,
        });
      }
    }
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle('is-loading', isSubmitting);
    submitBtn.textContent = isSubmitting ? 'Saving...' : submitLabel;
  }

  function collectDraft() {
    return {
      age: document.getElementById('age').value,
      weight: document.getElementById('weight').value,
      height: document.getElementById('height').value,
      cycle_length: document.getElementById('cycle_length').value,
      period_length: document.getElementById('period_length').value,
      last_period: document.getElementById('last_period').value,
      symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
        .map(cb => cb.value),
      activity: document.getElementById('activity').value,
      sleep: document.getElementById('sleep').value,
      stress: document.getElementById('stress').value,
      diet: document.getElementById('diet').value,
      city: document.getElementById('city').value,
      pcos: document.getElementById('pcos').value,
      medications: document.getElementById('medications').value,
    };
  }

  function renderFormSuggestions() {
    const listEl = document.getElementById('assistantInlineList');
    if (!listEl) return;
    const entry = collectDraft();
    const suggestions = buildCareSuggestions(entry);
    listEl.innerHTML = suggestions.map(item => `
      <div class="assistant-inline-item">${item}</div>
    `).join('');
  }

  function renderPcosInsight() {
    const levelEl = document.getElementById('pcosLevel');
    const reasonEl = document.getElementById('pcosReason');
    const impactsEl = document.getElementById('pcosImpacts');
    const titleEl = document.getElementById('pcosInsightTitle');
    const noteEl = document.getElementById('pcosInsightNote');
    const levelLabelEl = document.getElementById('pcosLevelLabel');
    const impactsLabelEl = document.getElementById('pcosImpactsLabel');
    if (!levelEl || !reasonEl || !impactsEl || !titleEl || !noteEl || !levelLabelEl || !impactsLabelEl) return;

    const entry = collectDraft();
    const insight = buildPcosInsight(entry);
    const lang = getInsightLanguage();
    const t = insightI18n[lang] || insightI18n.en;

    titleEl.textContent = t.headerTitle;
    noteEl.textContent = t.headerNote;
    levelLabelEl.textContent = t.labelLevel;
    impactsLabelEl.textContent = t.labelImpacts;

    levelEl.textContent = t.levels[insight.levelKey] || t.levels.insufficient;

    if (insight.reasonParts.length === 0) {
      reasonEl.textContent = t.defaultReason;
    } else {
      const reasonsText = insight.reasonParts.map(part => {
        if (part.key === 'symptoms_selected') {
          const list = Array.isArray(part.data?.list) ? part.data.list : [];
          const labels = list.map(key => t.symptoms[key] || key).join(', ');
          return t.reasons.symptoms_selected.replace('{list}', labels);
        }
        return t.reasons[part.key] || part.key;
      }).join('; ');
      reasonEl.textContent = t.basedOn.replace('{reasons}', reasonsText);
    }

    impactsEl.innerHTML = t.impacts.map(item => `<li>${item}</li>`).join('');
  }

  function saveDraft() {
    try {
      const draft = collectDraft();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('Draft save failed:', err);
    }
  }

  function scheduleDraftSave() {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      saveDraft();
      renderFormSuggestions();
      renderPcosInsight();
    }, DRAFT_DELAY_MS);
  }

  function loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      if (draft.age) document.getElementById('age').value = draft.age;
      if (draft.weight) document.getElementById('weight').value = draft.weight;
      if (draft.height) document.getElementById('height').value = draft.height;
      if (draft.cycle_length) document.getElementById('cycle_length').value = draft.cycle_length;
      if (draft.period_length) document.getElementById('period_length').value = draft.period_length;
      if (draft.last_period) document.getElementById('last_period').value = draft.last_period;
      if (draft.activity) document.getElementById('activity').value = draft.activity;
      if (draft.sleep) document.getElementById('sleep').value = draft.sleep;
      if (draft.stress) document.getElementById('stress').value = draft.stress;
      if (draft.diet) document.getElementById('diet').value = draft.diet;
      if (draft.city) document.getElementById('city').value = draft.city;
      if (draft.pcos) document.getElementById('pcos').value = draft.pcos;
      if (draft.medications) document.getElementById('medications').value = draft.medications;

      if (Array.isArray(draft.symptoms)) {
        document.querySelectorAll('input[name="symptoms"]').forEach(cb => {
          cb.checked = draft.symptoms.includes(cb.value);
        });
      }

      showMessage('Draft restored from your last session.', 'success', false);
      renderFormSuggestions();
      renderPcosInsight();
    } catch (err) {
      console.warn('Draft load failed:', err);
    }
  }

  function updateProgress() {
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;

    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
      const stepNum = index + 1;
      indicator.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        indicator.classList.add('active');
      } else if (stepNum < currentStep) {
        indicator.classList.add('completed');
      }
    });
  }

  function showStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
    activeStep.classList.add('active');

    updateProgress();

    prevBtn.style.display = step === 1 ? 'none' : 'block';
    nextBtn.style.display = step === totalSteps ? 'none' : 'block';
    submitBtn.style.display = step === totalSteps ? 'block' : 'none';

    lenis.scrollTo(document.querySelector('.form-section'), {
      offset: -150,
      duration: 1.2,
    });

    // Focus management: focus key field immediately to satisfy accessibility tests
    const firstInput = activeStep.querySelector('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    if (step === 2) {
      const cycleInput = document.getElementById('cycle_length');
      if (cycleInput) {
        cycleInput.focus();
        return;
      }
    }
    if (firstInput) {
      firstInput.focus();
    }
  }

  function validateStep(step) {
    clearErrors();
    let isValid = true;

    if (step === 1) {
      const age = Number(document.getElementById('age').value || NaN);
      if (!Number.isFinite(age) || age < 10 || age > 80) {
        setError('age', 'Enter an age between 10 and 80 years.');
        isValid = false;
      }
      if (isValid) formData.age = age;
    }

    if (step === 2) {
      const cycle = Number(document.getElementById('cycle_length').value || NaN);
      const period = Number(document.getElementById('period_length').value || NaN);
      const last = document.getElementById('last_period').value;

      if (!Number.isFinite(cycle) || cycle < 15 || cycle > 120) {
        setError('cycle_length', 'Enter your average cycle length (15-120 days).');
        isValid = false;
      } else {
        formData.cycle_length = cycle;
      }

      if (!Number.isFinite(period) || period < 1 || period > 30) {
        setError('period_length', 'Enter period length between 1 and 30 days.');
        isValid = false;
      } else {
        formData.period_length = period;
      }

      if (!last) {
        setError('last_period', 'Select the start date of your last period.');
        isValid = false;
      } else {
        const lastDate = new Date(last);
        if (isNaN(lastDate.getTime())) {
          setError('last_period', 'Enter a valid date.');
          isValid = false;
        } else if (lastDate > new Date()) {
          setError('last_period', 'Date cannot be in the future.');
          isValid = false;
        } else {
          formData.last_period = last;
        }
      }
    }

    if (step === 3) {
      const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
        .map(cb => cb.value);
      formData.symptoms = symptoms;
    }

    if (step === 4) {
      const weight = Number(document.getElementById('weight').value || 0);
      const height = Number(document.getElementById('height').value || 0);
      const sleep = Number(document.getElementById('sleep').value || 0);
      const activity = document.getElementById('activity').value;
      const stress = document.getElementById('stress').value;
      const diet = document.getElementById('diet').value;

      if (weight && (weight < 30 || weight > 300)) {
        setError('weight', 'Enter valid weight (30-300 kg)');
        isValid = false;
      } else if (weight) {
        formData.weight = weight;
      }

      if (height && (height < 100 || height > 250)) {
        setError('height', 'Enter valid height (100-250 cm)');
        isValid = false;
      } else if (height) {
        formData.height = height;
      }

      if (sleep && (sleep < 0 || sleep > 24)) {
        setError('sleep', 'Enter valid sleep hours (0-24)');
        isValid = false;
      } else if (sleep) {
        formData.sleep = sleep;
      }

      formData.activity = activity;
      formData.stress = stress;
      formData.diet = diet;
    }

    if (step === 5) {
      const cityRaw = document.getElementById('city').value || '';
      const city = sanitizeInput(cityRaw, 100);
      const pcos = document.getElementById('pcos').value;
      const medications = sanitizeInput(document.getElementById('medications').value, 200);

      if (cityRaw.length > 100) {
        setError('city', 'City name must be under 100 characters.');
        isValid = false;
      }

      if (medications && medications.length > 200) {
        setError('medications', 'Medications must be under 200 characters.');
        isValid = false;
      }

      formData.city = city;
      formData.pcos = pcos;
      formData.medications = medications;
    }

    return isValid;
  }

  function generateReview() {
    const reviewContainer = document.getElementById('review-container');

    const sections = [
      {
        title: '👤 Personal',
        items: {
          'Age': formData.age,
          'Weight (kg)': formData.weight || 'Not provided',
          'Height (cm)': formData.height || 'Not provided'
        }
      },
      {
        title: '🔄 Menstrual Cycle',
        items: {
          'Cycle length (days)': formData.cycle_length,
          'Period length (days)': formData.period_length,
          'Last period': formData.last_period
        }
      },
      {
        title: '⚠️ Symptoms',
        items: {
          'Selected': formData.symptoms && formData.symptoms.length > 0 ? formData.symptoms.join(', ') : 'None'
        }
      },
      {
        title: '🏃 Lifestyle',
        items: {
          'Activity level': formData.activity || 'Not provided',
          'Sleep (hours)': formData.sleep || 'Not provided',
          'Stress level': formData.stress || 'Not provided',
          'Diet notes': formData.diet || 'None'
        }
      },
      {
        title: '🏥 Clinical',
        items: {
          'City': formData.city || 'Not provided',
          'PCOS status': formData.pcos || 'Not provided',
          'Medications': formData.medications || 'None'
        }
      }
    ];

    reviewContainer.innerHTML = sections.map(section => `
      <div class="review-section">
        <h3>${section.title}</h3>
        ${Object.entries(section.items).map(([label, value]) => `
          <div class="review-item">
            <span class="review-label">${label}</span>
            <span class="review-value">${value}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  // Step-by-step analysis - show results after each step
  async function analyzeCurrentStep(step, stepData) {
    const backendUrl = window.CONFIG?.BACKEND_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${backendUrl}/api/analyze-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: step, stepData: stepData })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Step analysis API not available, using local fallback');
    }
    // Always return local analysis so modal always shows
    return generateLocalAnalysis(step, stepData);
  }
  
  // Generate local analysis when backend is not available
  function generateLocalAnalysis(step, stepData) {
    const analysis = {
      step: step,
      step_name: getStepName(step),
      findings: [],
      tips: [],
      next_step_preview: getStepPreview(step + 1)
    };
    
    if (step === 1) {
      const age = Number(stepData.age);
      if (age && age >= 10 && age <= 80) {
        analysis.findings.push(`Age: ${age} years recorded`);
        if (age >= 15 && age <= 35) {
          analysis.tips.push('This is a common age range for PCOS diagnosis (15-35 years)');
        }
      }
      const weight = Number(stepData.weight);
      const height = Number(stepData.height);
      if (weight && height && height > 0) {
        const bmi = weight / Math.pow(height/100, 2);
        const bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        analysis.findings.push(`BMI: ${bmi.toFixed(1)} (${bmiCat})`);
        if (bmi > 25) {
          analysis.tips.push('Weight management through diet and exercise can help improve PCOS symptoms');
        }
      }
      analysis.tips.push('Click Next to continue with menstrual cycle information');
    } else if (step === 2) {
      const cycle = Number(stepData.cycle_length);
      if (cycle) {
        if (cycle >= 21 && cycle <= 35) {
          analysis.findings.push(`Cycle length: ${cycle} days (normal range)`);
        } else if (cycle < 21) {
          analysis.findings.push(`Cycle length: ${cycle} days (shorter than typical)`);
          analysis.tips.push('Short cycles may indicate hormonal imbalances');
        } else {
          analysis.findings.push(`Cycle length: ${cycle} days (longer than typical)`);
          analysis.tips.push('Longer cycles are common with PCOS');
        }
      }
      const period = Number(stepData.period_length);
      if (period) {
        if (period >= 2 && period <= 7) {
          analysis.findings.push(`Period length: ${period} days (normal range)`);
        } else if (period < 2) {
          analysis.findings.push(`Period length: ${period} days (shorter than typical)`);
        } else {
          analysis.findings.push(`Period length: ${period} days (longer than typical)`);
        }
      }
      analysis.tips.push('Click Next to continue with symptoms information');
    } else if (step === 3) {
      const symptoms = Array.isArray(stepData.symptoms) ? stepData.symptoms : [];
      if (symptoms.length > 0) {
        analysis.findings.push(`${symptoms.length} symptom(s) reported`);
        if (symptoms.includes('irregular_cycles')) {
          analysis.tips.push('Irregular cycles are a key PCOS indicator');
        }
        if (symptoms.includes('weight_gain')) {
          analysis.tips.push('Weight changes may relate to insulin resistance');
        }
        if (symptoms.includes('hirsutism') || symptoms.includes('acne')) {
          analysis.tips.push('These symptoms often improve with hormonal treatments');
        }
      } else {
        analysis.findings.push('No symptoms selected');
        analysis.tips.push('Adding symptoms helps us understand your health better');
      }
      analysis.tips.push('Click Next to continue with lifestyle information');
    } else if (step === 4) {
      const activity = stepData.activity;
      if (activity) {
        const labels = { sedentary: 'Sedentary', light: 'Lightly active', moderate: 'Moderately active', active: 'Very active' };
        analysis.findings.push(`Activity: ${labels[activity] || activity}`);
        if (activity === 'sedentary') {
          analysis.tips.push('Regular exercise improves insulin sensitivity');
        }
      }
      const sleep = Number(stepData.sleep);
      if (sleep) {
        analysis.findings.push(`Sleep: ${sleep} hours/night`);
        if (sleep < 6) {
          analysis.tips.push('Poor sleep can worsen PCOS symptoms. Aim for 7-8 hours');
        }
      }
      const stress = stepData.stress;
      if (stress) {
        const labels = { low: 'Low', moderate: 'Moderate', high: 'High' };
        analysis.findings.push(`Stress: ${labels[stress] || stress}`);
        if (stress === 'high') {
          analysis.tips.push('High stress affects hormones. Try yoga or meditation');
        }
      }
      analysis.tips.push('Click Next to continue with clinical information');
    } else if (step === 5) {
      const city = stepData.city;
      if (city) {
        analysis.findings.push(`Location: ${city}`);
        analysis.tips.push('Based on your location, we\'ll recommend nearby specialists if needed');
      }
      const pcos = stepData.pcos;
      if (pcos) {
        const labels = { diagnosed: 'Already diagnosed', suspected: 'Suspected PCOS', family_history: 'Family history', not_diagnosed: 'Not diagnosed' };
        analysis.findings.push(`PCOS Status: ${labels[pcos] || pcos}`);
        if (pcos === 'diagnosed') {
          analysis.tips.push('Regular follow-ups help manage PCOS effectively');
        } else if (pcos === 'suspected') {
          analysis.tips.push('Getting proper tests can confirm diagnosis');
        }
      }
      analysis.tips.push('Click Next to review your information');
    } else if (step === 6) {
      analysis.findings.push('All information collected');
      analysis.tips.push('Click "Save My Data" to get your complete health report with doctor recommendations');
    }
    
    return { success: true, step: step, analysis: analysis };
  }
  
  function getStepName(step) {
    const names = { 1: 'Personal Information', 2: 'Menstrual Cycle', 3: 'Symptoms', 4: 'Lifestyle', 5: 'Clinical', 6: 'Review' };
    return names[step] || 'Step ' + step;
  }
  
  function getStepPreview(step) {
    const previews = {
      2: 'Next: Menstrual Cycle details',
      3: 'Next: Symptoms you experience',
      4: 'Next: Your lifestyle habits',
      5: 'Next: Clinical information',
      6: 'Next: Review your information'
    };
    return previews[step] || '';
  }

  function showStepAnalysis(analysis) {
    let resultModal = document.getElementById('stepResultModal');
    if (!resultModal) {
      resultModal = document.createElement('div');
      resultModal.id = 'stepResultModal';
      resultModal.className = 'step-result-modal';
      resultModal.innerHTML = `
        <div class="step-result-overlay"></div>
        <div class="step-result-content">
          <div class="step-result-header">
            <h2 id="stepResultTitle">Analysis Results</h2>
            <button class="step-result-close" id="stepResultClose">&times;</button>
          </div>
          <div class="step-result-body">
            <div class="step-result-section" id="stepFindings">
              <h3>Your Inputs</h3>
              <ul id="findingsList"></ul>
            </div>
            <div class="step-result-section" id="stepTips">
              <h3>Insights & Tips</h3>
              <ul id="tipsList"></ul>
            </div>
            <div class="step-result-section" id="stepNextPreview" style="display:none;">
              <h3>Whats Next</h3>
              <p id="nextPreviewText"></p>
            </div>
          </div>
          <div class="step-result-footer">
            <button class="btn btn-secondary" id="stepResultBack">Go Back</button>
            <button class="btn btn-primary" id="stepResultContinue">Continue</button>
          </div>
        </div>
      `;
      document.body.appendChild(resultModal);
      
      document.getElementById('stepResultClose').addEventListener('click', () => {
        resultModal.classList.remove('active');
      });
      
      document.getElementById('stepResultBack').addEventListener('click', () => {
        resultModal.classList.remove('active');
      });
      
      document.getElementById('stepResultContinue').addEventListener('click', () => {
        resultModal.classList.remove('active');
        proceedToNextStep();
      });
    }
    
    const findingsList = document.getElementById('findingsList');
    const tipsList = document.getElementById('tipsList');
    const nextPreviewText = document.getElementById('nextPreviewText');
    const stepNextPreview = document.getElementById('stepNextPreview');
    
    if (analysis && analysis.analysis) {
      const data = analysis.analysis;
      document.getElementById('stepResultTitle').textContent = `Step ${data.step}: ${data.step_name}`;
      
      findingsList.innerHTML = data.findings && data.findings.length > 0 
        ? data.findings.map(f => `<li>${f}</li>`).join('')
        : '<li>No specific findings from this step.</li>';
      
      tipsList.innerHTML = data.tips && data.tips.length > 0
        ? data.tips.map(t => `<li>${t}</li>`).join('')
        : '<li>Continue to the next step for more insights.</li>';
      
      if (data.next_step_preview && currentStep < totalSteps) {
        nextPreviewText.textContent = data.next_step_preview;
        stepNextPreview.style.display = 'block';
      } else {
        stepNextPreview.style.display = 'none';
      }
    } else {
      findingsList.innerHTML = '<li>Analysis not available. Continue to next step.</li>';
      tipsList.innerHTML = '<li>Keep entering your health information for better insights.</li>';
      stepNextPreview.style.display = 'none';
    }
    
    resultModal.classList.add('active');
  }

  function proceedToNextStep() {
    currentStep++;
    if (currentStep === totalSteps) {
      generateReview();
    }
    showStep(currentStep);
    renderPcosInsight();
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) {
      showMessage('Please fix the errors above', 'error');
      return;
    }

    // Move directly to the next slide so questions appear one-by-one without blocking modals
    proceedToNextStep();
  });

  prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (validateStep(currentStep)) {
      setSubmitting(true);
      const fullData = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      try {
        // Save locally
        const entries = JSON.parse(localStorage.getItem('pcos_entries') || '[]');
        entries.push(fullData);
        localStorage.setItem('pcos_entries', JSON.stringify(entries));
        localStorage.setItem('pcos_last_entry', JSON.stringify(fullData));
        localStorage.removeItem(DRAFT_KEY);

        // Push to Supabase
        pushEntryToSupabase(fullData);

        // Call backend API for analysis
        const backendUrl = window.CONFIG?.BACKEND_URL || 'http://localhost:5000';
        
        try {
          const response = await fetch(`${backendUrl}/api/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullData)
          });

          if (response.ok) {
            const result = await response.json();
            
            // Save analysis result
            localStorage.setItem('pcos_last_analysis', JSON.stringify(result));
            
            // Show analysis and redirect to results page
            showMessage('✨ Analysis complete! Redirecting to your health report...', 'success');
            
            setTimeout(() => {
              window.location.href = 'results.html';
            }, 2000);
          } else {
            // Fallback if backend is not available
            showMessage('✨ Your health details have been saved securely!', 'success');
            setTimeout(() => {
              form.reset();
              currentStep = 1;
              Object.keys(formData).forEach(key => delete formData[key]);
              showStep(currentStep);
              renderFormSuggestions();
              renderPcosInsight();
              setSubmitting(false);
            }, 2000);
          }
        } catch (apiError) {
          console.log('Backend API not available, using fallback:', apiError);
          showMessage('✨ Your health details have been saved securely!', 'success');
          setTimeout(() => {
            form.reset();
            currentStep = 1;
            Object.keys(formData).forEach(key => delete formData[key]);
            showStep(currentStep);
            renderFormSuggestions();
            renderPcosInsight();
            setSubmitting(false);
          }, 2000);
        }
        
      } catch (err) {
        showMessage('⚠️ Error saving data. Please try again.', 'error');
        console.error('Storage error:', err);
        setSubmitting(false);
      }
    } else {
      showMessage('Please review and fix any errors', 'error');
    }
  });

  form.addEventListener('input', scheduleDraftSave);
  form.addEventListener('change', scheduleDraftSave);

  loadDraft();
  showStep(1);
  renderFormSuggestions();
  renderPcosInsight();

  // Set max date to today for last_period input to prevent future dates
  const lastPeriodInput = document.getElementById('last_period');
  if (lastPeriodInput) {
    const today = new Date().toISOString().split('T')[0];
    lastPeriodInput.setAttribute('max', today);
  }

  const insightLanguage = document.getElementById('insightLanguage');
  if (insightLanguage) {
    insightLanguage.value = getInsightLanguage();
    insightLanguage.addEventListener('change', () => {
      localStorage.setItem(INSIGHT_LANG_KEY, insightLanguage.value || 'en');
      renderPcosInsight();
    });
  }
});

