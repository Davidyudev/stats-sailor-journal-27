
import { execSync } from 'child_process';
import fs from 'fs';

// Read the current package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Add the electron:build script if it doesn't exist
if (!packageJson.scripts['electron:build']) {
  packageJson.scripts['electron:build'] = 'node electron-build-runner.cjs';
  
  // Write the updated package.json
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  console.log('Added electron:build script to package.json');
}

console.log('You can now run: npm run electron:build');
