const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents: require("dd-trace/ci/cypress/plugin"),
    supportFile: "cypress/support/index.js",
  },
});
