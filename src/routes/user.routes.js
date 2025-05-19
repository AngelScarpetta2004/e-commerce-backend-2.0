const express = require("express");
const router = express.Router();
const { 
  getProfile, 
  updateProfile,
  deleteProfile
} = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Rutas protegidas que requieren autenticación
router.get("/profile", authenticateToken, getProfile);
router.put(
  "/profile",
  authenticateToken,
  upload.single('profileImage'),
  updateProfile
);
router.delete("/profile", authenticateToken, deleteProfile);

module.exports = router;