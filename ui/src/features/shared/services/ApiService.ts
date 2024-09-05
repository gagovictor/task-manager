import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    return Promise.reject({
      status: 401,
      message: error
    });
  }
);

export default apiClient;
