import { spawn } from 'child_process';
import path from 'path';

console.log('Spawning frontend development server...');
const frontendCwd = 'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\frontend';

const child = spawn('npm', ['run', 'dev'], {
  cwd: frontendCwd,
  shell: true,
  stdio: 'inherit'
});

child.on('error', (err) => {
  console.error('Failed to start frontend server:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Frontend server exited with code ${code} and signal ${signal}`);
});
