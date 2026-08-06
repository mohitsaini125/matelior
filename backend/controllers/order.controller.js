import mongoose from "mongoose";
import Address from "../models/address.model.js"
import Cart from "../models/cart.model.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"
import Order from "../models/order.model.js";
import generateOrderNumber from "../utils/orderNumber.js";
import Product from "../models/product.models.js";

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
        cart.save({ session })

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





// CUSTOMER APIs

// create order post-> /order
// => create a new order from the user's cart

// get order get-> /Order
// return all the orders of the logged in user (pagination, sort, filter by status)

// get orderById get-> /order/:orderId
// returns complete details of one order

// cancel order patch-> /order/:orderId/cancel
// customers can cancel only if the order is eligible to get cancelled

// request return patch-> /order/:orderId/return
// creates a return request




// ADMIN APIs

// get all orders get-> /admin/order
// get all the orders in order collection (with pagination, filter, sort, search)

// get order details get-> /admin/order/:orderId
// get all the details of a particular order

// Update order status patch-> /admin/order/:orderId/status (pending -> confirmed -> packed -> shipped -> out for delivery -> delivered)

// approve or reject return patch-> /admin/order/:orderId/return (requested -> approved or rejected)

// refund patch-> /admin/order/:orderId/refund (paymentStatus -> refunded)