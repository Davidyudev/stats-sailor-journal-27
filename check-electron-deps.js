
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
  console.log('Vite not found in node_modules. Checking if it can be accessed via npm scripts...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (!packageJson.scripts.build) {
      console.error('No build script found in package.json. Please add a build script.');
      process.exit(1);
    }
    console.log('Build script found in package.json:', packageJson.scripts.build);
  } catch (error) {
    console.error('Error checking build script:', error);
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

// Check for electron
const electronPath = path.join(__dirname, 'node_modules/electron');
if (!fs.existsSync(electronPath)) {
  console.log('electron not found in node_modules. Checking if it can be accessed via npx...');
  try {
    execSync('npx electron --version', { stdio: 'pipe' });
    console.log('electron is available via npx.');
  } catch (error) {
    console.error('electron is not installed. Please install it with npm install electron.');
    process.exit(1);
  }
} else {
  console.log('electron found at:', electronPath);
}

console.log('All dependencies are available for electron build.');
