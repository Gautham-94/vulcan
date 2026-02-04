const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

router.get('/', employeeController.getAllEmployees.bind(employeeController));
router.get('/:id', employeeController.getEmployeeById.bind(employeeController));
router.post('/', employeeController.createEmployee.bind(employeeController));
router.put('/:id', employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', employeeController.deleteEmployee.bind(employeeController));
router.get('/department/:department', employeeController.getEmployeesByDepartment.bind(employeeController));

module.exports = router;
