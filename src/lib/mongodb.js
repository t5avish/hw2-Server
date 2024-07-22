import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://admin:1234@fitnessapp.nc7w2x0.mongodb.net/?retryWrites=true&w=majority&appName=FitnessApp";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to avoid creating multiple connections
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, use the clientPromise directly
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db("FitnessAppDB");
    return db;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Database connection error');
  }
}
