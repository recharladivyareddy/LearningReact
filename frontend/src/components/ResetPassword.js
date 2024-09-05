// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//     const { token } = useParams();
//     const [newPassword, setNewPassword] = useState('');
//     const [message, setMessage] = useState('');
//     const validPassword = (password) => {
//         const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//         return strongPasswordPattern.test(password);
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const isValid = validPassword(newPassword);
//         console.log(isValid);
//         if(!isValid) {
//             setMessage('Password does not meet the required criteria.');
//             setNewPassword('');
//             return;
//         }
//         try {
//             console.log(newPassword);
//             await axios.post(`http://localhost:4000/reset-password/${token}`, {  password: newPassword });
//             setMessage('Password successfully reset');
//         } catch (error) {
//             setMessage('Error resetting password');
//         }
//     };

//     return (
//         <div>
//             <h1>Reset Password</h1>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="password"
//                     placeholder="Enter new password"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Reset Password</button>
//             </form>
//             {message && <p>{message}</p>}
//         </div>
//     );
// };

// export default ResetPassword;


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isReset, setIsReset] = useState(false);  // Track whether password reset is successful

    const validPassword = (password) => {
        const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordPattern.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validPassword(newPassword);
        if (!isValid) {
            setMessage('Password does not meet the required criteria.');
            setNewPassword('');
            return;
        }

        try {
            await axios.post(`http://localhost:4000/reset-password/${token}`, { password: newPassword });
            setMessage('Password successfully reset');
            setIsReset(true);  // Set the reset state to true
        } catch (error) {
            setMessage('Error resetting password');
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');  // Redirect to the login page
    };

    return (
        <div>
            <h1>Reset Password</h1>
            {isReset ? (
                <div>
                    <p>{message}</p>
                    <button onClick={handleLoginRedirect}>Go to Login</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                    {message && <p>{message}</p>}
                </form>
            )}
        </div>
    );
};

export default ResetPassword;
