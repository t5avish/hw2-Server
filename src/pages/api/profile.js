import { connectToDatabase } from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';
import { ObjectId } from 'mongodb';
import { URL } from '../../../settings'

const JWT_SECRET = process.env.JWT_SECRET;


const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: URL,
    credentials: true,
  })
);

export default async function handler(req, res) {
  await cors(req, res);

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

  const db = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const height = user.height;
      const weight = user.weight;
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters ** 2)).toFixed(2);

      res.status(200).json({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        age: user.age,
        height: height,
        weight: weight,
        bmi: bmi,
        avatar: user.avatar
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: 'Avatar is required' });
    }

    try {
      await db.collection('users').updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { avatar } }
      );
      res.status(200).json({ message: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Avatar update error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
