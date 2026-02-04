import { Employee } from '@prisma/client';
import {
  EmployeeResponseDto,
  EmployeeDetailResponseDto,
  EmployeeListResponseDto,
} from '../response/employee.response.dto';

/**
 * EmployeeMapper - Utility class for mapping between domain models and DTOs
 * Follows the Single Responsibility Principle
 */
export class EmployeeMapper {
  /**
   * Maps a single employee to a response DTO (without ID)
   */
  static toResponseDto(employee: Employee | null): EmployeeResponseDto | null {
    if (!employee) return null;
    return new EmployeeResponseDto(employee);
  }

  /**
   * Maps a single employee to a detailed response DTO (with ID)
   */
  static toDetailResponseDto(employee: Employee | null): EmployeeDetailResponseDto | null {
    if (!employee) return null;
    return new EmployeeDetailResponseDto(employee);
  }

  /**
   * Maps a single employee to a list response DTO (minimal fields)
   */
  static toListResponseDto(employee: Employee | null): EmployeeListResponseDto | null {
    if (!employee) return null;
    return new EmployeeListResponseDto(employee);
  }

  /**
   * Maps an array of employees to response DTOs (without ID)
   */
  static toResponseDtoArray(employees: Employee[]): EmployeeResponseDto[] {
    if (!Array.isArray(employees)) return [];
    return employees
      .map((employee) => this.toResponseDto(employee))
      .filter((dto): dto is EmployeeResponseDto => dto !== null);
  }

  /**
   * Maps an array of employees to detailed response DTOs (with ID)
   */
  static toDetailResponseDtoArray(employees: Employee[]): EmployeeDetailResponseDto[] {
    if (!Array.isArray(employees)) return [];
    return employees
      .map((employee) => this.toDetailResponseDto(employee))
      .filter((dto): dto is EmployeeDetailResponseDto => dto !== null);
  }

  /**
   * Maps an array of employees to list response DTOs (minimal fields)
   */
  static toListResponseDtoArray(employees: Employee[]): EmployeeListResponseDto[] {
    if (!Array.isArray(employees)) return [];
    return employees
      .map((employee) => this.toListResponseDto(employee))
      .filter((dto): dto is EmployeeListResponseDto => dto !== null);
  }
}
