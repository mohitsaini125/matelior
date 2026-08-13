import mongoose from "mongoose";
import Address from "../models/address.model.js"
import Cart from "../models/cart.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"
import Order from "../models/order.model.js";
import generateOrderNumber from "../utils/orderNumber.js";
import Product from "../models/product.models.js";

//User API controllers

export const createOrder = async (req, res)=> {
    let session;
    try {
        
        const userId = req.user._id
        const addressId = req.body.addressId
        const discountAmount = req.body.discountAmount
        const discountPercent = req.body.discountPercent
        const paymentMethod = req.body.paymentMethod

        session = await mongoose.startSession()
        await session.withTransaction(async ()=> {

        let address;
        if(!addressId) {
            address = await Address.findOne({ user : userId, isDefault : true }).session(session)
        } else{
            address = await Address.findOne({ _id : addressId, user : userId }).session(session)
        }

        const cart = await Cart.findOne({ user : userId }).session(session).populate("items.product")
        if(!cart) {
            return failedResponse(res, 404, "Cart does not exist.")
        }

        if(cart.items.length===0) {
            return failedResponse(res, 404, "Cart is empty.")
        }

        if (!address) {
            return failedResponse(res, 404, "Address does not exist")
        }
        
        const cartItems = cart.items

        for (let i=0; i < cartItems.length; i++) {
            const cartItem = cartItems[i]
            if(cartItem.product.status === "active") {
                if(cartItem.product.stock < cartItem.quantity) {
                        return failedResponse(res, 409, {
                            product : cartItem.product.name,
                            availableStock : cartItem.product.stock,
                            requestedQuantity : cartItem.quantity
                        })
                }
            } else {
                return res.status(404).json({
                    success : false,
                    message : "Product unavailable",
                    data : {
                        product : {
                            name : cartItem.product.name,
                            description : cartItem.product.description
                        }
                    }
                })
            }
        }

        let subtotal = 0;
        for (let i=0; i < cartItems.length; i++) {
            const cartItem = cartItems[i]
            subtotal = subtotal + cartItem.product.price * cartItem.quantity
        }

        if(discountAmount && discountPercent) {
            return failedResponse(res, 400, "Discount can be either amount or percentage.")
        }

        let finalAmount;
        if(discountAmount || discountPercent) {
            if(discountAmount) {
            if(discountAmount > subtotal) {
                return failedResponse(res, 400, "Discount amount cannot be greater than the subtotal amount.")
            }
            finalAmount = subtotal - discountAmount
        }
        if(discountPercent) {
            finalAmount = subtotal * (1 - discountPercent/100)
        }
        } else {
            finalAmount = subtotal
        }


        finalAmount = Number(finalAmount.toFixed(2))

        const shippingCharge = finalAmount > 999 ? 0 : 99

        if(shippingCharge) {
            finalAmount = finalAmount + shippingCharge
        }

        
        const orderItems = []
        for (let i=0; i < cartItems.length; i++) {
            const cartItem = cartItems[i]
            orderItems.push({
                product : cartItem.product._id,
                productName : cartItem.product.name,
                productImage : cartItem.product.images[0],
                productPrice : cartItem.product.price,
                quantity : cartItem.quantity
            })
        }
        
        
            const estimatedDeliveryDate = new Date()
            estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5)
            const orderNumber = await generateOrderNumber(session)

            const order = await Order.create([{
                user : userId,
                orderItems : orderItems,
                subTotal : subtotal,
                discount : {
                    discountPercent : discountPercent,
                    discountAmount : discountAmount
                },
                shippingCharge : shippingCharge,
                totalAmount : finalAmount,
                shippingAddress : {
                    fullName : address.fullName,
                    phone : address.phone,
                    addressLine1 : address.addressLine1,
                    addressLine2 : address.addressLine2,
                    city : address.city,
                    state : address.state,
                    pincode : address.pincode,
                    country : address.country
                },
                payment : {
                    paymentMethod : paymentMethod,
                    paymentStatus : "pending",
                    transactionId : null,
                    paymentGateway : null,
                    paidAt : null
                },
                orderNumber : orderNumber,
                estimatedDeliveryDate : estimatedDeliveryDate
            }], { session })

            for (let i=0; i < cartItems.length; i++) {
            const cartItem = cartItems[i]
            await Product.findOneAndUpdate({
                _id : cartItem.product._id,
                stock : { $gte : cartItem.quantity}
            }, {
                $inc : {
                    stock : -cartItem.quantity
                }
            }, { session })
        }

        cart.items = []
        await cart.save({ session })

            return successResponse(res, 201, "Order created successfully", order[0])
        })
    } catch(err) {
        return errorResponse(res, err)
    } finally {
        if(session) {
            await session.endSession()
        }
    }
}


export const getOrder = async (req, res)=> {
    try {
        const userId = req.user._id
        const { status, sort, order} = req.query
        const sortOptions = {}
        let orderNumber = 1
        if (sort) {
            if(order === "desc") {
                orderNumber = -1
            }
            if(sort === "totalAmount") {
                sortOptions.totalAmount = orderNumber
            } else if (sort === "createdAt") {
                sortOptions.createdAt = orderNumber
            }
        }

        const filter = {
            user : userId
        }

        if(status) filter.orderStatus = status

        const orders = await Order
        .find(filter)
        .sort(sortOptions)
        
        if(orders.length === 0) {
            return failedResponse(res, 404, "No orders placed till now")
        }

        return successResponse(res, 200, "fetched orders", orders)

    } catch(err) {
        return errorResponse(res, err)
    }
}


export const getOrderById = async (req, res)=> {
    try {
        const orderId = req.params.orderId

        const userId = req.user._id
        const order = await Order.findOne({ user : userId, _id : orderId})
        if(!order) {
            return failedResponse(res, 404, "order does not exist")
        }
        return successResponse(res, 200, "Order details fetched", order)

    } catch(err) {
        errorResponse(res, err)
    }
}

export const returnOrder = async (req, res)=> {
    try {
        const orderId = req.params.orderId
        const userId = req.user._id
        const returnReason = req.body.returnReason
        const order = await Order.findOne({ user : userId, _id : orderId })
        if(!order) {
            return failedResponse(res, 404, "order does not exist")
        }
        if(order.returnInformation.status) {
            return failedResponse(res, 409, "return already in process")
        }
        if(order.orderStatus === "delivered") {
            const updatedOrder = await Order.findOneAndUpdate(
                { user : userId, _id : orderId },
                {
                    returnInformation : {
                        reason : returnReason,
                        status : "requested",
                        requestedAt : new Date()
                    },
                },
                { returnDocument : "after" }
            )
            return successResponse(res, 200, "return request sent", updatedOrder)
        }
        return failedResponse(res, 400, "return request not valid (delivered products only !)")
    } catch(err) {
        errorResponse(res, err)
    }
}

export const cancelOrder = async (req, res)=> {
    try {
        const orderId = req.params.orderId
        const userId = req.user._id
        const order = await Order.findOne({ user: userId, _id: orderId })
        if(!order) {
            return failedResponse(res, 404, "order does not exist")
        }
        if(order.orderStatus === "cancelled") {
            return failedResponse(res, 409, "order already cancelled")
        }
        const cancellableStatus = ["pending", "confirmed", "packed"]
        const isCancellable = cancellableStatus.find(s => s === order.orderStatus)
        if(isCancellable) {
            const updatedOrder = await Order.findOneAndUpdate(
                { user: userId, _id: orderId },
                { cancellationInformation : {
                    reason : req.body.cancellationReason,
                    cancelledBy : "user",
                    cancelledAt : new Date()
                },
                orderStatus : "cancelled"
            },
                { returnDocument : "after" }
            )
            return successResponse(res, 200, "order cancelled successfully", updatedOrder)
        }
        return failedResponse(res, 200, "order request not valid")

    } catch(err) {
        return errorResponse(res, err)
    }
}


//Admin API controllers


export const updateOrderStatus = async (req, res)=> {
    try {
        const orderId = req.params.orderId
        const requestedStatus = req.body.orderStatus
        const order = await Order.findById(orderId)
        if(!order) {
            return failedResponse(res, 404, "order does not exist")
        }

        const transitionMap = {
        "pending" : "confirmed",
        "confirmed" : "packed",
        "packed" : "shipped",
        "shipped" : "out for delivery",
        "out for delivery" : "delivered",
        }
        const updateObject = {
        "confirmed" : "confirmedAt",
        "packed" : "packedAt",
        "shipped" : "shippedAt",
        "delivered" : "deliveredAt",
        }

        const currentStatus = order.orderStatus
        const allowedNextStatus = transitionMap[currentStatus]
        const cancellableStatus = ["pending", "confirmed", "packed"]
        if(requestedStatus === "cancelled" && cancellableStatus.includes(currentStatus)) {
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                {
                    orderStatus : "cancelled",
                    cancellationInformation : {
                        reason : req.body.cancelReason,
                        cancelledBy : "admin",
                        cancelledAt : new Date(),
                    }
                },
                {
                    returnDocument : "after"
                }
        )
            return successResponse(res, 200, "order status updated.")
        }

        if(requestedStatus !== allowedNextStatus) {
            return failedResponse(res, 400, "Invalid status transition.")
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus : requestedStatus,
                [updateObject[requestedStatus]] : new Date()
            },
            {
                returnDocument : "after"
            }
        )
        return successResponse(res, 200, "order status updated.")
    } catch(err) {
        return errorResponse(res, err)
    }
}

export const updateReturnStatus = async (req, res)=> {
    try {
        const orderId = req.params.orderId
        const order = await Order.findById(orderId)
        if(!order) {
            return failedResponse(res, 404, "order does not exist")
        }
        if(!order.returnInformation.status) {
            return failedResponse(res, 400, "return request does not exist")
        }
        const statusObj = {
            requested : "approved",
            approved : "picked",
            picked : "completed"
        }

        const updateObject = {
            approved : "approvedAt",
            picked : "pickedAt",
            completed : "completedAt"
        }

        const requestedStatus = req.body.status
        const currentStatus = order.returnInformation.status
        const allowedNextStatus = statusObj[currentStatus]
        if(requestedStatus !== allowedNextStatus) {
            return failedResponse(res, 400, "invalid status transition")
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                "returnInformation.status" : requestedStatus,
                [`returnInformation.${updateObject[requestedStatus]}`] : new Date
            },
            {
                returnDocument : "after"
            }
        )

        if(requestedStatus === "completed") {
            await Order.findByIdAndUpdate(
                orderId,
                {
                    "refundInformation.status" : "processing",
                    "refundInformation.initiatedAt" : new Date()
                }
            )
        }
        return successResponse(res, 200, "return status updated", updatedOrder)

    } catch(err) {
        return errorResponse(res, err)
    }
}


// CUSTOMER APIs

// create order post-> /order            - done
// => create a new order from the user's cart

// get order get-> /Order                - done
// return all the orders of the logged in user (pagination, sort, filter by status)

// get orderById get-> /order/:orderId   - done
// returns complete details of one order

// cancel order patch-> /order/:orderId/cancel   -done
// customers can cancel only if the order is eligible to get cancelled

// request return patch-> /order/:orderId/return   - done
// creates a return request




// ADMIN APIs

// get all orders get-> /admin/order           
// get all the orders in order collection (with pagination, filter, sort, search)

// get order details get-> /admin/order/:orderId
// get all the details of a particular order

// Update order status patch-> /admin/order/:orderId/status (pending -> confirmed -> packed -> shipped -> out for delivery -> delivered)

// refund patch-> /admin/order/:orderId/refund (paymentStatus -> refunded)