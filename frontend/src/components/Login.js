import React, { useState } from 'react';
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

    async function submit(e) {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/login', { email, password });
            const { accessToken, refreshToken } = response.data;

            // Store the tokens securely
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Navigate to the next page
            navigate('/in', { state: { id: email } });
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
        </div>
    );
}

export default Login;
