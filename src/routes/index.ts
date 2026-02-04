import { Router } from 'express';
import userRoutes from './userRoutes';
import employeeRoutes from './employee.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);

export default router;
