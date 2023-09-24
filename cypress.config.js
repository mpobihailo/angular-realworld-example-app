const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportHeight: 1100,
  viewportWidth: 1400,
  video: false,
  env: {
    username: 'labortempora@mail.com',
    password: 'P@ssword123',
    apiUrl: 'https://api.realworld.io'
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    setupNodeEvents(on, config) {
      const username = process.env.DB_USERNAME;
      const password = process.env.PASSWORD;

      // if(! password) {
      //   throw new Error('missing PASSWORD enviroment variable');
      // }
      config.env = {username, password};
      return config;   
    },
    
    baseUrl: 'https://angular.realworld.io/',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: '**/examples/*',
  },
});