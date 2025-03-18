const mongoose= require("mongoose");
const Task = require("../models/task.model");

const allTaskController = async (req, res) => {
    try {
        const result = await Task.find({user: req.user.id}).sort({ createdAt: -1 });

        return res.status(200).json({
            status: "ok",
            data: result
        })
    } catch (error) {
        console.error(`Error on allTaskController ${error.stack || error.message}`)
        res.status(500).json({
            status:"error",
            message: "Internal Server Error"
        });
    }
}

// create a task
const createTaskController = async (req, res) => {
    try {
        const {title, description, status, priority} = req.body;

        if (!title || !description  ){
            return res.status(400).json({
                status: "error",
                message: "Please fill all fields"
            })
        }

        const result = await Task.create({
            user: req.user.id,
            title,
            description,
            status,
            priority
        })

        return res.status(201).json({
            status: "ok",
            data: result
        })

    } catch (error) {
        console.error(`Error on createTaskController ${error.stack || error.message}`)
        res.status(500).json({
            status:"error",
            message: "Internal Server Error"
        });
    }
}


// update a task
const updateTaskController = async (req, res) => {
    try {
        const taskId = req.params.id ;
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)){
            return res.status(400).json({
                status: "error",
                message: "Invalid Task ID passed"
            })
        }

        const task = await Task.findOne({_id: taskId, user: req.user.id});
        if (!task) {
            return res.status(400).json({
                status: "error",
                message: "Unauthorized or Task not Found"
            })
        }

        const {title, description, status, priority} = req.body;

        let query = {};
        if (title) query.title = title;
        if (description) query.description = description;
        if (status) query.status = status;
        if (priority) query.priority = priority;   

        if (Object.keys(query).length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Update at least one field"
            });
        }        

        const result = await Task.findByIdAndUpdate(
            taskId,
            {
                $set: query
            },
            {
                new: true
            }
        )

        return res.status(200).json({
            status: "ok",
            message: "Task Updated Successfully",
            data: result
        })

    } catch (error) {
        console.error(`Error on updateTaskController ${error.stack || error.message}`)
        res.status(500).json({
            status:"error",
            message: "Internal Server Error"
        });
    }
}


// delete a task
const deletetaskController = async (req, res) => {
    try {
        const taskId = req.params.id ;
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)){
            return res.status(400).json({
                status: "error",
                message: "Invalid Task ID passed"
            })
        }

        const task = await Task.findOne({_id: taskId, user: req.user.id});
        if (!task) {
            return res.status(400).json({
                status: "error",
                message: "Unauthorized or Task not Found"
            })
        }

        const result = await Task.findByIdAndDelete(taskId)
        return res.status(200).json({
            status: "ok",
            data: result
        })
    } catch (error) {
        console.error(`Error on deletetaskController ${error.stack || error.message}`)
        res.status(500).json({
            status:"error",
            message: "Internal Server Error"
        });
    }
}



module.exports = {
    allTaskController,
    createTaskController,
    deletetaskController,
    updateTaskController
}