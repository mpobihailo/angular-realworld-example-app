const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://angular.realworld.io/',
    setupNodeEvents(on, config) {
      // Add any setup events for Node.js if needed
    }
  },
});