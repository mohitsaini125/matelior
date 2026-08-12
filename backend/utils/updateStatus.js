export const updateStatus = async (order, orderStatus)=> {
    const currentStatus = status.find(s => s === order)
    if(order.orderStatus === "pending") {
        if(orderStatus === "confirmed") {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            orderStatus : orderStatus
            }, { returnDocument : "after" })
            return successResponse(res, 200, "order status updated", updatedOrder)
        } else {
            return failedResponse(res, 400, "order is pending, confirmation needed first.")
        }
    }
    if(order.orderStatus === "confirmed") {
        if(orderStatus === "packed") {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            orderStatus : orderStatus
            }, { returnDocument : "after" })
            return successResponse(res, 200, "order status updated", updatedOrder)
        } else {
            return failedResponse(res, 400, "order is to be packed.")
        }
    }
    if(order.orderStatus === "packed") {
        if(orderStatus === "shipped") {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            orderStatus : orderStatus
            }, { returnDocument : "after" })
            return successResponse(res, 200, "order status updated", updatedOrder)
        } else {
            return failedResponse(res, 400, "order needs to be shipped first")
        }
    }
    if(order.orderStatus === "shipped") {
        if(orderStatus === "out for delivery") {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            orderStatus : orderStatus
            }, { returnDocument : "after" })
            return successResponse(res, 200, "order status updated", updatedOrder)
        } else {
            return failedResponse(res, 400, "order first need to be out for delivery.")
        }
    }
    if(order.orderStatus === "out for delivery") {
        if(orderStatus === "delivered") {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            orderStatus : orderStatus
            }, { returnDocument : "after" })
            return successResponse(res, 200, "order status updated", updatedOrder)
        } else {
            return failedResponse(res, 400, "order need to be delivered")
        }
    }
}