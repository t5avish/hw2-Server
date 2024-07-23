export default function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    // Implement any server-side logout logic if needed
  
    res.status(200).json({ message: 'Logged out' });
  }