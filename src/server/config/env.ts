import dotenv from 'dotenv';

dotenv.config();

export interface ServerConfig {
  env: 'development' | 'production' | 'test';
  isProd: boolean;
  port: number;
  host: string;
  corsOrigin: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  hostinger: {
    host?: string;
    user?: string;
    password?: string;
    database: string;
    port: number;
  };
}

export const config: ServerConfig = {
  env: (process.env.NODE_ENV as any) || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '8000', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_marketinGlu_subsecond',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_live_9842_sky_hd',
  hostinger: {
    host: process.env.HOSTINGER_DB_HOST,
    user: process.env.HOSTINGER_DB_USER,
    password: process.env.HOSTINGER_DB_PASSWORD,
    database: process.env.HOSTINGER_DB_NAME || 'u123456789_broadcast_db',
    port: parseInt(process.env.HOSTINGER_DB_PORT || '3306', 10),
  },
};
