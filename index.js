const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const secretKey = 'jwtToken= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNzA4MzE0NzcxLCJleHAiOjE3MDgzMTgzNzF9.k3g4gSJtOTiJSLtGz31X_c-uBHdVH3K_yx_sbCi2nmQ'; // Replace this with your secret key

// Sample users data (you can replace this with a database later)
const users = [];

// Middleware
app.use(bodyParser.json());

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Find user in the sample users data
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, userType: user.userType }, secretKey, { expiresIn: '1h' });

    // Send the token back to the client
    res.json({ token });
});

// Registration route
app.post('/register', (req, res) => {
    const { userType, name, email, password, std, dob, mobile, referral, adminId, teacherId } = req.body;

    // Check if the username or email is already taken
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = { id: users.length + 1, userType, name, email, password, std, dob, mobile, referral, adminId, teacherId };
    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, userType: newUser.userType }, secretKey, { expiresIn: '1h' });

    // Send the token back to the client
    res.json({ token });
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
    // If the token is valid, respond with protected data
    res.json({ message: 'This is protected data!' });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    // Get token from headers
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
