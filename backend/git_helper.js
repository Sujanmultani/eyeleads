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
  const logFile = path.join(rootDir, 'backend', 'git_push_log.txt');
  
  try {
    let logContent = '=== Git Push Execution Log ===\n\n';
    
    // 0. Git Config local identity
    await runCommand('git config user.email "sujanmultani.development@gmail.com"', rootDir);
    await runCommand('git config user.name "Sujanmultani"', rootDir);
    logContent += `[git config user] configured sujanmultani.development@gmail.com / Sujanmultani\n\n`;

    // 1. Stage all files
    const addRes = await runCommand('git add .', rootDir);
    logContent += `[git add .]\nstdout: ${addRes.stdout}\nstderr: ${addRes.stderr}\n\n`;

    // 2. Commit
    const commitRes = await runCommand('git commit -m "Initial commit — EyeLeads website (frontend + backend)"', rootDir);
    logContent += `[git commit]\nstdout: ${commitRes.stdout}\nstderr: ${commitRes.stderr}\n\n`;
    
    // 3. Set branch to main
    const branchRes = await runCommand('git branch -M main', rootDir);
    logContent += `[git branch -M main]\nstdout: ${branchRes.stdout}\nstderr: ${branchRes.stderr}\n\n`;
    
    // 4. Reset remote origin
    await runCommand('git remote remove origin', rootDir);
    const remoteRes = await runCommand('git remote add origin https://github.com/Sujanmultani/eyeleads.git', rootDir);
    logContent += `[git remote add origin]\nstdout: ${remoteRes.stdout}\nstderr: ${remoteRes.stderr}\n\n`;
    
    // 5. Force Push
    const pushRes = await runCommand('git push -f -u origin main', rootDir);
    logContent += `[git push -f -u origin main]\nstdout: ${pushRes.stdout}\nstderr: ${pushRes.stderr}\n\n`;
    
    fs.writeFileSync(logFile, logContent);
    console.log('SUCCESS: Git committed and force pushed. Log written to git_push_log.txt.');
  } catch (err) {
    fs.writeFileSync(logFile, `ERROR: ${err.message}`);
    console.error('FAILED:', err.message);
  }
};

main();
