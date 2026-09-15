/** Centralized error message constants */
export const ErrorMessages = {
  // Generic / Server
  INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is currently unavailable. Please try again later.',
  BAD_REQUEST: 'Invalid request payload or parameters.',
  VALIDATION_FAILED: 'Validation failed for the submitted data.',

  // Auth
  UNAUTHORIZED: 'Authentication required. Please provide a valid Bearer token.',
  INVALID_TOKEN: 'Invalid or expired access token.',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired. Please log in again.',
  INVALID_REFRESH_TOKEN: 'Invalid or revoked refresh token.',
  INVALID_CREDENTIALS: 'Invalid email address or password.',
  USER_EXISTS: 'A user with this email address already exists.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TOO_MANY_AUTH_ATTEMPTS: 'Too many authentication attempts. Please try again later.',

  // Resource / Entity
  NOT_FOUND: 'The requested resource was not found.',
  TECHNICIAN_NOT_FOUND: 'TeamMember not found or does not belong to your company.',
  USER_NOT_FOUND: 'User associated with this token no longer exists.'
} as const
