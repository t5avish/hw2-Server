import { connectToDatabase } from '../../lib/mongodb';
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: 'http://localhost:3001', // Ensure this matches your frontend URL
    credentials: true,
  })
);

export default async function handler(req, res) {
  console.log('Handler called'); // Debug: Check if the handler is reached

  await cors(req, res);
  console.log('CORS applied'); // Debug: Check if CORS middleware is applied

  if (req.method !== 'GET') {
    console.log('Invalid method:', req.method); // Debug: Log method type
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Connecting to database'); // Debug: Before connecting to the database
    const db = await connectToDatabase();
    console.log('Database connected'); // Debug: After successful connection

    console.log('Fetching challenges'); // Debug: Before fetching challenges
    const challenges = await db.collection('challenges').find({}).toArray();
    console.log('Challenges fetched:', challenges); // Debug: Log fetched challenges

    res.status(200).json(challenges);
  } catch (error) {
    console.error('Failed to fetch challenges:', error); // Debug: Log error details
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
