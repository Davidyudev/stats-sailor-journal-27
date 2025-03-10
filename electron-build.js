
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Electron build process...');

// Step 1: Build React app
console.log('📦 Building React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React build completed successfully');
} catch (error) {
  console.error('❌ React build failed:', error);
  process.exit(1);
}

// Step 2: Build Electron app
console.log('📦 Building Electron application...');
try {
  execSync('npx electron-builder build --win --mac --linux', { stdio: 'inherit' });
  console.log('✅ Electron build completed successfully');
  console.log('📂 Installers can be found in the "release" directory');
} catch (error) {
  console.error('❌ Electron build failed:', error);
  process.exit(1);
}

console.log('🎉 Build process completed!');
