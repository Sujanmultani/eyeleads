import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const runCommand = (cmd, cwd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      resolve({ stdout, stderr, code: error ? error.code : 0 });
    });
  });
};

const main = async () => {
  const rootDir = 'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead';
  const logFile = path.join(rootDir, 'backend', 'git_status.txt');
  
  try {
    let logContent = '=== Git Execution Log ===\n\n';
    
    // 1. Git Init
    const initRes = await runCommand('git init', rootDir);
    logContent += `[git init]\nstdout: ${initRes.stdout}\nstderr: ${initRes.stderr}\n\n`;
    
    // 2. Git Add
    const addRes = await runCommand('git add .', rootDir);
    logContent += `[git add .]\nstdout: ${addRes.stdout}\nstderr: ${addRes.stderr}\n\n`;
    
    // 3. Git Status
    const statusRes = await runCommand('git status', rootDir);
    logContent += `[git status]\nstdout: ${statusRes.stdout}\nstderr: ${statusRes.stderr}\n\n`;
    
    fs.writeFileSync(logFile, logContent);
    console.log('SUCCESS: Git initialized and staged. Log written to git_status.txt.');
  } catch (err) {
    fs.writeFileSync(logFile, `ERROR: ${err.message}`);
    console.error('FAILED:', err.message);
  }
};

main();
