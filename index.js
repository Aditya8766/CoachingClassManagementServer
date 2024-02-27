const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const secretKey = 'jwtToken= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNzA4MzE0NzcxLCJleHAiOjE3MDgzMTgzNzF9.k3g4gSJtOTiJSLtGz31X_c-uBHdVH3K_yx_sbCi2nmQ'; 
const users = [];

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, userType: user.userType }, secretKey, { expiresIn: '1h' });

    res.json({ token });
});

app.post('/register', (req, res) => {
    const { userType, name, email, password, std, dob, mobile, referral, adminId, teacherId } = req.body;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = { id: users.length + 1, userType, name, email, password, std, dob, mobile, referral, adminId, teacherId };
    users.push(newUser);

    const token = jwt.sign({ userId: newUser.id, userType: newUser.userType }, secretKey, { expiresIn: '1h' });

    res.json({ token });
});

app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is protected data!' });
});

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
