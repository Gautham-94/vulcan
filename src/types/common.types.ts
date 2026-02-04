/**
 * Common TypeScript types and interfaces for the application
 */

/**
 * Standard API Response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Request DTO interface - all DTOs should implement validate()
 */
export interface IRequestDto {
  validate(): ValidationResult;
}

/**
 * Update DTO interface - extends request DTO with isEmpty check
 */
export interface IUpdateDto extends IRequestDto {
  isEmpty(): boolean;
}
