const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // baseUrl: "localhost:3000",
    setupNodeEvents(on, config) {
      // e2e testing node events setup code
    },
    experimentalSessionAndOrigin: true
    // setupNodeEvents: require("dd-trace/ci/cypress/plugin"),
    // supportFile: "cypress/support/index.js",
  },
});
