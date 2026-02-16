/**
 * JWT Configuration
 * Centralized JWT secret management with validation
 */

export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiration: string;
  refreshExpiration: string;
}

// Validate that JWT secrets are properly configured
const getEnvVar = (name: string, required: boolean = true): string => {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `This is a CRITICAL security configuration. ` +
      `Please check your .env file and ensure ${name} is set to a secure random value.`
    );
  }
  return value || '';
};

// Validate JWT secrets on startup
export const jwtConfig: JWTConfig = {
  secret: getEnvVar('JWT_SECRET'),
  refreshSecret: getEnvVar('REFRESH_TOKEN_SECRET'),
  expiration: process.env.JWT_EXPIRATION || '1h',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
};

// Export individual values for convenience
export const JWT_SECRET = jwtConfig.secret;
export const JWT_REFRESH_SECRET = jwtConfig.refreshSecret;
export const JWT_EXPIRATION = jwtConfig.expiration;
export const JWT_REFRESH_EXPIRATION = jwtConfig.refreshExpiration;

// Security validation - prevent common weak secrets
const validateSecret = (secret: string, name: string): void => {
  const weakSecrets = [
    'your-secret-key',
    'your-super-secret-jwt-key',
    'secret',
    '123456',
    'jwt-secret',
    'change-this'
  ];

  const lowerSecret = secret.toLowerCase();
  const isWeak = weakSecrets.some(weak => lowerSecret.includes(weak));

  if (isWeak) {
    throw new Error(
      `CRITICAL SECURITY WARNING: ${name} is using a weak or default value. ` +
      `Please generate a secure random 256-bit secret using: ` +
      `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
    );
  }

  // Check minimum length (256 bits = 64 hex chars = 32 bytes)
  if (secret.length < 64) {
    throw new Error(
      `CRITICAL SECURITY WARNING: ${name} is too short. ` +
      `Must be at least 64 characters (256 bits). ` +
      `Current length: ${secret.length}`
    );
  }
};

// Validate secrets on module load
validateSecret(jwtConfig.secret, 'JWT_SECRET');
validateSecret(jwtConfig.refreshSecret, 'REFRESH_TOKEN_SECRET');

console.log('✅ JWT Configuration validated successfully');
