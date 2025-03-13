
import { spawn } from 'child_process';
import electron from 'electron';
import waitOn from 'wait-on';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting development server...');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], { 
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
});

// Options for wait-on
const waitOnOptions = {
  resources: ['http-get://localhost:8080'],
  timeout: 60000, // 60 seconds timeout
  verbose: true
};

// Wait for dev server to be ready
waitOn(waitOnOptions)
  .then(() => {
    console.log('Dev server is ready, starting Electron...');
    // Start Electron
    const electronProcess = spawn(electron, [path.join(__dirname, 'electron/main.js')], {
      stdio: 'inherit',
      env: { 
        ...process.env,
        ELECTRON_IS_DEV: '1'
      }
    });

    electronProcess.on('close', (code) => {
      console.log(`Electron process exited with code ${code}`);
      viteProcess.kill();
      process.exit(code);
    });
  })
  .catch((err) => {
    console.error('Error waiting for dev server:', err);
    viteProcess.kill();
    process.exit(1);
  });

// Handle process termination
const cleanup = () => {
  console.log('Cleaning up processes...');
  viteProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
