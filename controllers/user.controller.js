import jwt from "jsonwebtoken"
import User from "../models/user.models.js";
import bcrypt from "bcrypt"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js";

export const register = async (req, res) => {
    const body = req.body;

    try {
        if(!body?.name || !body?.email || !body?.password) {
        failedResponse(res, 400, "data invalid")
    }

    const user = await User.findOne({
        email : body.email
    })

    if(user) {
        failedResponse(res, 409, "user already exists")
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
    successResponse(res, 201, "successfully registered", token)

    } catch(err) {
        errorResponse(res, err)
    }
}


export const login = async (req, res)=>{
    try {

       const body = req.body;
     if(!body?.email || !body?.password) {
        failedResponse(res, 400, "invalid data")
    }
    const user = await User.findOne({
        email : body.email
    })

    if(!user) {
        failedResponse(res, 404, "user does not exist, please register")
    }
    const isCorrect = await bcrypt.compare(body.password, user.password)
    if(!isCorrect) {
        failedResponse(res, 400, "invalid credentials")
    }
    const token = jwt.sign({ id : user._id }, process.env.jwtSecret)
    successResponse(res, 200, token, "logged in")

   } catch(err) {
        errorResponse(res, err)
   }

}
