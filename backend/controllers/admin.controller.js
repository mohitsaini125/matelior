import User from "../models/user.models.js";
import Product from "../models/product.models.js";
import Order from "../models/order.model.js";
import Review from "../models/review.models.js";

import {
    successResponse,
    failedResponse,
    errorResponse
} from "../utils/response.js";


// =========================
// Dashboard
// =========================

export const getDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            deliveredOrders,
            revenue
        ] = await Promise.all([
            User.countDocuments(),

            Product.countDocuments({
                status: { $ne: "deleted" }
            }),

            Order.countDocuments(),

            Order.countDocuments({
                orderStatus: { $in: ["pending", "confirmed", "packed"] }
            }),

            Order.countDocuments({
                orderStatus: "delivered"
            }),

            Order.aggregate([
                {
                    $match: {
                        $or: [
                            { "payment.paymentStatus": "paid" },
                            { orderStatus: "delivered" }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ])
        ]);

        return successResponse(
            res,
            200,
            "Dashboard data fetched successfully",
            {
                totalUsers,
                totalProducts,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue: revenue[0]?.total || 0
            }
        );

    } catch (error) {
        console.error("getDashboard:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch dashboard data"
        );
    }
};


// =========================
// USERS
// =========================

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Users fetched successfully",
            users
        );

    } catch (error) {
        console.error("getAllUsers:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch users"
        );
    }
};


export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return failedResponse(
                res,
                404,
                "User not found"
            );
        }

        return successResponse(
            res,
            200,
            "User fetched successfully",
            user
        );

    } catch (error) {
        console.error("getUserById:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch user"
        );
    }
};


// =========================
// PRODUCTS
// =========================

export const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Products fetched successfully",
            products
        );

    } catch (error) {
        console.error("getAdminProducts:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch products"
        );
    }
};


export const updateProductStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;

        if (
            stock === undefined ||
            typeof stock !== "number" ||
            stock < 0
        ) {
            return failedResponse(
                res,
                400,
                "Valid stock is required"
            );
        }

        const product = await Product.findById(
            productId
        );

        if (!product) {
            return failedResponse(
                res,
                404,
                "Product not found"
            );
        }

        product.stock = stock;

        await product.save();

        return successResponse(
            res,
            200,
            "Product stock updated successfully",
            product
        );

    } catch (error) {
        console.error("updateProductStock:", error);

        return errorResponse(
            res,
            500,
            "Failed to update product stock"
        );
    }
};


// =========================
// ORDERS
// =========================

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Orders fetched successfully",
            orders
        );

    } catch (error) {
        console.error("getAllOrders:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch orders"
        );
    }
};


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "out for delivery",
            "delivered",
            "cancelled",
            "returned"
        ];

        if (!allowedStatuses.includes(status)) {
            return failedResponse(
                res,
                400,
                "Invalid order status"
            );
        }

        const order = await Order.findById(
            orderId
        );

        if (!order) {
            return failedResponse(
                res,
                404,
                "Order not found"
            );
        }

        if (order.orderStatus === "cancelled" && status === "cancelled") {
            return failedResponse(res, 400, "Order is already cancelled");
        }

        const prevStatus = order.orderStatus;
        order.orderStatus = status;

        if (status === "cancelled" && prevStatus !== "cancelled") {
            order.cancellationInformation = {
                reason: req.body.cancelReason || "Cancelled by admin",
                cancelledBy: "admin",
                cancelledAt: new Date(),
            };

            // Restore product stock
            if (order.orderItems?.length) {
                for (const item of order.orderItems) {
                    if (item.product) {
                        await Product.findByIdAndUpdate(item.product, {
                            $inc: { stock: item.quantity }
                        });
                    }
                }
            }
        }

        /*
         * Automatically record status timestamps
         * if your Order schema contains these fields.
         */
        const timestampField = {
            confirmed: "confirmedAt",
            packed: "packedAt",
            shipped: "shippedAt",
            "out for delivery": "outForDeliveryAt",
            delivered: "deliveredAt"
        }[status];

        if (timestampField) {
            order[timestampField] = new Date();
        }

        await order.save();

        return successResponse(
            res,
            200,
            "Order status updated successfully",
            order
        );

    } catch (error) {
        console.error("updateOrderStatus:", error);

        return errorResponse(
            res,
            500,
            "Failed to update order status"
        );
    }
};


// =========================
// REVIEWS
// =========================

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name")
            .populate("product", "name")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            200,
            "Reviews fetched successfully",
            reviews
        );

    } catch (error) {
        console.error("getAllReviews:", error);

        return errorResponse(
            res,
            500,
            "Failed to fetch reviews"
        );
    }
};


export const deleteReviewByAdmin = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review =
            await Review.findByIdAndDelete(
                reviewId
            );

        if (!review) {
            return failedResponse(
                res,
                404,
                "Review not found"
            );
        }

        return successResponse(
            res,
            200,
            "Review deleted successfully"
        );

    } catch (error) {
        console.error(
            "deleteReviewByAdmin:",
            error
        );

        return errorResponse(
            res,
            500,
            "Failed to delete review"
        );
    }
};