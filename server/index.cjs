require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.cjs');
const affirmationRoutes = require('./routes/affirmations.cjs');
const aiRoutes = require('./routes/ai.cjs');
const { connectDB } = require('./db.cjs');

connectDB().then(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/affirmations', affirmationRoutes);
    app.use('/api/ai', aiRoutes);
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

