


/**
 * API Service
 * Centralized API call handling with error management
 */

const API_BASE_URL = window.location.origin || '';
const API_TIMEOUT = 30000; // 30 seconds

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const api = {
  /**
   * Make HTTP request with timeout and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: API_TIMEOUT,
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, null);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0, null);
    }
  },

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Upload file with progress
   */
  async uploadFile(endpoint, file, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          reject(new ApiError('Upload failed', xhr.status, xhr.responseText));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0, null));
      });

      const token = localStorage.getItem('authToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.open('POST', `${API_BASE_URL}${endpoint}`);
      xhr.send(formData);
    });
  },
};

// Health-specific API endpoints
export const healthApi = {
  /**
   * Submit health assessment form
   */
  async submitAssessment(formData) {
    return api.post('/api/assessment', formData);
  },

  /**
   * Get assessment results
   */
  async getResults(assessmentId) {
    return api.get(`/api/assessment/${assessmentId}`);
  },

  /**
   * Get AI recommendations
   */
  async getRecommendations(userId) {
    return api.get(`/api/recommendations/${userId}`);
  },

  /**
   * Get doctor recommendations
   */
  async getDoctors(location, specialty) {
    return api.get(`/api/doctors?location=${location}&specialty=${specialty}`);
  },

  /**
   * Save health data
   */
  async saveHealthData(userId, data) {
    return api.post(`/api/health/${userId}`, data);
  },

  /**
   * Get health history
   */
  async getHealthHistory(userId) {
    return api.get(`/api/health/${userId}/history`);
  },

  /**
   * Update profile
   */
  async updateProfile(userId, data) {
    return api.put(`/api/profile/${userId}`, data);
  },
};

// AI Service
export const aiApi = {
  /**
   * Send message to AI assistant
   */
  async sendMessage(message, context = {}) {
    return api.post('/api/ai/chat', { message, context });
  },

  /**
   * Get AI insight for health data
   */
  async getInsight(data) {
    return api.post('/api/ai/insight', data);
  },

  /**
   * Analyze symptoms
   */
  async analyzeSymptoms(symptoms) {
    return api.post('/api/ai/analyze-symptoms', { symptoms });
  },

  /**
   * Get lifestyle recommendations
   */
  async getLifestyleRecommendations(profile) {
    return api.post('/api/ai/lifestyle', profile);
  },
};

export { api, ApiError };
export default api;
