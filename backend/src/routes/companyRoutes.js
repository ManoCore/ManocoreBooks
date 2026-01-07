const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Organization = require("../models/Organization");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/logos/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo-${req.params.id}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname) {
            return cb(null, true);
        }

        console.error(`[CompanyRoutes] Rejected file: name=${file.originalname}, mimetype=${file.mimetype}`);
        cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
    }
});
// update logo
router.patch("/:id", protect, (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    console.log(`[CompanyRoutes] PATCH /${req.params.id} - Content-Type: ${contentType}`);

    if (contentType.includes("multipart/form-data")) {
        upload.single("logo")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error(`[CompanyRoutes] Multer Error: ${err.message}`);
                return res.status(400).json({ message: `Multer Error: ${err.message}` });
            } else if (err) {
                console.error(`[CompanyRoutes] Upload Error: ${err.message}`);
                return res.status(400).json({ message: err.message });
            }
            console.log(`[CompanyRoutes] Logo uploaded: ${req.file ? req.file.filename : "none"}`);
            next();
        });
    } else {
        console.log(`[CompanyRoutes] JSON body update:`, req.body);
        next();
    }
}, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[CompanyRoutes] Updating organization ID: ${id}`);

        // Ensure the user belongs to this organization
        if (req.user.organizationId.toString() !== id) {
            return res.status(403).json({ message: "Not authorized to update this organization" });
        }

        const updateData = { ...req.body };

        // If a file was uploaded, set the logo path
        if (req.file) {
            // Store relative path
            updateData.logo = `/uploads/logos/${req.file.filename}`;
        }

        // Update organization
        const organization = await Organization.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json({
            success: true,
            message: "Company setup updated successfully",
            organization
        });
    } catch (error) {
        console.error("Update Company Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// get 
router.get("/:id", protect, async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        res.status(200).json({ success: true, organization });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
