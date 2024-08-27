import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (accessToken) {
                
                try {
                    const response = await axios.get('http://localhost:4000/protected-route', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
            
                    console.log(response.data);
                } catch (error) {
                    if (error.response && error.response.status === 403) {
                        // Handle token expiration or invalid token
                        alert('Session expired. Please log in again.');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        // Redirect to login page
                        navigate('/');
                    } else {
                        console.error('An error occurred:', error);
                    }
                }
            } else {
                handleLogout();
            }
        };

        checkToken();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/', { state: { message: 'Session expired. Please log in again.' } });
    };
};

export default useAuth;
