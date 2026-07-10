import User from "../models/user.models.js"
import jwt from "jsonwebtoken"
export const authMiddleware = async (req, res, next) => {
     const token = req.headers.authorization
     
     if(!token) {
         return res.status(401).json({
             success : false,
             message : "Access token not found"
            })
        }
        let tokenData;
        try {
            tokenData = jwt.verify(token, process.env.jwtSecret)
        } catch(err) {
            res.status(500).json({
                message : err.message
            })
        }
        if(!tokenData) {
            return res.json({
                success : false,
                message : "Access token not valid"
            })
        }
        const user = await User.findById(tokenData.id)
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
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