
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the electron directory exists
if (!fs.existsSync('electron')) {
  console.error('Electron directory not found. Make sure you\'re in the correct directory.');
  process.exit(1);
}

// Build steps
console.log('Building the React application...');
try {
  // Use npm run build command instead of directly calling vite
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
