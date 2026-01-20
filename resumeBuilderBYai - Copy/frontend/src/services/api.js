// services/api.js
import axios from 'axios';
import { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API Service class
export class ResumeAPIService {
  // Health check
  static async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      
      return response.data;
    } catch (error) {
      throw new Error('Backend service unavailable');
    }
  }

  // Get available industries
  static async getIndustries() {
    try {
      const response = await apiClient.get('/industries');
      return response.data;
    } catch (error) {
      console.error('Error fetching industries:', error);
      // Return fallback data
      return {
        success: true,
        industries: [
          { id: 'tech', name: 'Technology', standards: { colors: ['#2563eb'], fonts: ['Inter'] } },
          { id: 'medical', name: 'Medical', standards: { colors: ['#dc2626'], fonts: ['Times New Roman'] } },
          { id: 'ai', name: 'AI/ML', standards: { colors: ['#7c3aed'], fonts: ['Poppins'] } }
        ]
      };
    }
  }

  // Get available methods
  static async getMethods() {
    try {
      const response = await apiClient.get('/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching methods:', error);
      // Return fallback data
      return {
        success: true,
        methods: [
          { id: 'star', name: 'STAR Method', description: 'Situation–Task–Action–Result' },
          { id: 'car', name: 'CAR Method', description: 'Challenge–Action–Result' },
          { id: 'par', name: 'PAR Method', description: 'Problem–Action–Result' }
        ]
      };
    }
  }





 
};

// DeepSeek Integration Service
export class DeepSeekService {
  constructor(baseURL = 'http://localhost:11434') {
    this.baseURL = baseURL;
    this.model = 'deepseek-r1:1.5b';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      return false;
    }
  }

  async generateContent(prompt, options = {}) {
    const requestBody = {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        max_tokens: options.max_tokens || 4000,
        ...options
      }
    };

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('DeepSeek generation error:', error);
      throw error;
    }
  }

  // Specialized method for resume generation
  async generateResumeContent(userInfo, industry, method) {
    const prompt = this.createResumePrompt(userInfo, industry, method);
    return await this.generateContent(prompt);
  }

  // Specialized method for resume modifications
  async modifyResumeSection(currentContent, modification, context) {
    const prompt = `
You are a professional resume writer. Please modify the following content based on the user's request.

Current Content: ${JSON.stringify(currentContent)}
Modification Request: ${modification}
Context: ${context || 'General improvement'}

Please provide the improved content in JSON format, maintaining professional tone and ATS optimization.
Focus on:
- Quantifiable results
- Action-oriented language
- Industry-specific keywords
- Proper formatting

Return only the JSON response with the modified content.
`;
    
    return await this.generateContent(prompt, { temperature: 0.5 });
  }

  createResumePrompt(userInfo, industry, method) {
    return `
You are an expert resume writer specializing in ${industry} industry resumes.
Create a professional, ATS-optimized resume using the ${method} method.

User Information:
${JSON.stringify(userInfo, null, 2)}

Requirements:
1. Use ${method} methodology for all experience bullets
2. Include quantified achievements and metrics
3. Optimize for Applicant Tracking Systems (ATS)
4. Use industry-specific keywords for ${industry}
5. Professional tone with strong action verbs
6. Each bullet point should be 1-2 lines maximum
7. Focus on results and impact

Provide response in this exact JSON structure:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "skills": {
    "technical": [],
    "soft": []
  },
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "location": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "duration": "",
      "gpa": "",
      "relevant_courses": []
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": ""
    }
  ],
  "certifications": [],
  "achievements": []
}

Make it compelling and professional for ${industry} roles.
`;
  }
}

// Error handling utility
export class APIError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Retry utility for API calls
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`API attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Cache utility for API responses
export class APICache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Global API cache instance
export const apiCache = new APICache();

// Cached API wrapper
export const cachedAPICall = async (key, apiCall) => {
  // Check cache first
  const cached = apiCache.get(key);
  if (cached) {
    console.log('📦 Using cached data for:', key);
    return cached;
  }

  // Make API call and cache result
  const result = await apiCall();
  apiCache.set(key, result);
  return result;
};

// WebSocket service for real-time updates (if needed)
export class WebSocketService {
  constructor(url = 'ws://localhost:5000') {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      console.log(`Reconnecting WebSocket in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  handleMessage(data) {
    if (this.listeners.has(data.event)) {
      this.listeners.get(data.event).forEach(callback => {
        try {
          callback(data.payload);
        } catch (error) {
          console.error('WebSocket event handler error:', error);
        }
      });
    }
  }

  send(event, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export default configured instances
export const deepSeekService = new DeepSeekService();
export const wsService = new WebSocketService();