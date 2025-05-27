import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../types/user';
import {
  createOwnerRegistrationRequest,

} from '../controllers/ownerRegistrationController';

const router = express.Router();

// Public route - anyone can submit a registration request
router.post('/', createOwnerRegistrationRequest);

export default router; 