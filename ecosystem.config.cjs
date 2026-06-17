module.exports = {
  apps: [
    {
      name: 'devblog',
      // tsx 的 CJS CLI 入口（真正的 JS 文件，PM2 可以 require）
      script: 'node_modules/tsx/dist/cli.cjs',
      args: 'src/index.ts',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
        PORT: '3001'
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '200M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
