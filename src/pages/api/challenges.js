import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import cors from '../../lib/cors';
import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb package

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

  const db = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const challenges = await db.collection('challenges').find({}).toArray();
      res.status(200).json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, numDays, measurement, goal } = req.body;

      if (!title || !description || numDays === undefined || !measurement || goal === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const result = await db.collection('challenges').insertOne({ title, description, numDays, measurement, goal });

      const newChallenge = result.insertedId ? { _id: result.insertedId, title, description, numDays, measurement, goal } : null;

      res.status(201).json(newChallenge);
    } catch (error) {
      console.error('Error adding new challenge:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

      const { challengeId } = req.body;

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }

      const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });

      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }

      const days = {};
      const today = new Date();
      for (let i = 0; i < challenge.numDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        days[formattedDate] = 0;
      }

      const result = await db.collection('users_challenges').insertOne({
        challenge_id: challenge._id,
        user_id: user._id,
        days: days
      });

      res.status(201).json({ message: 'Joined challenge successfully', data: result.insertedId });
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
