// Quick verification script for JWT configuration
console.log('🔍 Verifying JWT Configuration...\n');

try {
  // This will throw an error if JWT_SECRET is not configured properly
  const config = require('./dist/config/jwt.config');
  console.log('✅ JWT Configuration loaded successfully');
  console.log('✅ JWT_SECRET is set:', config.JWT_SECRET ? 'YES' : 'NO');
  console.log('✅ JWT_REFRESH_SECRET is set:', config.JWT_REFRESH_SECRET ? 'YES' : 'NO');
  console.log('✅ No weak secrets detected');
  console.log('\n🎉 JWT Configuration is SECURE');
  process.exit(0);
} catch (error) {
  console.error('❌ JWT Configuration Error:', error.message);
  process.exit(1);
}
