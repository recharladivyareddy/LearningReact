import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleClick = () =>{
        window.location.href = 'http://localhost:4000/auth/google';
    }
    const emailHandler = (e) => {
        setEmail(e.target.value);
    }
    const handleOAuthLogin = async () => {
        try {
          const { data } = await axios.get('http://localhost:4000/auth/url');
          window.location.href = data.url; 
        } catch (err) {
          alert('Failed to initiate OAuth login');
        }
      };
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
            // console.log(error);
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
            <h1>Signup Page</h1>
            <form>
                <input type="email" onChange={emailHandler} placeholder="Enter email" required />
                <br />
                <input type="password" onChange={passwordHandler} placeholder="Enter password" required />
                <br />
                <input type="submit" onClick={submit} value="Signup" />
            </form>
            <br />
            <p>OR</p>
            <br />
           <button onClick={()=>navigate('/login')}>Login</button>
            <span
          className="link"
          onClick={() => handleOAuthLogin()}
        >
          Sign up with Google
        </span>
        </div>
    );
}

export default Signup;
