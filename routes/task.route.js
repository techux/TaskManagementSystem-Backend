const express = require('express');

const { allTaskController, createTaskController, deletetaskController, updateTaskController } = require("../controllers/task.controller");

const router = express.Router();

router.get("/", allTaskController)
router.post("/", createTaskController)
router.patch("/:id", updateTaskController)
router.delete("/:id", deletetaskController)



module.exports = router ;
