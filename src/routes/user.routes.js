const express = require("express");
const router = express.Router();
const { updateProfile, getProfile } = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;