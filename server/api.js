import axios from 'axios';

// Axios interceptor to handle 401 errors
axios.interceptors.response.use(
    response => response,
    async (error) => {
        // Handle token expiration error (401) if necessary
        if (error.response && error.response.status === 401) {
            // Redirect to login or handle as needed
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
