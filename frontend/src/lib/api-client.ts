import type { ApiResponse, ApiError } from '../types';


const API_CONFIG = {
  PRODUCTS_BASE_URL: '/api/products',
  CUSTOMERS_BASE_URL: '/api/customers',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: boolean;
  retryAttempts?: number;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || API_CONFIG.TIMEOUT,
      retryAttempts: config.retryAttempts || API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: config.retryDelay || API_CONFIG.RETRY_DELAY,
    };
  }

  // ===== ОСНОВНЫЕ МЕТОДЫ =====
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    console.log(this.config)
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    console.log('POST request to:', endpoint);
    console.log('POST data:', data);
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }


  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const timeout = config.timeout || this.config.timeout;
    const retry = config.retry ?? true;
    const retryAttempts = config.retryAttempts || this.config.retryAttempts;

    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw await this.handleErrorResponse(response);
        }

        const data = await response.json();
        return this.handleSuccessResponse<T>(data);
      } catch (error) {
        lastError = error as Error;
        
        if (!retry || attempt === retryAttempts) {
          throw this.handleRequestError(error as Error, endpoint);
        }

        await this.delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  private handleSuccessResponse<T>(data: unknown): T {
    console.log('Raw API response:', data);
    console.log('Response type:', typeof data);
    console.log('Is object:', data && typeof data === 'object');
    

    if (data && typeof data === 'object' && 'data' in data) {
      console.log('Found data property:', (data as ApiResponse<T>).data);
      return (data as ApiResponse<T>).data;
    }
    

    if (data && typeof data === 'object' && 'rows' in data && 'columns' in data) {
      console.log('Found TableData structure:', data);
      return data as T;
    }
    
    console.log('Returning data as is:', data);
    return data as T;
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorData: Partial<ApiError> = {};

    try {
      errorData = await response.json();
    } catch {

      errorData = { message: await response.text() };
    }

    return {
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      code: errorData.code || `HTTP_${response.status}`,
      details: errorData.details,
    };
  }

  private handleRequestError(error: Error, endpoint: string): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT',
        details: { endpoint },
      };
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Network error - unable to connect to server',
        code: 'NETWORK_ERROR',
        details: { endpoint },
      };
    }

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: { endpoint },
    };
  }


  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


export const productsApiClient = new ApiClient({
  baseURL: API_CONFIG.PRODUCTS_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: API_CONFIG.RETRY_DELAY,
});

export const customersApiClient = new ApiClient({
  baseURL: API_CONFIG.CUSTOMERS_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: API_CONFIG.RETRY_DELAY,
});

// ===== ТИПИЗИРОВАННЫЕ МЕТОДЫ =====
export const productsApi = {
  get: <T>(endpoint: string, config?: RequestConfig) => productsApiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => productsApiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => productsApiClient.put<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: RequestConfig) => productsApiClient.delete<T>(endpoint, config),
};

export const customersApi = {
  get: <T>(endpoint: string, config?: RequestConfig) => customersApiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => customersApiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => customersApiClient.put<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: RequestConfig) => customersApiClient.delete<T>(endpoint, config),
};


export const api = productsApi; 