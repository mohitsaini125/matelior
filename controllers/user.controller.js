import jwt from "jsonwebtoken"
import User from "../models/user.models.js";
import bcrypt from "bcrypt"

export const register = async (req, res) => {
    const body = req.body;

    try {
        if(!body?.name || !body?.email || !body?.password) {
        return res.status(400).json({    //client sent invalid or incomplete data(400)
            success : false,
            message : "data invalid"
        })
    }

    const user = await User.findOne({
        email : body.email
    })

    if(user) {
        return res.status(409).json({       //resource/request conflicts with the existing data
            success : false,
            message : "user already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    body.password = hashedPassword;

    const newUser = await User.create({
        name : body.name,
        email : body.email,
        password : body.password,
        role : "customer"
    });
    const tokenData = {
        id : newUser._id
    }

    const token = jwt.sign(tokenData, process.env.jwtSecret)
    return res.status(201).json({         //a new resource has been created(201)
        success : true,
        message : "successfully registered",
        token : token
    })

    } catch(err) {
        return res.status(500).json({      //the server failed unexpectedly
            success : false,
            message : err.message || "something went wrong"
        })
    }
}


export const login = async (req, res)=>{
    const body = req.body;

   try {
     if(!body?.email || !body?.password) {
        return res.status(400).json({
            success : false,
            message : "invalid data"
        })
    }

    const user = await User.findOne({
        email : body.email
    })

    if(!user) {
        return res.status(404).json({
            success : false,
            message : "user does not exist, please register."
        })
    }

    const isCorrect = await bcrypt.compare(body.password, user.password)
    if(!isCorrect) {
        return res.status(400).json({
            success : false,
            message : "invalid credentials"
        })
    }

    const token = jwt.sign({ id : user._id }, process.env.jwtSecret)

    return res.json({
        success : true,
        message : "logged in",
        token : token
    })
   } catch(err) {
    return res.status(500).json({
        success : false,
        message : err.message || "something went wrong"
    })
   }

}
