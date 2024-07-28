
import initMiddleware from '../../lib/init-middleware';  // Adjust path if needed
import { connectToDatabase } from '../../lib/mongodb';   // Adjust path if needed
import { URL } from '../../../settings'
import cors from '../../lib/cors';

export default async function handler(req, res) {
  await new Promise((resolve, reject) => cors(req, res, (result) => (result instanceof Error ? reject(result) : resolve())));

  if (req.method === 'POST') {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      let { firstName, lastName, email, password, age, weight, height, gender } = req.body;

      // Convert email to lowercase for case-insensitive comparison
      email = email.toLowerCase();

      // Check if email already exists in the database
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
      const result = await usersCollection.insertOne({ firstName, lastName, email, password, age, weight, height, gender });
      res.status(200).json({ userId: result.insertedId });
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
