/**
 * EmployeeResponseDto - Used for returning employee data to clients
 * This DTO excludes internal fields and formats data appropriately
 */
class EmployeeResponseDto {
  constructor(employee) {
    this.name = employee.name;
    this.email = employee.email;
    this.position = employee.position;
    this.department = employee.department;
    this.salary = employee.salary.toString();
    this.hireDate = employee.hireDate;
    this.createdAt = employee.createdAt;
    this.updatedAt = employee.updatedAt;
  }
}

/**
 * EmployeeDetailResponseDto - Used when returning detailed employee info (includes ID)
 */
class EmployeeDetailResponseDto {
  constructor(employee) {
    this.id = employee.id;
    this.name = employee.name;
    this.email = employee.email;
    this.position = employee.position;
    this.department = employee.department;
    this.salary = employee.salary.toString();
    this.hireDate = employee.hireDate;
    this.createdAt = employee.createdAt;
    this.updatedAt = employee.updatedAt;
  }
}

/**
 * EmployeeListResponseDto - Minimal response for list views (excludes sensitive data like salary)
 */
class EmployeeListResponseDto {
  constructor(employee) {
    this.id = employee.id;
    this.name = employee.name;
    this.email = employee.email;
    this.position = employee.position;
    this.department = employee.department;
  }
}

module.exports = {
  EmployeeResponseDto,
  EmployeeDetailResponseDto,
  EmployeeListResponseDto,
};
