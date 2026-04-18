import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// POST /api/tasks - create task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const task = await Task.create({
      title,
      description,
      owner: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/tasks - get user's tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/tasks/:id - delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (task.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Unauthorized" });

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;