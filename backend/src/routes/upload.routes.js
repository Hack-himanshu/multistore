const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Store the uploaded file in memory (not on disk) — Render's filesystem is temporary anyway
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// ─── POST /api/upload/image ───────────────────────────────────────────────────
// Accepts a single image file (field name: "image"), uploads it to Cloudinary,
// and returns the public URL to store on the product/store document.
router.post('/image', protect, restrictTo('StoreOwner', 'SuperAdmin'), upload.single('image'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided.' });
        }

        // Upload the buffer to Cloudinary using an upload stream
        const uploadFromBuffer = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'multistore', resource_type: 'image' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

        const result = await uploadFromBuffer();

        res.status(200).json({
            success: true,
            url: result.secure_url,
        });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
    }
});

module.exports = router;