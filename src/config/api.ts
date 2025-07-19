// API Configuration for KotobaID Frontend
// Centralized configuration for all API endpoints

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

class APIConfigManager {
  private config: APIConfig;

  constructor() {
    this.config = {
      baseURL: this.getAPIBaseURL(),
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000 // 1 second
    };
    
    // Listen for settings changes from dev panel
    this.loadDevPanelSettings();
  }

  private getAPIBaseURL(): string {
    // Environment-based API URL configuration
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    // Auto-detect based on environment
    if (import.meta.env.PROD) {
      // Production: Use environment variable or default production URL
      return import.meta.env.VITE_BACKEND_URL || 'https://your-backend-domain.com';
    } else {
      // Development: Use localhost
      return 'http://localhost:3001';
    }
  }

  getConfig(): APIConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<APIConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Load settings from dev panel (localStorage)
  loadDevPanelSettings(): void {
    try {
      const savedSettings = localStorage.getItem('kotobaid-api-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Update base URL if available from dev panel
        if (settings.vertexAI?.backendEndpoint) {
          this.updateConfig({ baseURL: settings.vertexAI.backendEndpoint });
        }
      }
    } catch (error) {
      console.error('Error loading dev panel settings:', error);
    }
  }

  // Get settings for specific service from dev panel
  getDevPanelSettings() {
    try {
      const savedSettings = localStorage.getItem('kotobaid-api-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error getting dev panel settings:', error);
    }
    return null;
  }

  // Get specific endpoint URLs
  getEndpoint(path: string): string {
    return `${this.config.baseURL}${path}`;
  }

  // Vertex AI specific endpoints
  getVertexAIEndpoints() {
    return {
      status: this.getEndpoint('/api/vertexai/status'),
      test: this.getEndpoint('/api/vertexai/test'),
      translate: this.getEndpoint('/api/vertexai/translate'),
      explainKanji: this.getEndpoint('/api/vertexai/explain-kanji'),
      explainGrammar: this.getEndpoint('/api/vertexai/explain-grammar'),
      chat: this.getEndpoint('/api/vertexai/chat'),
      generateExamples: this.getEndpoint('/api/vertexai/generate-examples')
    };
  }

  // Azure OpenAI specific endpoints
  getAzureOpenAIEndpoints() {
    return {
      status: this.getEndpoint('/api/azureopenai/status'),
      test: this.getEndpoint('/api/azureopenai/test'),
      translate: this.getEndpoint('/api/azureopenai/translate'),
      explainKanji: this.getEndpoint('/api/azureopenai/explain-kanji'),
      explainGrammar: this.getEndpoint('/api/azureopenai/explain-grammar'),
      chat: this.getEndpoint('/api/azureopenai/chat'),
      generateExamples: this.getEndpoint('/api/azureopenai/generate-examples')
    };
  }

  // Health check endpoint
  getHealthEndpoint(): string {
    return this.getEndpoint('/health');
  }
}

export const apiConfig = new APIConfigManager();

// Initialize global access
if (typeof window !== 'undefined') {
  (window as any).apiConfig = apiConfig;
}

export default apiConfig;