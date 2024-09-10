import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    if (response && response.status === 401) {
      // Redirect to login if a 401 response is detected
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
