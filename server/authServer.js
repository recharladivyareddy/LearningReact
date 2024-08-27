const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/codingPlatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

let refreshTokens = [];

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatched = await bcrypt.compare(password, user.password);
            if (isMatched) {
                const accessToken = generateAccessToken({ email: user.email });
                const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1m' });
                refreshTokens.push(refreshToken);
                res.json({ accessToken, refreshToken });
            } else {
                res.status(401).json('Password is incorrect');
            }
        } else {
            res.status(404).json('User not found');
        }
    } catch (err) {
        res.status(500).json('Server error');
    }
});

app.post('/token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json('Token is required');
    if (!refreshTokens.includes(token)) return res.status(403).json('Invalid refresh token');

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Token is invalid');
        const accessToken = generateAccessToken({ email: user.email });
        res.json({ accessToken });
    });
});

app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.status(204).json('Logged out successfully');
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

// Add this route to authServer.js
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const validPassword = (password) => {
        const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordPattern.test(password);
    };

    if (!validPassword(password)) {
        return res.status(400).json({ error: 'Password does not meet the required criteria.' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json('User already exists');
        }
        console.log(existingUser);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const newUser = new User({
            email: email,
            password: hashedPassword
        });
        
        await newUser.save();
        console.log("saved");
        // Automatically log in the user after signup
        const accessToken = generateAccessToken({ email: newUser.email });
        const refreshToken = jwt.sign({ email: newUser.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1m' });
        refreshTokens.push(refreshToken);
        
        res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
        console.log(err);
        res.status(500).json('Error signing up');
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json('Token is required');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Token is invalid or expired');
        req.user = user;
        next();
    });
}


app.get('/protected-route', authenticateToken, (req, res) => {
    res.json('This is a protected route');
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create a transporter object using your email service
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json('User not found');

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiration time (e.g., 1 hour)
    const resetTokenExpires = Date.now() + 3600000;

    // Update the user with the reset token and expiration time
    user.resetToken = hashedResetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Send email with the reset link
    const resetUrl = `http://localhost:4000/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the following link to reset your password: ${resetUrl}`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // Handle error (e.g., notify user, log the error)
    }
    

    res.json('Password reset link sent to email');
});


app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Hash the token and find the user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetToken: hashedToken, resetTokenExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json('Invalid or expired reset token');

    // Hash the new password and update the user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json('Password successfully reset');
});


const port = 4000;
app.listen(port, () => {
    console.log('ACCESS_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);
    console.log(`Auth Server is running on http://localhost:${port}`);
});
