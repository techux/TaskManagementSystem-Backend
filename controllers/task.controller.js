const mongoose= require("mongoose");
const Task = require("../models/task.model");
const { getCache, setCache, delCache } = require("../utils/redis.util");

const allTaskController = async (req, res) => {
    try {
        let { page = 1, limit = 10 , priority, status} = req.query;
        let skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            page = 1;
            limit = 10;
        }

        // Redis here, agar cache me hai, to yahi se return karo
        const cacheKey = `tasks:${req.user.id}:${page}:${limit}:${priority || "all"}:${status || "all"}`;
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        // =====================================================        

        const totalTasks = await Task.countDocuments({ user: req.user.id});

        let query = {}
        query.user = req.user.id
        if(priority) query.priority = priority;
        if(status) query.status = status;
    

        const result = await Task.find(query).select("-user").sort({ createdAt: -1 }).skip(skip).limit(limit);

        const responseData = {
            status: "ok",
            data: result,
            page,
            limit,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
        }

        await setCache(cacheKey, responseData);
        return res.status(200).json(responseData);

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

        if (!["pending", "completed", undefined].includes(status)){
            return res.status(400).json({
                status: "error",
                message: "Invalid status: must be pending or completed"
            })
        }

        if (!["low", "medium", "high", undefined].includes(priority)){
            return res.status(400).json({
                status: "error",
                message: "Invalid priority: must be low, medium or high"
            })
        }

        const result = await Task.create({
            user: req.user.id,
            title,
            description,
            status,
            priority
        })

        // jab naya task bane, cache clear karo
        await delCache(`tasks:${req.user.id}:*`);

        return res.status(201).json({
            status: "ok",
            message: "Task Added Successfully", 
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
        ).select("-user")

        // task update to clear cache
        await delCache(`tasks:${req.user.id}:*`);

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

        const result = await Task.findByIdAndDelete(taskId).select("-user");

        // task delete hua to clear chache
        await delCache(`tasks:${req.user.id}:*`);

        return res.status(200).json({
            status: "ok",
            message: "Task Deleted Successfully",
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