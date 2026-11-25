// PM2 process file for the EventHub backend on EC2.
// Usage: cd backend && pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [{
    name: 'eventhub-backend',
    script: 'server.js',
    cwd: '/home/ubuntu/eventhub/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: { NODE_ENV: 'production', PORT: 5000 },
  }],
};
