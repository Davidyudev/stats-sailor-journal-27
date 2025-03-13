
import { execSync } from 'child_process';
import fs from 'fs';

// Read the current package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Add the electron:build script if it doesn't exist
if (!packageJson.scripts['electron:build']) {
  packageJson.scripts['electron:build'] = 'node electron-build-runner.cjs';
  console.log('Added electron:build script to package.json');
}

// Add the electron:dev script if it doesn't exist
if (!packageJson.scripts['electron:dev']) {
  packageJson.scripts['electron:dev'] = 'node electron-dev.js';
  console.log('Added electron:dev script to package.json');
}
  
// Write the updated package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
console.log('You can now run: npm run electron:dev (for development) or npm run electron:build (for production build)');
