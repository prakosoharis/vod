module.exports = {
  apps: [
    {
      name: 'alkamus-api',
      script: 'apps/api/dist/server.js',
      cwd: '/var/www/alkamus/vod',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: '/var/log/streamkita-api-error.log',
      out_file: '/var/log/streamkita-api-out.log',
      log_file: '/var/log/streamkita-api-combined.log',
      time: true
    },
    {
      name: 'alkamus-web',
      script: 'server.js',
      cwd: '/var/www/alkamus/vod/apps/web',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/streamkita-web-error.log',
      out_file: '/var/log/streamkita-web-out.log',
      log_file: '/var/log/streamkita-web-combined.log',
      time: true
    },
    {
      name: 'alkamus-backoffice',
      script: 'apps/backoffice/server.js',
      cwd: '/var/www/alkamus/vod',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      error_file: '/var/log/streamkita-backoffice-error.log',
      out_file: '/var/log/streamkita-backoffice-out.log',
      log_file: '/var/log/streamkita-backoffice-combined.log',
      time: true
    }
  ]
};
