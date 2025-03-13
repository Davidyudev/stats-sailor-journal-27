
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// This is a CommonJS wrapper that will run our ESM electron-build.js file
console.log('Running Electron build process...');
try {
  // First run the dependency check
  execSync('node check-electron-deps.js', { stdio: 'inherit' });
  // Then run the build script
  execSync('node electron-build.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to run electron build:', error);
  process.exit(1);
}
