/** Centralized error message constants */
export const ErrorMessages = {
  // Generic / Server
  INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred. Please try again later.',
  BAD_REQUEST: 'Invalid request payload or parameters.',
  VALIDATION_FAILED: 'Validation failed for the submitted data.',

  // Auth
  UNAUTHORIZED: 'Authentication required. Please provide a valid Bearer token.',
  INVALID_TOKEN: 'Invalid or expired access token.',
  FORBIDDEN: 'You do not have permission to perform this action.',

  // Resource / Entity
  NOT_FOUND: 'The requested resource was not found.'
} as const
