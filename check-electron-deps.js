
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Checking electron build dependencies...');

// Check for vite
const vitePath = path.join(__dirname, 'node_modules/vite/bin/vite.js');
if (!fs.existsSync(vitePath)) {
  console.log('Vite not found in node_modules. Checking if it can be accessed globally...');
  try {
    execSync('vite --version', { stdio: 'pipe' });
    console.log('Vite is available globally.');
  } catch (error) {
    console.error('Vite is not installed or not in PATH. Please install it with npm install vite.');
    process.exit(1);
  }
} else {
  console.log('Vite found at:', vitePath);
}

// Check for electron-builder
const electronBuilderPath = path.join(__dirname, 'node_modules/electron-builder/cli/cli.js');
if (!fs.existsSync(electronBuilderPath)) {
  console.log('electron-builder not found in node_modules. Checking if it can be accessed via npx...');
  try {
    execSync('npx electron-builder --version', { stdio: 'pipe' });
    console.log('electron-builder is available via npx.');
  } catch (error) {
    console.error('electron-builder is not installed. Please install it with npm install electron-builder.');
    process.exit(1);
  }
} else {
  console.log('electron-builder found at:', electronBuilderPath);
}

console.log('All dependencies are available for electron build.');
