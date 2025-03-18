const express = require('express');
require("dotenv").config();
const cors = require("cors");
// const cookieParser = require('cookie-parser')
const dbConnect = require("./utils/dbConnect");

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "Server working properly"
    })
})

app.all("*", (req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Error 404: Resource not found on Server"
    })
})

app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port ${PORT}`);
    dbConnect();
})