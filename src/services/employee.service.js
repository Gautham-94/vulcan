const employeeRepository = require('../repositories/employee.repository');
const { CreateEmployeeRequestDto, UpdateEmployeeRequestDto } = require('../dto/request/employee.request.dto');

class EmployeeService {
  async getAllEmployees() {
    return await employeeRepository.findAll();
  }

  async getEmployeeById(id) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  async createEmployee(data) {
    const requestDto = new CreateEmployeeRequestDto(data);

    const validation = requestDto.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingEmployee = await employeeRepository.findByEmail(requestDto.email);
    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    return await employeeRepository.create(requestDto);
  }

  async updateEmployee(id, data) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw new Error('Employee not found');
    }

    const requestDto = new UpdateEmployeeRequestDto(data);

    const validation = requestDto.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (requestDto.isEmpty()) {
      throw new Error('No fields to update');
    }

    if (requestDto.email && requestDto.email !== employee.email) {
      const existingEmployee = await employeeRepository.findByEmail(requestDto.email);
      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
    }

    return await employeeRepository.update(id, requestDto);
  }

  async deleteEmployee(id) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {
      throw new Error('Employee not found');
    }

    return await employeeRepository.delete(id);
  }

  async getEmployeesByDepartment(department) {
    if (!department) {
      throw new Error('Department is required');
    }

    return await employeeRepository.findByDepartment(department);
  }
}

module.exports = new EmployeeService();
