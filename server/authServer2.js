import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from './api'; // Import your Axios instance

const Signup = () => {
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
            await axios.post('http://localhost:4000/signup', { email, password }, { withCredentials: true });
            // Navigate to the next page
            navigate('/in', { state: { id: email } });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Password does not meet the required criteria');
            } else if (error.response && error.response.status === 409) {
                alert('User already exists');
            } else {
                alert('Signup failed. Please try again.');
            }
        }
    }

    return (
        <div className="signup">
            <h1>Sign Up Page</h1>
            <form>
                <input type="email" onChange={emailHandler} placeholder="Enter email" required />
                <br />
                <input type="password" onChange={passwordHandler} placeholder="Enter password" required />
                <br />
                <input type="submit" onClick={submit} value="Sign Up" />
            </form>
            <Link to="/login">Login Page</Link>
            <br />
            <p>OR</p>
            <br />
            <Link to="/forgotpassword">Forgot Password</Link>
        </div>
    );
}

export default Signup;
