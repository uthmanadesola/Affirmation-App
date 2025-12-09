const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../db.cjs');
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const db = await connectDB();
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.collection('users').insertOne({ email, password: hashedPassword, name, createdAt: new Date() });
        const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: result.insertedId, email, name } });
    } catch (error) {
        console.error('Signup error', error);
        res.status(500).json({ message: 'Signup failed', error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await connectDB();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials, please check your email and password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials, please check your email and password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Signin error', error);
        res.status(500).json({ message: 'Signin failed', error: error.message });
    }
});



module.exports = router;

