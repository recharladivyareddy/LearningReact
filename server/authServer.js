const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const queryString = require('querystring');


const app = express();
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000', // specify the origin you want to allow
    credentials: true, // enable the `Access-Control-Allow-Credentials` header
};

app.use(cors(corsOptions));


mongoose.connect('mongodb://localhost:27017/codingPlatform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
});

const User = mongoose.model('User', userSchema);

let refreshTokens = [];
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

// Generate Refresh Token
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET , {expiresIn:'2m'});
    refreshTokens.push(refreshToken); // Save refresh token (in production, save to a database)
    return refreshToken;
}

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const accessToken = generateAccessToken({ email: user.email });
            const refreshToken = generateRefreshToken({ email: user.email });

            // Set cookies
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 2 * 60 * 1000 // 2 minutes
            });

            res.json('Login successful');
        } else {
            res.status(401).json('Invalid credentials');
        }
    } catch (err) {
        res.status(500).json('Server error');
    }
});


app.post('/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json('Refresh token is required');

    if (!refreshTokens.includes(refreshToken)) return res.status(403).json('Invalid refresh token');

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Token is invalid');
        const accessToken = generateAccessToken({ email: user.email });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.json({ accessToken });
    });
});
const config = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUrl: process.env.REDIRECT_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiration: process.env.TOKEN_EXPIRATION || '36000s', 
  };
  
  const authParams = queryString.stringify({
    client_id: config.clientId,
    redirect_uri: config.redirectUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state: 'standard_oauth',
    prompt: 'consent',
  });
  
  const getTokenParams = (code) => queryString.stringify({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUrl,
  });
  
  app.get('/auth/url', (_, res) => {
    res.json({ url: `${config.authUrl}?${authParams}` });
  });
  
  app.get('/auth/token', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Authorization code must be provided' });
  
    try {
      const tokenParam = getTokenParams(code);
      const { data: { id_token } } = await axios.post(`${config.tokenUrl}?${tokenParam}`);
  
      if (!id_token) return res.status(400).json({ message: 'Auth error' });
  
      const { email, name, picture } = jwt.decode(id_token);
      const user = { name, email, picture };
  
      let existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        existingUser = new User(user);
        await existingUser.save();
      }
  
      const token = jwt.sign({ user: existingUser }, config.tokenSecret, { expiresIn: config.tokenExpiration });
  
      res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 10, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ user: existingUser });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });
  app.get('/auth/logged_in', (req, res) => {
    try {
      const token = req.cookies.token;
  
      if (!token) return res.json({ loggedIn: false });
  
      const { user } = jwt.verify(token, config.tokenSecret);
      const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });
  
      res.cookie('token', newToken, { maxAge: 1000 * 60 * 60 * 10, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ loggedIn: true, user });
    } catch (err) {
      res.json({ loggedIn: false });
    }
  });
  
  app.post('/auth/logout', (_, res) => {
    res.clearCookie('token').json({ message: 'Logged out' });
  });
app.post('/logout', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    refreshTokens = refreshTokens.filter(t => t !== refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(204).json('Logged out successfully');
});



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

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        await newUser.save();

        const accessToken = generateAccessToken({ email: newUser.email });
        const refreshToken = generateRefreshToken({ email: newUser.email });

        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

        res.status(201).json('Signup successful');
    } catch (err) {
        console.log(err);
        res.status(500).json('Error signing up');
    }
});

function authenticateToken(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return res.status(401).json('Token is required');

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Token is invalid or expired');
        req.user = user;
        next();
    });
}


app.get('/protected-route', authenticateToken, (req, res) => {
    try {
        // Simulate some additional logic if necessary
        const protectedData = 'This is a protected route';
        res.status(200).json({
            success: true,
            message: 'Access to protected route granted',
            data: protectedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message
        });
    }
});





const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(to, subject, text) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: '21bd1a055gcsec@gmail.com',
            to: to,
            subject: subject,
            text: text,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json('User not found');

        const resetToken = jwt.sign({ email: user.email }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '15m' });

        // Set the reset token as a cookie
        res.cookie('resetToken', resetToken, {
            httpOnly: true, // Ensures the cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // You can send a general link, such as a link to the reset password page, without the token in the URL
        const resetLink = `http://localhost:3000/reset-password`;

        await sendMail(user.email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);
        res.json('Password reset link sent to your email');
    } catch (err) {
        console.log(err);
        res.status(500).json('Server error');
    }
});


app.post('/reset-password', async (req, res) => {
    const { password } = req.body;
    const resetToken = req.cookies.resetToken;

    if (!resetToken) {
        return res.status(400).json('Reset token is missing');
    }

    try {
        const decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(404).json('User not found');

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;

        await user.save();

        // Clear the reset token cookie
        res.clearCookie('resetToken');
        res.json('Password reset successful');
    } catch (err) {
        console.log(err);
        res.status(400).json('Invalid or expired token');
    }
});


const port = 4000;
app.listen(port, () => {
    console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);
    console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);

    console.log(`Auth Server is running on http://localhost:${port}`);
});
