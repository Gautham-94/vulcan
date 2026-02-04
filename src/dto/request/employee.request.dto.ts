import { IRequestDto, IUpdateDto, ValidationResult } from '../../types/common.types';

/**
 * Interface for creating employee data
 */
interface CreateEmployeeData {
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  salary?: number | string;
  hireDate?: string | Date;
}

/**
 * CreateEmployeeRequestDto - Used for creating new employees
 * Contains validation logic and data sanitization
 */
export class CreateEmployeeRequestDto implements IRequestDto {
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  salary?: number;
  hireDate?: Date;

  constructor(data: CreateEmployeeData) {
    this.name = data.name?.trim();
    this.email = data.email?.trim().toLowerCase();
    this.position = data.position?.trim();
    this.department = data.department?.trim();
    this.salary = typeof data.salary === 'string' ? parseFloat(data.salary) : data.salary;
    this.hireDate = data.hireDate ? new Date(data.hireDate) : undefined;
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.name) {
      errors.push('Name is required');
    }

    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (!this.position) {
      errors.push('Position is required');
    }

    if (!this.department) {
      errors.push('Department is required');
    }

    if (!this.salary) {
      errors.push('Salary is required');
    } else if (isNaN(this.salary) || this.salary <= 0) {
      errors.push('Salary must be a positive number');
    }

    if (!this.hireDate) {
      errors.push('Hire date is required');
    } else if (isNaN(this.hireDate.getTime())) {
      errors.push('Invalid hire date format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * UpdateEmployeeRequestDto - Used for updating existing employees
 * All fields are optional
 */
export class UpdateEmployeeRequestDto implements IUpdateDto {
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  salary?: number;
  hireDate?: Date;

  constructor(data: CreateEmployeeData) {
    if (data.name !== undefined) this.name = data.name?.trim();
    if (data.email !== undefined) this.email = data.email?.trim().toLowerCase();
    if (data.position !== undefined) this.position = data.position?.trim();
    if (data.department !== undefined) this.department = data.department?.trim();
    if (data.salary !== undefined) {
      this.salary = typeof data.salary === 'string' ? parseFloat(data.salary) : data.salary;
    }
    if (data.hireDate !== undefined) {
      this.hireDate = new Date(data.hireDate);
    }
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (this.email !== undefined && this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.salary !== undefined && (isNaN(this.salary) || this.salary <= 0)) {
      errors.push('Salary must be a positive number');
    }

    if (this.hireDate !== undefined && isNaN(this.hireDate.getTime())) {
      errors.push('Invalid hire date format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isEmpty(): boolean {
    return Object.keys(this).length === 0;
  }
}
