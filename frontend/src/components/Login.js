import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const emailHandler = (e) => {
        setEmail(e.target.value);
    }

    const passwordHandler = (e) => {
        setPassword(e.target.value);
    }
    
    const handleOAuthLogin = async () => {
        try {
          const { data } = await axios.get('http://localhost:4000/auth/url');
          window.location.href = data.url; 
        } catch (err) {
          alert('Failed to initiate OAuth login');
        }
      };
    //   useEffect(() => {
    //     // Check if the user is already logged in
    //     const checkAuth = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:4000/auth/logged_in', { withCredentials: true });
    //             if (response.data.loggedIn) {
    //                 navigate('/in', { state: { id: response.data.user.email } });
    //             }
    //         } catch (error) {
    //             console.error('Error checking authentication status', error);
    //         }
    //     };
    //     checkAuth();
    // }, [navigate]);
    async function submit(e) {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/login', { email, password }, { withCredentials: true });

            // No need to store tokens manually
            // axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Navigate to the next page
            navigate('/in', { state: { id: email } , replace : true});
            window.addEventListener('popstate', handlePopState);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('Incorrect password');
            } else if (error.response && error.response.status === 404) {
                alert('User not found');
            } else {
                alert('Login failed. Please try again.');
            }
        }
    }
    const handlePopState = (event) => {
        if (window.location.pathname === '/') {
            navigate('/in', { replace: true });
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup event listener when the component unmounts
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return (
        <div className="login">
            <h1>Login Page</h1>
            <form>
                <input type="email" onChange={emailHandler} placeholder="Enter email" required />
                <br />
                <input type="password" onChange={passwordHandler} placeholder="Enter password" required />
                <br />
                <input type="submit" onClick={submit} value="Login" />
            </form>
            <Link to="/forgotpassword">Forgot Password</Link>
            <br />
            <p>OR</p>
            <br />
            <Link to="/signup">Sign Up Page</Link>
            <button
          className="link"
          onClick={() => handleOAuthLogin()}>
          Sign in with Google
        </button>
        </div>
    );
}

export default Login;
