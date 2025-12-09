const express = require('express');
const { connectDB } = require('../db.cjs');
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middleware/auth.cjs');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const db = await connectDB();
        const affirmations = await db.collection('affirmations').find({}).toArray();
        res.json(affirmations);
    } catch (error) {
        console.error('Get affirmations error', error);
        res.status(500).json({ message: 'Get affirmations failed', error: error.message });
    }
});

// Get user's own affirmations (protected)
router.get(`/my`, authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const db = await connectDB();
        const affirmations = await db.collection('affirmations')
            .find({ userId: userId.toString() })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(affirmations);
    } catch (error) {
        console.error('Get user affirmations error', error);
        res.status(500).json({ message: 'Get user affirmations failed', error: error.message });
    }
});

// Create affirmation (protected - uses userId from token)
router.post(`/`, authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user.userId; // Get userId from authenticated token
        
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Affirmation text is required' });
        }
        
        const db = await connectDB();
        const result = await db.collection('affirmations').insertOne({ 
            text: text.trim(), 
            userId: userId.toString(), 
            createdAt: new Date() 
        });
        res.status(201).json({ 
            affirmation: { 
                id: result.insertedId, 
                text: text.trim(), 
                userId: userId.toString() 
            } 
        });
    } catch (error) {
        console.error('Adding affirmation error', error);
        res.status(500).json({ message: 'Adding affirmation failed', error: error.message });
    }
});

// Get random affirmation (public)
router.get(`/random`, async (req, res) => {
    try {
        const db = await connectDB();
        const affirmation = await db.collection('affirmations').aggregate([{ $sample: { size: 1 } }]).toArray(); 
        if (!affirmation || affirmation.length === 0) {
            return res.status(404).json({ message: 'No affirmations found' });
        }

        res.json(affirmation[0]);
    } catch (error) {
        console.error('Error getting your specialized affirmation', error);
        res.status(500).json({ message: 'No affirmations found', error: error.message });
    }
});

// Update affirmation (protected - only owner can update)
router.put(`/:id`, authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Affirmation text is required' });
        }
        
        const db = await connectDB();
        
        // First check if affirmation exists and belongs to user
        const existing = await db.collection('affirmations').findOne({ _id: new ObjectId(id) });
        if (!existing) {
            return res.status(404).json({ message: 'Affirmation not found' });
        }
        if (existing.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this affirmation' });
        }
        
        const result = await db.collection('affirmations').updateOne(
            { _id: new ObjectId(id) },
            { $set: { text: text.trim(), updatedAt: new Date() } }
        );
        
        res.json({ message: 'Affirmation updated successfully', affirmation: { id, text: text.trim() } });
    } catch (error) {
        console.error('Updating affirmation error', error);
        res.status(500).json({ message: 'Updating affirmation failed', error: error.message });
    }
});

// Delete affirmation (protected - only owner can delete)
router.delete(`/:id`, authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const db = await connectDB();
        
        // First check if affirmation exists and belongs to user
        const existing = await db.collection('affirmations').findOne({ _id: new ObjectId(id) });
        if (!existing) {
            return res.status(404).json({ message: 'Affirmation not found' });
        }
        if (existing.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this affirmation' });
        }
        
        await db.collection('affirmations').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Affirmation deleted successfully' });
    } catch (error) {
        console.error('Deleting affirmation error', error);
        res.status(500).json({ message: 'Deleting affirmation failed', error: error.message });
    }
});

module.exports = router;

