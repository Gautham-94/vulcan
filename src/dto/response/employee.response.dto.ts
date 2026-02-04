import { Employee } from '@prisma/client';

/**
 * EmployeeResponseDto - Used for returning employee data to clients
 * This DTO excludes internal fields and formats data appropriately
 */
export class EmployeeResponseDto {
  name: string;
  email: string;
  position: string;
  department: string;
  salary: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(employee: Employee) {
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
export class EmployeeDetailResponseDto {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(employee: Employee) {
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
export class EmployeeListResponseDto {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;

  constructor(employee: Employee) {
    this.id = employee.id;
    this.name = employee.name;
    this.email = employee.email;
    this.position = employee.position;
    this.department = employee.department;
  }
}
