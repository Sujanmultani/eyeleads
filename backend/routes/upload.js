import express from 'express';
import fs from 'fs';
import path from 'path';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadImage, uploadVideo, uploadPrescription, cloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Helper to save a file locally on backend disk and return its local static URL
const saveFileLocally = (file, req) => {
  const uploadsDir = 'uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Clean filename: remove special characters
  const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const filename = `${Date.now()}-${cleanOriginalName}`;
  const filepath = path.join(uploadsDir, filename);

  // Write buffer to local folder
  fs.writeFileSync(filepath, file.buffer);

  // Resolve host address dynamically so it works over LAN networks (e.g. 192.168.29.182:5000)
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';

  return `${protocol}://${host}/uploads/${filename}`;
};

// @desc    Upload user prescription file
// @route   POST /api/upload/prescription
// @access  Public
router.post('/prescription', uploadPrescription.single('prescription'), (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please provide a file under the key "prescription"');
    }

    // Standard fallback mock upload if credentials are empty default placeholders
    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');
    if (isMockCloud) {
      const localUrl = saveFileLocally(req.file, req);
      console.log(`[Upload Local Disk] Prescription saved: ${localUrl}`);

      return res.json({
        status: 'success',
        secure_url: localUrl,
        public_id: `eyeleads_mock_rx_${Date.now()}`
      });
    }

    // Secure upload buffer stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'eyeleads_prescriptions',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          res.status(500);
          return next(new Error(`Cloudinary service failure: ${error.message}`));
        }

        res.json({
          status: 'success',
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    // End stream by writing buffer
    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

// @desc    Upload product video (single)
// @route   POST /api/upload/video
// @access  Private/Admin
router.post('/video', protect, adminOnly, uploadVideo.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please provide a video file under the key "video"');
    }

    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    if (isMockCloud) {
      const localUrl = saveFileLocally(req.file, req);
      console.log(`[Upload Local Disk] Video saved locally: ${localUrl}`);

      return res.json({
        status: 'success',
        url: localUrl
      });
    }

    // Connected to Cloudinary: upload video buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'eyeleads_videos',
        resource_type: 'video',
        quality: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary video upload error:', error);
          res.status(500);
          return next(new Error(`Cloudinary video upload failed: ${error.message}`));
        }

        res.json({
          status: 'success',
          url: result.secure_url
        });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

// @desc    Upload product images (single or multiple)
// @route   POST /api/upload/products
// @access  Private/Admin
router.post('/products', protect, adminOnly, uploadImage.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one image file under the key "images"');
    }

    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    if (isMockCloud) {
      const localUrls = req.files.map(file => saveFileLocally(file, req));
      console.log(`[Upload Local Disk] ${req.files.length} product images saved locally.`);

      return res.json({
        status: 'success',
        urls: localUrls
      });
    }

    // Connected to Cloudinary: upload all buffers asynchronously
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eyeleads_products',
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const secureUrls = await Promise.all(uploadPromises);

    res.json({
      status: 'success',
      urls: secureUrls
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload try-on assets (single or multiple transparent PNGs)
// @route   POST /api/upload/products/tryon
// @access  Private/Admin
router.post('/products/tryon', protect, adminOnly, uploadImage.array('images', 2), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one transparent PNG file under the key "images"');
    }

    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    if (isMockCloud) {
      const localUrls = req.files.map(file => saveFileLocally(file, req));
      console.log(`[Upload Local Disk] ${req.files.length} try-on images saved locally.`);

      return res.json({
        status: 'success',
        urls: localUrls
      });
    }

    // Connected to Cloudinary: upload all buffers asynchronously to dedicated folder
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eyeleads_tryon',
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const secureUrls = await Promise.all(uploadPromises);

    res.json({
      status: 'success',
      urls: secureUrls
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload review images (multiple)
// @route   POST /api/upload/reviews
// @access  Public
router.post('/reviews', uploadImage.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one image file under the key "images"');
    }

    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    if (isMockCloud) {
      const localUrls = req.files.map(file => saveFileLocally(file, req));
      console.log(`[Upload Local Disk] ${req.files.length} review images saved locally.`);
      return res.json({
        status: 'success',
        urls: localUrls
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eyeleads_reviews',
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const secureUrls = await Promise.all(uploadPromises);

    res.json({
      status: 'success',
      urls: secureUrls
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload return evidence images (multiple, max 4)
// @route   POST /api/upload/returns
// @access  Private
router.post('/returns', protect, uploadImage.array('images', 4), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one image file under the key "images"');
    }

    const isMockCloud = !process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

    if (isMockCloud) {
      const localUrls = req.files.map(file => saveFileLocally(file, req));
      console.log(`[Upload Local Disk] ${req.files.length} return images saved locally.`);
      return res.json({
        status: 'success',
        urls: localUrls
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'eyeleads_returns',
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const secureUrls = await Promise.all(uploadPromises);

    res.json({
      status: 'success',
      urls: secureUrls
    });
  } catch (error) {
    next(error);
  }
});

export default router;
