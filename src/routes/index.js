const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const employeeRoutes = require('./employee.routes');

router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);

module.exports = router;
