const {
  EmployeeResponseDto,
  EmployeeDetailResponseDto,
  EmployeeListResponseDto,
} = require('../response/employee.response.dto');

/**
 * EmployeeMapper - Utility class for mapping between domain models and DTOs
 * Follows the Single Responsibility Principle
 */
class EmployeeMapper {
  /**
   * Maps a single employee to a response DTO (without ID)
   */
  static toResponseDto(employee) {
    if (!employee) return null;
    return new EmployeeResponseDto(employee);
  }

  /**
   * Maps a single employee to a detailed response DTO (with ID)
   */
  static toDetailResponseDto(employee) {
    if (!employee) return null;
    return new EmployeeDetailResponseDto(employee);
  }

  /**
   * Maps a single employee to a list response DTO (minimal fields)
   */
  static toListResponseDto(employee) {
    if (!employee) return null;
    return new EmployeeListResponseDto(employee);
  }

  /**
   * Maps an array of employees to response DTOs (without ID)
   */
  static toResponseDtoArray(employees) {
    if (!Array.isArray(employees)) return [];
    return employees.map((employee) => this.toResponseDto(employee));
  }

  /**
   * Maps an array of employees to detailed response DTOs (with ID)
   */
  static toDetailResponseDtoArray(employees) {
    if (!Array.isArray(employees)) return [];
    return employees.map((employee) => this.toDetailResponseDto(employee));
  }

  /**
   * Maps an array of employees to list response DTOs (minimal fields)
   */
  static toListResponseDtoArray(employees) {
    if (!Array.isArray(employees)) return [];
    return employees.map((employee) => this.toListResponseDto(employee));
  }
}

module.exports = EmployeeMapper;
