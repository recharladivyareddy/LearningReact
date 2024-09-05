import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const In = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication status
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:4000/protected-route', { withCredentials: true });
                console.log(response.data); // Handle the response data if needed
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    // Handle token expiration or invalid token
                    alert('Session expired. Please log in again.');
                    navigate('/');
                } else {
                    console.error('An error occurred:', error);
                }
            }
        };

        checkAuth();
    }, [navigate]);

    const logout = async () => {
        try {
            await axios.post('http://localhost:4000/logout', {}, { withCredentials: true });
            // Redirect to the login page with a message
            navigate('/', { state: { message: 'You have been logged out.' } });
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    useEffect(() => {
        if (location.state && location.state.message) {
            alert(location.state.message);
        }
    }, [location.state]);

    return (
        <div>
            <p>Hi {location.state?.id || 'User'}. Welcome to the website</p>
            <button onClick={logout}>LogOut</button>
        </div>
    );
};

export default In;
