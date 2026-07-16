import fs from 'fs';
import path from 'path';

const filesToDelete = [
  'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\backend\\process_logo.py',
  'c:\\Users\\sujan\\OneDrive\Desktop\\eyeleads\\eyelead\\backend\\run_image_processing.js',
  'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\backend\\start_frontend.js',
  'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\backend\\image_process.log'
];

console.log('Cleaning up temporary backend files...');

filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Deleted: ${file}`);
    }
  } catch (err) {
    console.error(`Failed to delete ${file}:`, err.message);
  }
});

// Self-destruct
const selfPath = 'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\backend\\cleanup.js';
setTimeout(() => {
  try {
    if (fs.existsSync(selfPath)) {
      fs.unlinkSync(selfPath);
      console.log('Cleanup script self-destructed.');
    }
  } catch (err) {
    console.error('Failed to self-destruct cleanup script:', err.message);
  }
}, 1000);
