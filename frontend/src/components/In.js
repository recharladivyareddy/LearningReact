import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from './useAuth';

const In = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Use the custom hook to manage authentication
    useAuth();

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/', { state: { message: 'You have been logged out.' } });
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
