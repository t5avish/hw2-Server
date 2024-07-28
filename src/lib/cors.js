import Cors from 'cors';
import { URL } from '../../settings'

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  origin: URL,
});

export default cors;
