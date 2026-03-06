# Data Security & Encryption Strategy

**Document Version:** 1.0  
**Last Updated:** March 6, 2026  
**Application:** PCOS Smart Assistant

---

## Table of Contents
1. [Current Security Architecture](#current-security-architecture)
2. [Data Classification](#data-classification)
3. [Encryption Strategy](#encryption-strategy)
4. [Implementation Guide](#implementation-guide)
5. [Best Practices](#best-practices)
6. [Security Checklist](#security-checklist)

---

## Current Security Architecture

### Overview
The PCOS Smart Assistant currently implements a **privacy-first, local-storage architecture**:

```
┌─────────────────────────────────────────┐
│         User's Browser                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   localStorage                  │   │
│  │   - Health data (unencrypted)  │   │
│  │   - Cycle tracking             │   │
│  │   - Symptoms                   │   │
│  │   - Preferences                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   JavaScript Application        │   │
│  │   - Analysis engine (local)    │   │
│  │   - Risk calculations          │   │
│  │   - No server PHI transmission │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    │ HTTPS (encrypted)
                    │
        ┌───────────┴────────────┐
        │                        │
   ┌────▼─────┐           ┌─────▼────┐
   │  AI APIs │           │  Vercel  │
   │ (queries │           │ (static  │
   │   only)  │           │  files)  │
   └──────────┘           └──────────┘
```

### Security Properties

**✅ Current Strengths:**
- No PHI transmitted to servers (except optional AI chat)
- Local-only data processing
- HTTPS encryption for all network communications
- Origin-restricted CORS
- Content Security Policy (CSP) headers

**⚠️ Current Limitations:**
- localStorage data is NOT encrypted at rest
- Vulnerable to XSS attacks
- Accessible if device is compromised
- No multi-device sync security
- Browser security depends on user's device

---

## Data Classification

### Data Categories

| Category | Examples | Storage Location | Sensitivity | Encryption Required |
|----------|----------|-----------------|-------------|-------------------|
| **Health Data (High)** | Cycle length, symptoms, period dates, weight | localStorage | HIGH | ⚠️ Recommended |
| **Personal Info (Medium)** | Age, height, city | localStorage | MEDIUM | ⚠️ Recommended |
| **Preferences (Low)** | Theme, language, settings | localStorage | LOW | ❌ Not required |
| **Session Data (Low)** | Current step, form progress | sessionStorage | LOW | ❌ Not required |
| **AI Chat Logs (Medium)** | Questions asked, responses | In-memory (not stored) | MEDIUM | ✅ In-transit only |

### Data Sensitivity Analysis

```javascript
// Current data structure in localStorage
const userData = {
  // HIGH SENSITIVITY - Contains identifiable health information
  healthData: {
    age: 28,
    weight: 65,
    height: 165,
    cycleLength: 32,
    periodLength: 5,
    lastPeriod: "2026-02-15",
    symptoms: ["Irregular cycles", "Weight gain"],
    stress: 7,
    sleep: 6,
    exercise: "Moderate"
  },
  
  // MEDIUM SENSITIVITY
  personalInfo: {
    city: "Hyderabad",
    id: "user_abc123"  // ⚠️ Could be identifying
  },
  
  // LOW SENSITIVITY
  preferences: {
    theme: "dark",
    language: "en"
  }
};
```

---

## Encryption Strategy

### Phase 1: Current Implementation (Local Storage Only)

Since all data is local, the primary security measures are:

#### 1. Device-Level Security
**User responsibility:**
- Use device passwords/biometrics
- Enable full-disk encryption (Windows BitLocker, macOS FileVault)
- Don't share devices
- Use private browsing for sensitive sessions

#### 2. Application-Level Security
```javascript
// Current: No encryption at rest (localStorage is plaintext)
localStorage.setItem('healthData', JSON.stringify(userData));

// Recommendations for users
const SECURITY_GUIDE = {
  deviceSecurity: [
    "Enable device password/PIN",
    "Use full-disk encryption",
    "Don't share devices with others",
    "Log out of browsers after use"
  ],
  browserSecurity: [
    "Clear browser data when using shared computers",
    "Use incognito mode on shared devices",
    "Keep browser updated"
  ]
};
```

### Phase 2: Optional Client-Side Encryption

For users who want enhanced local encryption:

#### Implementation: Web Crypto API

```javascript
// Encryption using Web Crypto API (AES-GCM)
class LocalDataEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }

  /**
   * Generate encryption key from user password
   * @param {string} password - User's encryption password
   * @returns {Promise<CryptoKey>}
   */
  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,  // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data
   * @param {object} data - Data to encrypt
   * @param {string} password - User's encryption password
   * @returns {Promise<string>} Encrypted data as base64
   */
  async encrypt(data, password) {
    const encoder = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.deriveKey(password, salt);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: this.algorithm, iv: iv },
      key,
      encoder.encode(JSON.stringify(data))
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Base64 encrypted data
   * @param {string} password - User's encryption password
   * @returns {Promise<object>} Decrypted data
   */
  async decrypt(encryptedData, password) {
    const decoder = new TextDecoder();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await this.deriveKey(password, salt);

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: this.algorithm, iv: iv },
        key,
        encrypted
      );

      return JSON.parse(decoder.decode(decrypted));
    } catch (e) {
      throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
  }
}

// Usage example
const encryption = new LocalDataEncryption();

// On save
async function saveHealthData(userData, userPassword) {
  if (userPassword) {
    // Encrypt before storing
    const encryptedData = await encryption.encrypt(userData.healthData, userPassword);
    localStorage.setItem('healthData_encrypted', encryptedData);
    localStorage.setItem('encryption_enabled', 'true');
  } else {
    // Store without encryption (current behavior)
    localStorage.setItem('healthData', JSON.stringify(userData.healthData));
  }
}

// On load
async function loadHealthData(userPassword) {
  if (localStorage.getItem('encryption_enabled') === 'true') {
    const encryptedData = localStorage.getItem('healthData_encrypted');
    return await encryption.decrypt(encryptedData, userPassword);
  } else {
    return JSON.parse(localStorage.getItem('healthData'));
  }
}
```

#### User Experience Flow

```
┌──────────────────────────────────────┐
│  First Time Setup                    │
├──────────────────────────────────────┤
│  [ ] Enable data encryption          │
│                                      │
│  Create encryption password:         │
│  [____________________________]      │
│                                      │
│  Confirm password:                   │
│  [____________________________]      │
│                                      │
│  ⚠️ Important:                       │
│  - This password encrypts your data  │
│  - We CANNOT recover forgotten       │
│    passwords (data will be lost)     │
│  - Write it down securely            │
│                                      │
│  [Enable Encryption] [Skip]          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Returning User (Encrypted)          │
├──────────────────────────────────────┤
│  🔒 Your data is encrypted           │
│                                      │
│  Enter password to unlock:           │
│  [____________________________]      │
│                                      │
│  [Unlock] [Forgot Password]          │
└──────────────────────────────────────┘
```

### Phase 3: Server-Side Encryption (Optional Cloud Backup)

If implementing Supabase backup:

#### Database Encryption

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted health data table
CREATE TABLE user_health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Encrypted fields (using pgcrypto)
  encrypted_data BYTEA NOT NULL,  -- Encrypted JSON blob
  
  -- Metadata (searchable, non-sensitive)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_version INTEGER DEFAULT 1,
  
  -- Encryption metadata
  encryption_algorithm TEXT DEFAULT 'aes-256-gcm',
  iv BYTEA NOT NULL,  -- Initialization vector
  
  -- Row Level Security
  CONSTRAINT user_owns_data CHECK (auth.uid() = user_id)
);

-- Enable Row Level Security
ALTER TABLE user_health_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own data"
  ON user_health_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON user_health_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_health_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON user_health_data FOR DELETE
  USING (auth.uid() = user_id);
```

#### Backend Encryption Functions

```python
# backend/encryption.py
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import os
import base64
import json

class DataEncryption:
    """
    Server-side encryption for cloud-stored health data
    Uses AES-256-GCM with per-user encryption keys
    """
    
    def __init__(self, master_key=None):
        """
        Initialize with master key from environment
        Master key is used to derive per-user keys
        """
        self.master_key = master_key or os.environ.get('ENCRYPTION_MASTER_KEY')
        if not self.master_key:
            raise ValueError("ENCRYPTION_MASTER_KEY environment variable required")
        
        self.master_key = self.master_key.encode('utf-8')
    
    def derive_user_key(self, user_id: str, salt: bytes = None):
        """
        Derive user-specific encryption key from master key + user ID
        """
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits for AES-256
            salt=salt,
            iterations=100000,
        )
        
        user_key = kdf.derive(self.master_key + user_id.encode('utf-8'))
        return user_key, salt
    
    def encrypt_data(self, data: dict, user_id: str):
        """
        Encrypt user health data
        Returns: (encrypted_data, iv, salt)
        """
        # Derive user-specific key
        user_key, salt = self.derive_user_key(user_id)
        
        # Generate random IV
        iv = os.urandom(12)  # 96 bits for GCM
        
        # Initialize AESGCM cipher
        aesgcm = AESGCM(user_key)
        
        # Serialize and encrypt data
        plaintext = json.dumps(data).encode('utf-8')
        encrypted_data = aesgcm.encrypt(iv, plaintext, None)
        
        return (
            base64.b64encode(encrypted_data).decode('utf-8'),
            base64.b64encode(iv).decode('utf-8'),
            base64.b64encode(salt).decode('utf-8')
        )
    
    def decrypt_data(self, encrypted_data: str, iv: str, salt: str, user_id: str):
        """
        Decrypt user health data
        Returns: dict
        """
        # Decode base64
        encrypted_bytes = base64.b64decode(encrypted_data)
        iv_bytes = base64.b64decode(iv)
        salt_bytes = base64.b64decode(salt)
        
        # Derive same user key
        user_key, _ = self.derive_user_key(user_id, salt_bytes)
        
        # Initialize AESGCM cipher
        aesgcm = AESGCM(user_key)
        
        # Decrypt
        try:
            plaintext = aesgcm.decrypt(iv_bytes, encrypted_bytes, None)
            return json.loads(plaintext.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# Usage in API endpoint
from flask import request, jsonify
from functools import wraps

encryption_service = DataEncryption()

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verify JWT token, extract user_id
        token = request.headers.get('Authorization')
        user_id = verify_token(token)  # Implement token verification
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(user_id, *args, **kwargs)
    return decorated_function

@app.route('/api/backup', methods=['POST'])
@require_auth
def backup_health_data(user_id):
    """Encrypt and backup user health data"""
    data = request.json
    
    # Encrypt data
    encrypted_data, iv, salt = encryption_service.encrypt_data(data, user_id)
    
    # Store in database
    supabase.table('user_health_data').upsert({
        'user_id': user_id,
        'encrypted_data': encrypted_data,
        'iv': iv,
        'salt': salt,
        'updated_at': 'now()'
    }).execute()
    
    return jsonify({'success': True, 'message': 'Data backed up successfully'})

@app.route('/api/restore', methods=['GET'])
@require_auth
def restore_health_data(user_id):
    """Restore and decrypt user health data"""
    # Retrieve from database
    result = supabase.table('user_health_data')\
        .select('encrypted_data, iv, salt')\
        .eq('user_id', user_id)\
        .single()\
        .execute()
    
    if not result.data:
        return jsonify({'error': 'No backup found'}), 404
    
    # Decrypt data
    decrypted_data = encryption_service.decrypt_data(
        result.data['encrypted_data'],
        result.data['iv'],
        result.data['salt'],
        user_id
    )
    
    return jsonify(decrypted_data)
```

---

## Implementation Guide

### Step 1: Add Encryption Toggle (Frontend)

```javascript
// frontend/components/SecuritySettings.js
class SecuritySettings {
  constructor() {
    this.encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
  }

  renderSecurityPanel() {
    return `
      <div class="security-panel">
        <h3>🔒 Data Security</h3>
        
        <div class="security-option">
          <input type="checkbox" id="enableEncryption" 
                 ${this.encryptionEnabled ? 'checked' : ''}>
          <label for="enableEncryption">
            <strong>Enable local data encryption</strong>
            <p>Protect your health data with a password</p>
          </label>
        </div>

        ${this.encryptionEnabled ? this.renderPasswordChange() : ''}
        
        <div class="security-info">
          <p>💡 <strong>Current security:</strong></p>
          <ul>
            <li>✅ Data stored only on your device</li>
            <li>✅ HTTPS encryption for web traffic</li>
            <li>${this.encryptionEnabled ? '✅' : '⚠️'} Local data encryption</li>
          </ul>
        </div>

        <div class="security-recommendations">
          <p><strong>Recommended security practices:</strong></p>
          <ul>
            <li>Enable device password/biometrics</li>
            <li>Use full-disk encryption (BitLocker/FileVault)</li>
            <li>Don't share devices with others</li>
            <li>Keep browser updated</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderPasswordChange() {
    return `
      <div class="password-change">
        <h4>Change Encryption Password</h4>
        <input type="password" id="currentPassword" placeholder="Current password">
        <input type="password" id="newPassword" placeholder="New password">
        <input type="password" id="confirmPassword" placeholder="Confirm new password">
        <button onclick="securitySettings.changePassword()">Update Password</button>
        
        <p class="warning">
          ⚠️ <strong>Warning:</strong> If you forget your password, 
          your encrypted data cannot be recovered.
        </p>
      </div>
    `;
  }

  async enableEncryption() {
    // Prompt for password
    const password = await this.promptForPassword();
    if (!password) return;

    // Encrypt existing data
    const healthData = JSON.parse(localStorage.getItem('healthData') || '{}');
    const encryption = new LocalDataEncryption();
    const encryptedData = await encryption.encrypt(healthData, password);

    // Save encrypted data
    localStorage.setItem('healthData_encrypted', encryptedData);
    localStorage.setItem('encryption_enabled', 'true');
    
    // Remove plaintext data
    localStorage.removeItem('healthData');

    alert('✅ Encryption enabled successfully!');
  }

  async disableEncryption() {
    if (!confirm('Disabling encryption will store your data in plaintext. Continue?')) {
      return;
    }

    const password = await this.promptForPassword();
    const encryption = new LocalDataEncryption();
    
    try {
      // Decrypt data
      const encryptedData = localStorage.getItem('healthData_encrypted');
      const decryptedData = await encryption.decrypt(encryptedData, password);

      // Save as plaintext
      localStorage.setItem('healthData', JSON.stringify(decryptedData));
      localStorage.removeItem('healthData_encrypted');
      localStorage.removeItem('encryption_enabled');

      alert('Encryption disabled. Data is now stored as plaintext.');
    } catch (error) {
      alert('❌ Incorrect password. Cannot disable encryption.');
    }
  }
}
```

### Step 2: Update Data Access Layer

```javascript
// frontend/services/dataService.js
class DataService {
  constructor() {
    this.encryption = new LocalDataEncryption();
    this.encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
    this.sessionPassword = null;  // Store password in memory for session
  }

  async requestPassword() {
    // If password already in session, use it
    if (this.sessionPassword) {
      return this.sessionPassword;
    }

    // Otherwise, prompt user
    const password = prompt('Enter your encryption password:');
    if (!password) {
      throw new Error('Password required to access encrypted data');
    }

    // Verify password by attempting to decrypt
    try {
      await this.loadHealthData(password);
      this.sessionPassword = password;  // Cache for session
      return password;
    } catch (error) {
      alert('Incorrect password');
      return this.requestPassword();  // Retry
    }
  }

  async loadHealthData(password = null) {
    if (!this.encryptionEnabled) {
      // Load plaintext data
      return JSON.parse(localStorage.getItem('healthData') || '{}');
    }

    // Load encrypted data
    const pwd = password || await this.requestPassword();
    const encryptedData = localStorage.getItem('healthData_encrypted');
    
    if (!encryptedData) {
      return {};
    }

    return await this.encryption.decrypt(encryptedData, pwd);
  }

  async saveHealthData(data) {
    if (!this.encryptionEnabled) {
      // Save as plaintext
      localStorage.setItem('healthData', JSON.stringify(data));
      return;
    }

    // Encrypt and save
    const password = await this.requestPassword();
    const encryptedData = await this.encryption.encrypt(data, password);
    localStorage.setItem('healthData_encrypted', encryptedData);
  }

  clearSession() {
    // Clear password from memory on logout
    this.sessionPassword = null;
  }
}

// Global instance
const dataService = new DataService();
```

### Step 3: Update All Data Read/Write Points

```javascript
// Example: Update dashboard.html
async function loadDashboard() {
  try {
    // Load data (will decrypt if needed)
    const healthData = await dataService.loadHealthData();
    
    // Display data
    displayCycleInfo(healthData);
    displaySymptoms(healthData);
    generateRecommendations(healthData);
  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Unable to load health data. Please check your password.');
  }
}

// Example: Update form.html
async function saveFormData(formData) {
  try {
    // Load existing data
    const healthData = await dataService.loadHealthData();
    
    // Update with new form data
    Object.assign(healthData, formData);
    
    // Save (will encrypt if needed)
    await dataService.saveHealthData(healthData);
    
    showSuccess('Data saved successfully!');
  } catch (error) {
    console.error('Failed to save data:', error);
    showError('Unable to save data. Please try again.');
  }
}
```

---

## Best Practices

### 1. Password Management

```javascript
// Strong password validation
class PasswordValidator {
  static MIN_LENGTH = 12;
  
  static validate(password) {
    const checks = {
      length: password.length >= this.MIN_LENGTH,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const passed = Object.values(checks).filter(v => v).length;
    return {
      valid: passed >= 4,  // At least 4 out of 5 criteria
      strength: passed <= 2 ? 'weak' : passed <= 3 ? 'medium' : 'strong',
      checks
    };
  }
  
  static showStrengthMeter(password) {
    const result = this.validate(password);
    return `
      <div class="password-strength ${result.strength}">
        <div class="strength-bar"></div>
        <span>${result.strength.toUpperCase()} - ${result.valid ? '✅' : '❌'}</span>
      </div>
      <ul class="password-requirements">
        <li class="${result.checks.length ? 'valid' : ''}">
          ${this.MIN_LENGTH}+ characters
        </li>
        <li class="${result.checks.uppercase ? 'valid' : ''}">
          Uppercase letter
        </li>
        <li class="${result.checks.lowercase ? 'valid' : ''}">
          Lowercase letter
        </li>
        <li class="${result.checks.number ? 'valid' : ''}">
          Number
        </li>
        <li class="${result.checks.special ? 'valid' : ''}">
          Special character
        </li>
      </ul>
    `;
  }
}
```

### 2. Secure Session Handling

```javascript
// Auto-lock after inactivity
class SessionManager {
  constructor(timeoutMinutes = 15) {
    this.timeout = timeoutMinutes * 60 * 1000;
    this.lastActivity = Date.now();
    this.locked = false;
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Track user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetActivity());
    });
    
    // Check for inactivity every minute
    setInterval(() => this.checkInactivity(), 60000);
  }
  
  resetActivity() {
    this.lastActivity = Date.now();
    if (this.locked) {
      this.unlock();
    }
  }
  
  checkInactivity() {
    const inactive = Date.now() - this.lastActivity;
    if (inactive > this.timeout && !this.locked) {
      this.lock();
    }
  }
  
  lock() {
    this.locked = true;
    dataService.clearSession();  // Clear cached password
    
    // Show lock screen
    document.body.innerHTML = `
      <div class="lock-screen">
        <div class="lock-message">
          <h2>🔒 Session Locked</h2>
          <p>Your session was locked due to inactivity</p>
          <button onclick="location.reload()">Unlock</button>
        </div>
      </div>
    `;
  }
  
  unlock() {
    this.locked = false;
  }
}

// Initialize session manager
const sessionManager = new SessionManager(15);  // 15 minutes
```

### 3. Export/Import with Encryption

```javascript
// Encrypted data export
async function exportHealthData() {
  const healthData = await dataService.loadHealthData();
  
  // Option 1: Export encrypted (user keeps same password)
  const encryptedExport = {
    version: '1.0',
    encrypted: true,
    data: localStorage.getItem('healthData_encrypted'),
    timestamp: new Date().toISOString()
  };
  
  // Option 2: Export plaintext (user chooses)
  const plaintextExport = {
    version: '1.0',
    encrypted: false,
    data: healthData,
    timestamp: new Date().toISOString()
  };
  
  // Let user choose
  const exportEncrypted = confirm(
    'Export encrypted data?\n\nYes = Encrypted (secure but needs password)\nNo = Plaintext (readable but less secure)'
  );
  
  const exportData = exportEncrypted ? encryptedExport : plaintextExport;
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  
  // Download file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pcos-health-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// Import with decryption
async function importHealthData(file) {
  const text = await file.text();
  const importData = JSON.parse(text);
  
  if (importData.encrypted) {
    // Ask for encryption password
    const password = prompt('Enter the password for this encrypted backup:');
    if (!password) return;
    
    const encryption = new LocalDataEncryption();
    try {
      const decryptedData = await encryption.decrypt(importData.data, password);
      await dataService.saveHealthData(decryptedData);
      alert('✅ Data imported successfully!');
    } catch (error) {
      alert('❌ Incorrect password or corrupted file');
    }
  } else {
    // Plaintext import
    await dataService.saveHealthData(importData.data);
    alert('✅ Data imported successfully!');
  }
}
```

### 4. Security Audit Logging

```javascript
// Log security events (without sensitive data)
class SecurityLogger {
  static log(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userAgent: navigator.userAgent,
      ...details
    };
    
    // Store in separate localStorage key (not encrypted)
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 events
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }
}

// Usage
SecurityLogger.log('encryption_enabled');
SecurityLogger.log('data_exported', { format: 'encrypted' });
SecurityLogger.log('password_changed');
SecurityLogger.log('decryption_failed', { attempts: 3 });
```

---

## Security Checklist

### ✅ Implementation Checklist

**Phase 1: Current State (Complete)**
- [x] HTTPS for all web traffic
- [x] Content Security Policy headers
- [x] CORS restrictions
- [x] Local-only data storage
- [x] No PHI sent to servers (except AI chat)
- [x] Medical disclaimer
- [x] Privacy policy

**Phase 2: Enhanced Local Security (Optional)**
- [ ] Client-side encryption (Web Crypto API)
- [ ] Password-protected data
- [ ] Session timeout/auto-lock
- [ ] Encrypted export/import
- [ ] Security event logging
- [ ] Password strength requirements

**Phase 3: Cloud Backup Security (If Implemented)**
- [ ] Server-side encryption
- [ ] Per-user encryption keys
- [ ] Row-level security (RLS)
- [ ] Encrypted database fields
- [ ] Secure key management
- [ ] Authentication (JWT)
- [ ] Regular security audits

### 🔍 Regular Security Audits

**Monthly:**
- [ ] Review security logs
- [ ] Check for failed decryption attempts
- [ ] Update dependencies (`npm audit`)
- [ ] Review CSP violations

**Quarterly:**
- [ ] Penetration testing
- [ ] Code security review
- [ ] Update encryption libraries
- [ ] Review third-party service security

**Annually:**
- [ ] Full security audit
- [ ] Update security documentation
- [ ] Review password requirements
- [ ] Test disaster recovery

---

## Summary

### Current State: ✅ Secure for Personal Use
- Data stored locally only
- HTTPS encryption in transit
- No server-side PHI storage
- User-controlled data

### Recommendations:
1. **Add encryption toggle** for users who want extra protection
2. **Implement session timeout** for shared devices
3. **Provide security education** in-app
4. **Regular security updates** for dependencies

### If Expanding to Cloud:
1. **Implement server-side encryption** (AES-256-GCM)
2. **Use per-user encryption keys**
3. **Enable Row-Level Security (RLS)**
4. **Sign Business Associate Agreements** with cloud providers
5. **Conduct regular security audits**

---

**Document Maintained By:** Development Team  
**Next Review Date:** September 6, 2026  
**Version:** 1.0

**References:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [NIST Cryptographic Standards](https://www.nist.gov/itl/csd/cryptographic-standards)
