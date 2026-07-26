import Cart from "../models/cart.model.js"
import Product from "../models/product.models.js"
import { errorResponse, failedResponse, successResponse } from "../utils/response.js"

export const addToCart = async (req, res)=> {
    try {
        const user = req.user
        const productId = req.params.id
        const item = await Product.findById(productId)
        if(!item) {
            failedResponse(res, 404, "product does not exist")
        }
        if(item.status == "hidden") {
            failedResponse(res, 403, "item is not active")
        }
        if(item.stock == 0) {
            failedResponse(res, 409, "item is sold out")
        }
        const cart = await Cart.findOne({
            user : user._id
        })
        console.log(cart?.user)
        const items = cart?.items
        const inCart = items?.find(v=> v.product.equals(productId))
       if(cart) {
           if(inCart) {
             if(item.stock - inCart.quantity > 0) {
                inCart.quantity = inCart.quantity + 1
                const newItems = items?.map(item=> item.product.toString() == productId ? inCart : item)
                const updatedCart = await cart.updateOne({
                items : newItems
            })
            successResponse(res, 200, "quantity increased by 1")
            } else {
                failedResponse(res, 409, "Insufficient stock")
            }
           } else {
            const createdCart = await cart.updateOne({
                items : [...items, {
                    product : productId,
                    quantity : 1
                }]
            })
            successResponse(res, 200, "product added to cart")
           }
       } else {
            const createdCart = await Cart.create({
                user : user._id,
                items : [{
                    product : productId,
                    quantity : 1
                }]
            })
            successResponse(res, 201, "cart created and product added")
       }
    } catch(err) {
        errorResponse(res, err)
    }
}

export const getCart = async (req, res)=> {
    try {
        
    } catch(err) {
        errorResponse(res, err)
    }
}

export const clearCart = async (req, res)=> {

}

export const deleteCartProduct = async (req, res)=> {

}