/**
 * AIAssistant Component
 * Premium AI chat interface for healthcare recommendations
 */

export class AIAssistant {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      placeholder: options.placeholder || 'Ask about your health...',
      suggestions: options.suggestions || [
        'What lifestyle changes help with PCOS?',
        'Explain my test results',
        'Diet recommendations for me',
      ],
      onMessage: options.onMessage || (() => {}),
      onSuggestionClick: options.onSuggestionClick || (() => {}),
      streaming: options.streaming || false,
    };
    this.messages = [];
    this.isTyping = false;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="ai-assistant">
        <div class="assistant-header">
          <div class="assistant-avatar">
            <span class="avatar-icon">🤖</span>
            <span class="status-dot"></span>
          </div>
          <div class="assistant-info">
            <h3>AI Health Assistant</h3>
            <p>Powered by advanced AI • Your data stays private</p>
          </div>
          <button class="assistant-close" id="assistantClose" aria-label="Close assistant">
            ✕
          </button>
        </div>
        
        <div class="chat-messages" id="chatMessages" role="log" aria-live="polite">
          ${this.renderMessages()}
        </div>
        
        <div class="suggestions" id="suggestions">
          <p class="suggestions-label">Quick questions:</p>
          <div class="suggestion-chips">
            ${this.options.suggestions.map(suggestion => `
              <button class="suggestion-chip" data-suggestion="${suggestion}">
                ${suggestion}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="chat-input-container">
          <textarea 
            id="chatInput" 
            placeholder="${this.options.placeholder}"
            rows="1"
            aria-label="Type your message"
          ></textarea>
          <button class="send-button" id="sendMessage" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.scrollToBottom();
  }

  renderMessages() {
    if (this.messages.length === 0) {
      return `
        <div class="chat-message assistant-msg welcome">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>Hello! I'm your AI Health Assistant. I can help you understand your health better.</p>
            <p>Ask me anything about PCOS, lifestyle changes, or your health journey.</p>
          </div>
        </div>
      `;
    }

    return this.messages.map(msg => `
      <div class="chat-message ${msg.role}-msg ${msg.isTyping ? 'typing' : ''}">
        ${msg.role === 'user' ? '' : '<div class="message-avatar">🤖</div>'}
        <div class="message-content">
          ${msg.content}
        </div>
      </div>
    `).join('');
  }

  attachEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const assistantClose = document.getElementById('assistantClose');

    if (chatInput) {
      chatInput.addEventListener('input', (e) => {
        this.autoResize(e.target);
      });

      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }

    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const suggestion = chip.dataset.suggestion;
        this.addMessage(suggestion, 'user');
        this.options.onSuggestionClick(suggestion);
      });
    });

    if (assistantClose) {
      assistantClose.addEventListener('click', () => {
        this.close();
      });
    }
  }

  autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || this.isTyping) return;

    this.addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    this.options.onMessage(message);
    this.simulateAIResponse();
  }

  addMessage(content, role) {
    this.messages.push({ role, content, isTyping: false });
    this.updateMessages();
  }

  updateMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = this.renderMessages();
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  async simulateAIResponse() {
    this.isTyping = true;
    
    // Add typing indicator
    this.messages.push({ role: 'assistant', content: '', isTyping: true });
    this.updateMessages();

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Remove typing indicator and add actual response
    this.messages = this.messages.filter(m => !m.isTyping);
    
    const responses = [
      "Based on your health profile, I'd recommend focusing on lifestyle modifications. Regular exercise and a balanced diet can significantly help manage PCOS symptoms.",
      "That's a great question. PCOS affects each person differently, but common symptoms include irregular periods, weight changes, and mood fluctuations.",
      "I understand your concern. It's important to consult with a healthcare provider for personalized advice. However, maintaining a healthy weight through diet and exercise can help.",
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    this.addMessage(response, 'assistant');
    this.isTyping = false;
  }

  addSuggestion(suggestion) {
    const suggestionsContainer = document.getElementById('suggestions');
    if (suggestionsContainer) {
      const chipsContainer = suggestionsContainer.querySelector('.suggestion-chips');
      if (chipsContainer) {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.dataset.suggestion = suggestion;
        chip.textContent = suggestion;
        chip.addEventListener('click', () => {
          this.addMessage(suggestion, 'user');
          this.options.onSuggestionClick(suggestion);
          this.simulateAIResponse();
        });
        chipsContainer.appendChild(chip);
      }
    }
  }

  clearMessages() {
    this.messages = [];
    this.updateMessages();
  }

  open() {
    const assistantPanel = document.querySelector('.assistant-panel');
    if (assistantPanel) {
      assistantPanel.classList.add('open');
    }
  }

  close() {
    const assistantPanel = document.querySelector('.assistant-panel');
    if (assistantPanel) {
      assistantPanel.classList.remove('open');
    }
  }

  setTyping(typing) {
    this.isTyping = typing;
  }

  // For streaming responses
  startStream() {
    this.messages.push({ role: 'assistant', content: '', isTyping: true });
    this.updateMessages();
  }

  appendStream(chunk) {
    const lastMessage = this.messages.find(m => m.isTyping);
    if (lastMessage) {
      lastMessage.content += chunk;
      this.updateMessages();
    }
  }

  endStream() {
    const lastMessage = this.messages.find(m => m.isTyping);
    if (lastMessage) {
      lastMessage.isTyping = false;
      this.updateMessages();
    }
    this.isTyping = false;
  }
}

export default AIAssistant;
