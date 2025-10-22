#!/usr/bin/env node
// Prebuild script for Decidim documentation
//
// Executes the necessary scripts before building the documentation
//

const { execSync } = require('child_process');

// Executes a script and logs the output
//
// @param {string} scriptPath - The path to the script to execute
function executeScript(scriptPath) {
  console.log("********************************");
  console.log(`Running ${scriptPath}...`);
  console.log("********************************");

  try {
    execSync(`node ${scriptPath}`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    console.log(`\n✓ ${scriptPath} completed successfully\n`);
  } catch (error) {
    console.error(`\n✗ Error executing ${scriptPath}: ${error.message}\n`);
    process.exit(1);
  }
}

(async function() {
  console.log("********************************");
  console.log("Starting prebuild process...");
  console.log("********************************\n");

  // Execute playbook-changer.js
  executeScript("./bin/playbook-changer.js");

  // Execute asset-copier.js
  executeScript("./bin/asset-copier.js");

  console.log("********************************");
  console.log("✓ Prebuild process completed successfully");
  console.log("********************************");
}());

