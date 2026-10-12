/**
 * PM2 Production Process Configuration
 * Use for Hostinger VPS, Ubuntu, Debian, or bare-metal Linux servers
 * Run with: pm2 start ecosystem.config.cjs --env production
 */

module.exports = {
  apps: [
    {
      name: 'marketinGlu-obs-broadcast',
      script: './dist/server.js',
      instances: 'max', // Utilizes available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
