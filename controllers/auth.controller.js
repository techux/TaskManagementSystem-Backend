const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/user.model");

const loginController = async (req, res) => {
    try {
        const {emailOrUsername, password} = req.body ;
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please enter all fields"
            })
        }
        const user = await User.findOne({
            $or: [
                {email: emailOrUsername},
                {username: emailOrUsername}
            ]
        });

        if (!user){
            return res.status(400).json({
                status: "error",
                message: "Invalid login credentials"
            })
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword){
            return res.status(400).json({
                status: "error",
                message: "Invalid login credentials"
            })
        }

        const accessToken = jwt.sign(
            { 
                id: user._id ,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h",
            }
        )

        return res.status(200).json({
            status:"ok", 
            message:"Logged in Successfully", 
            accessToken,
        })
    } catch (error) {
        console.error(`Error on loginController ${error.stack || error.message}`)
        res.status(500).json({
            status:"error",
            message: "Internal Server Error"
        });
    }
}


const registerController = async (req, res) => {
    try {
        const {name, email, username, password} = req.body ;
        if (!name || !email || !username || !password ) {
            return res.status(400).json({
                status:"error",
                message: "Please fill all the fields"
            })
        }

        const userExist = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        }) ;
        if (userExist) {
            if (userExist.email === email) {
                return res.status(400).json({
                    status: "error",
                    message: "Email already exists"
                });
            }
            if (userExist.username === username) {
                return res.status(400).json({
                    status: "error",
                    message: "Username already exists"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10) ;

        const result = await User.create({
            name, 
            email, 
            username, 
            password: hashedPassword
        }) ;

        return res.status(201).json({
            status: "ok",
            message: "User registered successfull, You may login now",
            userId: result._id
        })
        
    } catch (error) {
        console.error(`Error in registerController : ${error.stack || error.message}`);
        return res.status(500).json({
            status:"error", 
            message: "Internal Server Error" 
        });
    }
}


module.exports = {
    loginController,
    registerController,
}