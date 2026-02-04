import { Request, Response } from 'express';
import employeeService from '../services/employee.service';
import { EmployeeMapper } from '../dto/mapper/employee.mapper';

class EmployeeController {
  /**
   * @swagger
   * /api/employees:
   *   get:
   *     summary: Get all employees (minimal info - excludes salary and ID)
   *     tags: [Employees]
   *     responses:
   *       200:
   *         description: List of all employees with minimal information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                       email:
   *                         type: string
   *                       position:
   *                         type: string
   *                       department:
   *                         type: string
   *       500:
   *         description: Server error
   */
  async getAllEmployees(_req: Request, res: Response): Promise<void> {
    try {
      const employees = await employeeService.getAllEmployees();
      const employeeDtos = EmployeeMapper.toResponseDtoArray(employees);
      res.status(200).json({
        success: true,
        data: employeeDtos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/employees/{id}:
   *   get:
   *     summary: Get employee by ID (detailed info with ID)
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *                     position:
   *                       type: string
   *                     department:
   *                       type: string
   *                     salary:
   *                       type: string
   *                     hireDate:
   *                       type: string
   *                     createdAt:
   *                       type: string
   *                     updatedAt:
   *                       type: string
   *       404:
   *         description: Employee not found
   */
  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employee = await employeeService.getEmployeeById(id!);
      const employeeDto = EmployeeMapper.toDetailResponseDto(employee);
      res.status(200).json({
        success: true,
        data: employeeDto,
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Employee not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * @swagger
   * /api/employees:
   *   post:
   *     summary: Create a new employee (uses Request DTO with validation)
   *     tags: [Employees]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - position
   *               - department
   *               - salary
   *               - hireDate
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 example: john.doe@example.com
   *               position:
   *                 type: string
   *                 example: Software Engineer
   *               department:
   *                 type: string
   *                 example: Engineering
   *               salary:
   *                 type: number
   *                 example: 75000
   *               hireDate:
   *                 type: string
   *                 format: date
   *                 example: 2024-01-15
   *     responses:
   *       201:
   *         description: Employee created successfully (returns detailed info)
   *       400:
   *         description: Bad request - validation failed
   */
  async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employee = await employeeService.createEmployee(req.body);
      const employeeDto = EmployeeMapper.toDetailResponseDto(employee);
      res.status(201).json({
        success: true,
        data: employeeDto,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = errorMessage.includes('required') ||
                         errorMessage.includes('exists') ||
                         errorMessage.includes('Invalid') ||
                         errorMessage.includes('must be') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * @swagger
   * /api/employees/{id}:
   *   put:
   *     summary: Update an employee (uses Update Request DTO with validation)
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               position:
   *                 type: string
   *               department:
   *                 type: string
   *               salary:
   *                 type: number
   *               hireDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Employee updated successfully (returns detailed info)
   *       404:
   *         description: Employee not found
   *       400:
   *         description: Bad request - validation failed
   */
  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const employee = await employeeService.updateEmployee(id!, req.body);
      const employeeDto = EmployeeMapper.toDetailResponseDto(employee);
      res.status(200).json({
        success: true,
        data: employeeDto,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = errorMessage === 'Employee not found' ? 404 :
                         errorMessage.includes('exists') ||
                         errorMessage.includes('Invalid') ||
                         errorMessage.includes('must be') ||
                         errorMessage.includes('No fields') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * @swagger
   * /api/employees/{id}:
   *   delete:
   *     summary: Delete an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Employee deleted successfully
   *       404:
   *         description: Employee not found
   */
  async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await employeeService.deleteEmployee(id!);
      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = errorMessage === 'Employee not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * @swagger
   * /api/employees/department/{department}:
   *   get:
   *     summary: Get employees by department (returns list DTOs)
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: department
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of employees in department
   *       400:
   *         description: Department is required
   */
  async getEmployeesByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const department = Array.isArray(req.params.department) ? req.params.department[0] : req.params.department;
      const employees = await employeeService.getEmployeesByDepartment(department!);
      const employeeDtos = EmployeeMapper.toListResponseDtoArray(employees);
      res.status(200).json({
        success: true,
        data: employeeDtos,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = errorMessage === 'Department is required' ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

export default new EmployeeController();
