import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index : true
    },
    orderItems : [
        {
            product : {
                type: mongoose.Schema.Types.ObjectId,
                ref : "Product",
                required : true
            },
            productName : {
                type : String,
                trim : true,
                required : true
            },
            productImage : {
                type : String,
                required : true
            },
            productPrice : {
                type : Number,
                required : true
            },
            quantity : {
                type : Number,
                required : true,
                min : 1
            }
        }
    ],
    subTotal : {
        type : Number,
        required : true,
        min : 0
    },
    discount : {
        discountPercent : {
            type : Number,
            default : 0,
            min : 0,
            max : 100
        },
        discountAmount : {
            type : Number,
            default : 0,
            min : 0
        }
    },
    shippingCharge : {
        type : Number,
        default : 0,
        min : 0
    },
    totalAmount : {
        type : Number,
        required : true,
        min : 0
    },
    orderStatus : {
        type : String,
        enum : ["pending", "confirmed", "packed", "shipped", "out for delivery", "delivered", "cancelled", "returned", "refunded"],
        default : "pending",
        index : true
    },
    shippingAddress : {
        fullName : {
            type : String,
            trim : true,
            required : true
        },
        phone : {
            type : String,
            required : true
        },
        addressLine1 : {
            type : String,
            required : true,
            trim : true
        },
        addressLine2 : {
            type : String,
            trim : true
        },
        city : {
            type : String,
            trim : true,
            required : true
        },
        state : {
            type : String,
            trim : true,
            required : true
        },
        pincode : {
            type : String,
            trim : true,
            required : true
        },
        country : {
            type : String,
            required : true,
            trim : true,
            default : "India"
        }
    },
    payment : {
        paymentMethod : {
            type : String,
            enum : ["cod", "upi", "card", "net-banking", "wallet"],
            required : true
        },
        paymentStatus : {
            type : String,
            enum : ["pending", "paid", "failed", "refunded"],
            required : true,
            default : "pending"
        },
        transactionId : {
            type : String,
            trim : true
        },
        paymentGateway : {
            type : String,
            enum : ["razorpay", "stripe", "cash"],
        },
        paidAt : Date
    },
    orderNumber : {
        type : String,
        trim : true,
        required : true,
        unique : true,
        index : true
    },
    cancellationInformation : {
        reason : {
            type : String,
            trim : true
        },
        cancelledBy : {
            type : String,
            enum : ["user", "admin"]
        },
        cancelledAt : Date
    },
    returnInformation : {
        reason : {
            type : String,
            trim : true
        },
        status : {
            type : String,
            enum : ["requested", "approved", "rejected", "picked", "completed"],
        },
        requestedAt : Date,
        approvedAt : Date,
        completedAt : Date
    },
    confirmedAt : {
        type : Date,
        default : null
    },
    estimatedDeliveryDate : {
        type : Date,
        default : null
    },
    packedAt : {
        type : Date,
        default : null
    },
    shippedAt : {
        type : Date,
        default : null
    },
    deliveredAt : {
        type : Date,
        default : null
    },

}, {
    timestamps : true
})

const Order = mongoose.model("Order", orderSchema)

export default Order;