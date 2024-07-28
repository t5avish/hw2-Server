import { connectToDatabase } from '../../lib/mongodb';
import cors from '../../lib/cors';
import initMiddleware from '../../lib/init-middleware';

export default async function handler(req, res) {

  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

  if (req.method === 'GET') {

    try {
      const db = await connectToDatabase();

      const challenges = await db.collection('challenges').find({}).toArray();

      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {

    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const db = await connectToDatabase();

      const result = await db.collection('challenges').insertOne({ title, description });

      // Fix for newer MongoDB drivers: result.ops might not be available
      const newChallenge = result.insertedId ? { _id: result.insertedId, title, description } : null;

      res.status(201).json(newChallenge);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
