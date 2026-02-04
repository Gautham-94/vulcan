/**
 * CreateEmployeeRequestDto - Used for creating new employees
 * Contains validation logic and data sanitization
 */
class CreateEmployeeRequestDto {
  constructor(data) {
    this.name = data.name?.trim();
    this.email = data.email?.trim().toLowerCase();
    this.position = data.position?.trim();
    this.department = data.department?.trim();
    this.salary = data.salary;
    this.hireDate = data.hireDate;
  }

  validate() {
    const errors = [];

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
    } else if (isNaN(Date.parse(this.hireDate))) {
      errors.push('Invalid hire date format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * UpdateEmployeeRequestDto - Used for updating existing employees
 * All fields are optional
 */
class UpdateEmployeeRequestDto {
  constructor(data) {
    if (data.name !== undefined) this.name = data.name?.trim();
    if (data.email !== undefined) this.email = data.email?.trim().toLowerCase();
    if (data.position !== undefined) this.position = data.position?.trim();
    if (data.department !== undefined) this.department = data.department?.trim();
    if (data.salary !== undefined) this.salary = data.salary;
    if (data.hireDate !== undefined) this.hireDate = data.hireDate;
  }

  validate() {
    const errors = [];

    if (this.email !== undefined && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.salary !== undefined && (isNaN(this.salary) || this.salary <= 0)) {
      errors.push('Salary must be a positive number');
    }

    if (this.hireDate !== undefined && isNaN(Date.parse(this.hireDate))) {
      errors.push('Invalid hire date format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isEmpty() {
    return Object.keys(this).length === 0;
  }
}

module.exports = {
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
};
