const express = require("express");
const router = express.Router();

const {
  getSubjects,
  createSubject,
  deleteSubject
} = require("../controllers/subject.controller");

const { isAuthenticated } = require("../middlewares/auth.middleware");

/* ================= SUBJECT ROUTES ================= */

router.get("/", isAuthenticated, getSubjects);
router.post("/", isAuthenticated, createSubject);
router.delete("/:id", isAuthenticated, deleteSubject);

module.exports = router;
