import { authenticate } from '../../lib/authMiddleware';

const handler = (req, res) => {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
};

export default authenticate(handler);