const Subject = require("../models/subject.model");

/* ================= GET ALL SUBJECTS ================= */
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      subjects
    });
  } catch (err) {
    next(err);
  }
};

/* ================= ADD SUBJECT ================= */
exports.createSubject = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required"
      });
    }

    const subject = await Subject.create({
      user: req.user.id,
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      subject
    });
  } catch (err) {
    // Duplicate subject handling
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Subject already exists"
      });
    }
    next(err);
  }
};

/* ================= DELETE SUBJECT ================= */
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findOneAndDelete({
      _id: id,
      user: req.user.id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    res.json({
      success: true,
      message: "Subject deleted"
    });
  } catch (err) {
    next(err);
  }
};
