// Capacitor Node.js configuration
// This embeds the Node.js backend directly into the mobile app

const { CapacitorConfig } = require('@capacitor/cli');

const config = {
  appId: 'com.pixivloader.app',
  appName: 'Pixivloader',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorNodeJS: {
      nodeDir: 'mobile-backend',
      startCommand: 'node server.js'
    }
  }
};

module.exports = config;