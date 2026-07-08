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
        const tokenData = jwt.verify(token, process.env.jwtSecret)
        const userId = tokenData.id
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }
        req.user = user
        next();
}