import fs from 'fs';

const oldLogo = 'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\frontend\\src\\assets\\logo.jpg';

try {
  if (fs.existsSync(oldLogo)) {
    fs.unlinkSync(oldLogo);
    console.log('Deleted old logo.jpg file.');
  } else {
    console.log('logo.jpg does not exist.');
  }
} catch (err) {
  console.error('Failed to delete logo.jpg:', err.message);
}

// Self-destruct
const selfPath = 'c:\\Users\\sujan\\OneDrive\\Desktop\\eyeleads\\eyelead\\backend\\cleanup_jpg.js';
setTimeout(() => {
  try {
    if (fs.existsSync(selfPath)) {
      fs.unlinkSync(selfPath);
    }
  } catch (err) {}
}, 1000);
