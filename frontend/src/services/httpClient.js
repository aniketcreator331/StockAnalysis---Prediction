import axios from 'axios';

const httpClient = axios.create({
  timeout: 12000,
});

const MAX_RETRIES = 1;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (!config) {
      return Promise.reject(error);
    }

    const method = (config.method || 'get').toLowerCase();
    const status = error?.response?.status;
    const isRetryableGet = method === 'get' && (!status || status >= 500 || status === 429);

    config.__retryCount = config.__retryCount || 0;

    if (isRetryableGet && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      return httpClient(config);
    }

    return Promise.reject(error);
  }
);

export default httpClient;
