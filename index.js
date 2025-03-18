const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

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
    console.log(`Server is running on port ${PORT}`);
})