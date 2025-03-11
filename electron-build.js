
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the electron directory exists
if (!fs.existsSync('electron')) {
  console.error('Electron directory not found. Make sure you\'re in the correct directory.');
  process.exit(1);
}

// Build steps
console.log('Building the React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the React application:', error);
  process.exit(1);
}

console.log('Building the Electron application...');
try {
  execSync('npx electron-builder build --win', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the Electron application:', error);
  process.exit(1);
}

console.log('Build completed successfully!');
console.log('You can find the installer in the release directory.');
