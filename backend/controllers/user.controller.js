import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import bcrypt from "bcrypt";
import { errorResponse, failedResponse, successResponse } from "../utils/response.js";

export const register = async (req, res) => {
    let { name, email, password, phone } = req.body;

    try {
        if (!name || !email || !password) {
            return failedResponse(res, 400, "invalid data");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return failedResponse(res, 400, "invalid email address")
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if(!strongPasswordRegex.test(password)) {
            return failedResponse(res, 400, "password must be at least 8 characters and include uppercase, lowercase, a number and a special character.")
        }

        if(phone) {
            const phoneRegex = /^\d{10}$/;
            if(!phoneRegex.test(phone)) {
                return failedResponse(res, 400, "invalid phone number")
            }
        }

        const user = await User.findOne({ email })

        if (user) {
            return failedResponse(res, 409, "user already exists");
        }

        password = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password,
            phone
        });

        const token = jwt.sign({ id: newUser._id }, process.env.jwtSecret,{ expiresIn : "7d" });
        
        const userObj = newUser.toObject();
        delete userObj.password;

        return successResponse(res, 201, "successfully registered", {
            token,
            user: userObj
        });

    } catch (err) {
        console.error("user registration error:", err)
        return errorResponse(res, err);
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return failedResponse(res, 400, "invalid data");
        }
        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return failedResponse(res, 404, "User does not exist, please register");
        }

        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) {
            return failedResponse(res, 400, "invalid credentials");
        }
        const token = jwt.sign({ id: user._id }, process.env.jwtSecret, { expiresIn: "7d" });
        const userObj = user.toObject();
        delete userObj.password;

        return successResponse(res, 200, "logged in", {
            token,
            user: userObj
        });

    } catch (err) {
        console.error("login error:", err)
        return errorResponse(res, err);
    }
};

export const getMe = async (req, res) => {
    try {
        const userObj = req.user.toObject();
        return successResponse(res, 200, "user profile", userObj);
    } catch (err) {
        console.error("getMe error:", err);
        return errorResponse(res, err);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        if(name && name.trim().length < 3) return failedResponse(res, 400, "name cannot be less than 3 characters")
        if(name) req.user.name = name.trim();
        
        if(phone && !(/^\d{10}$/).test(phone)) return failedResponse(res, 400, "invalid phone number")
        if(phone) req.user.phone = phone;
        
        await req.user.save()
        const userObj = req.user.toObject();
        return successResponse(res, 200, "profile updated", userObj);
    } catch (err) {
        console.error("updateProfile error:", err);
        return errorResponse(res, err);
    }
};

export const getAllUsersAdmin = async (req, res) => {
    try {
        const { name, role, q, sort, order } = req.query;
        const sortOptions = {}
        const query = {}
        if(sort) {
            const orderNo = order === "desc" ? -1 : 1;
            if(sort === "name") sortOptions.name = orderNo
            else if(sort === "createdAt") sortOptions.createdAt = orderNo
            else if(sort === "email") sortOptions.email = orderNo
            else if(sort === "role") sortOptions.role = orderNo
        }
        if(name) query.name = name
        if(role) query.role = role
        if(q) query.$or = [
            { name : { $regex : q, $options : "i"}},
            { email : { $regex : q, $options : "i"}},
            { phone : { $regex : q, $options : "i"}}
        ]
        const users = await User.find(query).sort(sortOptions);
        return successResponse(res, 200, "all users", users);
    } catch (err) {
        console.error("getAllUsersAdmin error:", err);
        return errorResponse(res, err);
    }
};

export const userDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
        if(!user) return failedResponse(res, 404, "user not found")
        const userObj = user.toObject();
        return successResponse(res, 200, "user details", userObj);
    } catch (err) {
        console.error("getMe error:", err);
        return errorResponse(res, err);
    }
};

export const getUserActivityAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return failedResponse(res, 404, "User not found");
        }

        const [orders, addresses] = await Promise.all([
            Order.find({ user: userId }).sort({ createdAt: -1 }),
            Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }),
        ]);

        const totalSpend = orders
            .filter(o => !["cancelled", "returned"].includes(o.orderStatus))
            .reduce((sum, o) => sum + (o.totalAmount || o.subTotal || 0), 0);

        const analytics = {
            totalOrders: orders.length,
            totalSpend,
            deliveredOrders: orders.filter(o => o.orderStatus === "delivered").length,
            cancelledOrders: orders.filter(o => o.orderStatus === "cancelled").length,
            returnedOrders: orders.filter(o => o.orderStatus === "returned" || o.returnInformation?.status).length,
            pendingOrders: orders.filter(o => ["pending", "confirmed", "packed", "out for delivery"].includes(o.orderStatus)).length,
            lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
        };

        return successResponse(res, 200, "User details and activity fetched", {
            user,
            orders,
            addresses,
            analytics,
        });
    } catch (err) {
        console.error("getUserActivityAdmin error:", err);
        return errorResponse(res, err);
    }
};

export const updateUserRoleSuperAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, password } = req.body;
        if(!role) return failedResponse(res, 400, "Please provide a role");
        if (!["admin", "user"].includes(role)) return failedResponse(res, 400, "Invalid role. Must be 'admin' or'user'")
        if(!password) return failedResponse(res, 400, "password required to update roles")
        
        const user = await User.findById(req.user._id).select("+password")
        const isCorrect = await bcrypt.compare(password, user.password)
        if(!isCorrect) return failedResponse(res, 403, "Unauthorized")

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, select: "-password" }
        );
        if (!updatedUser) return failedResponse(res, 404, "User not found")
        return successResponse(res, 200, `User role updated to ${role}`, updatedUser);
    } catch (err) {
        console.error("updateUserRoleAdmin error:", err);
        return errorResponse(res, err);
    }
};
