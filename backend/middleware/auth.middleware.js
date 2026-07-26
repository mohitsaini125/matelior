import User from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { errorResponse, failedResponse } from "../utils/response.js"
export const authMiddleware = async (req, res, next) => {
     const token = req.headers.authorization
     if(!token) {
            failedResponse(res, 401, "Access token not found")
        }

        let tokenData;
        try {
            tokenData = jwt.verify(token, process.env.jwtSecret)
        } catch(err) {
            errorResponse(res, err)
        }

        if(!tokenData) {
            failedResponse(res, 400, "Access token not valid")
        }
        const user = await User.findById(tokenData.id)
        if(!user) {
            failedResponse(res, 404, "User not found")
        }

        req.user = user
        next();
}

export const isAdminMiddleware = async (req, res, next)=>{
    if(req.user.role != 'admin') {
        return res.status(403).json({
            success : false,
            message : "Access denied, admins only"
        })
    } else {
        next()
    }
}