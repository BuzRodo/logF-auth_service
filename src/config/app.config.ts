import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'logf-auth-service',
  port: parseInt(process.env.APP_PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',
}));
